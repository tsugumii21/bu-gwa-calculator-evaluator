# Cloudflare Worker — Gemini AI Vision Multi-Model OCR Proxy

This Cloudflare Worker powers the Screenshot OCR in the **BU GWA Calculator**, cascading across 4 modern Google Gemini vision models and multiple API keys to provide **4,250 to 12,750+ free daily scans** with zero downtime.

---

## 🚀 How to Deploy / Update the Worker Code

### Option 1: Via Cloudflare Dashboard (Recommended, 2 Minutes)
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, go to **Workers & Pages** → Select your worker: `bu-gwa-gemini-ocr`.
3. Click the **Edit code** button (top right).
4. Select all existing code in the editor and replace it with the contents of [`workers/ocr-gemini-worker/src/index.ts`](./src/index.ts).
5. Click **Deploy** (or **Save and Deploy**).

---

## 🔑 How to Configure API Keys & Scale Quota

Quotas in Google AI Studio are enforced **per model, per Google project**.
Adding keys from separate Google projects multiplies your daily quota.

### Setting Secrets in Cloudflare Dashboard:
1. In your Worker's dashboard, go to **Settings** → **Variables and Secrets**.
2. Under **Worker Secrets**, add or edit the following:

| Secret Name | Required? | Description |
|---|---|---|
| `GEMINI_API_KEY` | **Required** | API Key from your Primary Google AI Studio Project |
| `GEMINI_API_KEY_2` | *Optional* | API Key from a 2nd Google AI Studio Project (+4,250 daily scans) |
| `GEMINI_API_KEY_3` | *Optional* | API Key from a 3rd Google AI Studio Project (+4,250 daily scans) |
| `GEMINI_API_KEYS` | *Optional* | Alternatively, a single comma-separated list of keys (`key1,key2,key3`) |

3. Click **Save and Deploy**.

---

## ⚡ How the Multi-Model Cascade Works

Whenever a student uploads a screenshot:

1. **Key Rotation**: The worker rotates the starting API key using random distributed selection, balancing load evenly across all your Google Cloud projects.
2. **Task Routing**:
   - **1–3 images**: Starts with `gemini-2.5-flash-lite` (fastest response, 1,000 scans/day/project).
   - **4–8 images**: Starts with `gemini-2.0-flash-lite` (1,500 scans/day/project).
   - **9+ images**: Starts with `gemini-1.5-flash` (1,500 scans/day/project).
3. **Automatic Fallback on Rate Limit (429 / 503)**:
   - If Model 1 hits quota limit (429), it immediately cascades to Model 2, then Model 3, then Model 4.
   - If all models under Key 1 hit 429, it cascades to Key 2, then Key 3.
   - If all keys and models are exhausted, it returns a 429, prompting the frontend to seamlessly activate the local offline Tesseract.js engine.
