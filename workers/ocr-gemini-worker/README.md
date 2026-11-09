# Cloudflare Worker — Optional Gemini Image Extraction Proxy

This optional proxy extracts structured courses from permitted, non-sensitive images. Actual student records use the local scanner by default. The proxy makes one provider request using one configured model/key, with a shared 15-second deadline; it does not promise a fixed free quota, uptime, or extraction accuracy.

---

## 🚀 How to Deploy / Update the Worker Code

### Option 1: Via Cloudflare Dashboard (Recommended, 2 Minutes)
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, go to **Workers & Pages** → Select your worker: `bu-gwa-gemini-ocr`.
3. Click the **Edit code** button (top right).
4. Select all existing code in the editor and replace it with the contents of [`workers/ocr-gemini-worker/src/index.ts`](./src/index.ts).
5. Click **Deploy** (or **Save and Deploy**).

---

## 🔑 How to Configure the Optional Service

Quotas in Google AI Studio are enforced **per model, per Google project**.
Multiple keys in one project do not increase that project's quota. Do not create key/project cascades to evade limits; inspect current account/model limits in AI Studio. Unpaid Gemini terms prohibit submitting sensitive, confidential, or personal information: https://ai.google.dev/gemini-api/terms.

### Setting Secrets in Cloudflare Dashboard:
1. In your Worker's dashboard, go to **Settings** → **Variables and Secrets**.
2. Under **Worker Secrets**, add or edit the following:

| Secret Name | Required? | Description |
|---|---|---|
| `GEMINI_API_KEY` | **Required** | API Key from your Primary Google AI Studio Project |
| `GEMINI_API_KEY_2` | Legacy fallback | Used only if no earlier configured key exists; never rotated after quota failure |
| `GEMINI_API_KEY_3` | Legacy fallback | Used only if no earlier configured key exists; never rotated after quota failure |
| `GEMINI_API_KEYS` | Legacy fallback | First nonempty key is used only if no earlier configured key exists |
| `GEMINI_MODEL` | Optional | Supported account model ID; defaults to `gemini-3.8-flash`. Verify free-tier access before use |

3. Click **Save and Deploy**.

---

## ⚡ Bounded Extraction and Review

When an explicitly permitted image is submitted:

1. **One key**: Select the first configured key. Keep it in Worker secrets, never in client code or request URLs.
2. **Input validation**:
   - Accept PNG/JPEG/WebP MIME types only, with matching file signatures and valid base64.
   - Limit decoded bytes to 10 MiB; bound streamed JSON and provider response sizes.
   - Treat image text as data rather than instructions. Return nullable unknowns, not invented grades/units.
3. **Bounded execution**:
   - The shared 15-second budget includes body reading and the provider request/response; abort on expiry.
   - A 429 ends this request. Configuration failures, malformed outputs and unavailable providers produce stable safe error codes.
   - No retries, key rotation, automatic paid upgrade, raw provider error bodies, or personal-image logging.

Structured JSON guarantees shape, not factual correctness. The client must stage, validate, and let the user correct every extracted course before importing it. No source image or grade should be sent to a provider during automated tests.

Run mocked Worker tests from the repository root: `npx.cmd vitest run --root . workers/ocr-gemini-worker/src/__tests__/index.test.ts`.
This directory is excluded by the current main ESLint config and TypeScript app build; check Worker types separately when modifying it. No deployment was performed as part of the reliability implementation.
