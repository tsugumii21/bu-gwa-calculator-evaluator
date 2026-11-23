export type LottieAssetResult =
  | { ok: true; data: object }
  | { ok: false; reason: 'network' | 'invalid-data' | 'timeout'; cause?: unknown };

const LOAD_TIMEOUT_MS = 4_000;
const assets = new Map<string, object>();
const requests = new Map<string, Promise<LottieAssetResult>>();

/** Reads an already validated animation without starting a request. */
export function getCachedLottieAsset(src: string): object | undefined {
  return assets.get(src);
}

async function fetchAsset(src: string): Promise<LottieAssetResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS);
  try {
    const response = await fetch(src, { signal: controller.signal });
    if (!response.ok) return { ok: false, reason: 'network', cause: response.status };
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || !('layers' in data) || !Array.isArray(data.layers)) {
      return { ok: false, reason: 'invalid-data' };
    }
    return { ok: true, data };
  } catch (cause) {
    return { ok: false, reason: controller.signal.aborted ? 'timeout' : 'network', cause };
  } finally {
    clearTimeout(timeout);
  }
}

/** Deduplicates warm-up and display requests; failures remain retryable. */
export function loadLottieAsset(src: string): Promise<LottieAssetResult> {
  const cached = assets.get(src);
  if (cached) return Promise.resolve({ ok: true, data: cached });
  const pending = requests.get(src);
  if (pending) return pending;
  const request = fetchAsset(src).then(result => {
    requests.delete(src);
    if (result.ok) assets.set(src, result.data);
    return result;
  });
  requests.set(src, request);
  return request;
}
