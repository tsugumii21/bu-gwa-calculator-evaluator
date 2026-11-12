import type { Connect, Plugin } from 'vite';
import { GEMINI_ENDPOINT, LOCAL_GEMINI_ENDPOINT } from '../src/components/ai/gemini-chat';

const LOOPBACK_HOST = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;
const LOOPBACK_ADDRESSES = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
const MAX_REQUEST_BYTES = 64 * 1024;
const UPSTREAM_TIMEOUT_MS = 13_000;

/** Keeps the shared Gemini key on the local Vite server. */
export function localGabay(apiKey: string | undefined): Plugin {
  const install = (server: { middlewares: Connect.Server }) => {
    server.middlewares.use(async (request, response, next) => {
      if (request.url !== LOCAL_GEMINI_ENDPOINT) return next();

      const finish = (status: number) => { response.writeHead(status, { 'Cache-Control': 'no-store' }).end(); };
      const host = request.headers.host ?? '';
      if (!LOOPBACK_HOST.test(host) || !LOOPBACK_ADDRESSES.has(request.socket.remoteAddress ?? '')) return finish(403);
      if (!apiKey) return finish(503);
      if (request.method === 'GET') return finish(204);
      if (request.method !== 'POST') return finish(405);
      if (request.headers.origin !== 'http://' + host && request.headers.origin !== 'https://' + host) return finish(403);
      if (request.headers['content-type'] !== 'application/json') return finish(415);

      try {
        const chunks: Buffer[] = [];
        let size = 0;
        for await (const chunk of request.iterator({ destroyOnReturn: false })) {
          const bytes = Buffer.from(chunk);
          size += bytes.length;
          if (size > MAX_REQUEST_BYTES) return finish(413);
          chunks.push(bytes);
        }

        const upstream = await fetch(GEMINI_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: Buffer.concat(chunks).toString('utf8'),
          redirect: 'error',
          signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        });
        if (!upstream.ok) return finish(upstream.status === 429 ? 429 : 502);

        const reply = await upstream.text();
        response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }).end(reply);
      } catch {
        if (!response.writableEnded) finish(502);
      }
    });
  };
  return { name: 'gabay-local-gemini', configureServer: install, configurePreviewServer: install };
}
