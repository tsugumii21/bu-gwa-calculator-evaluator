const REQUEST_DEADLINE_MS = 15_000;
const MAX_HISTORY_TURNS = 8;
const MODEL = 'gemini-3.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/** One turn shared with the online advisor. Local grade diagnostics stay separate. */
export interface GeminiTurn {
  role: 'user' | 'model';
  text: string;
}

function requestContent({ role, text }: GeminiTurn) {
  const inquiry = text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return { role, parts: [{ text: role === 'user' ? `<student_inquiry>\n${inquiry}\n</student_inquiry>` : text }] };
}

/** Sends only conversation text and handbook context with a finite deadline. */
export async function requestGeminiReply(apiKey: string, systemInstruction: string, history: GeminiTurn[], inquiry: string, signal: AbortSignal): Promise<Response> {
  const recent = history.slice(-MAX_HISTORY_TURNS);
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    signal: AbortSignal.any([signal, AbortSignal.timeout(REQUEST_DEADLINE_MS)]),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [...recent, { role: 'user', text: inquiry } satisfies GeminiTurn].map(requestContent),
      generationConfig: { maxOutputTokens: 700, temperature: 0.25 },
    }),
  });
  if (!response.ok) {
    throw new Error(response.status === 429 ? 'Online advisor quota reached.' : 'Online advisor unavailable.');
  }
  return response;
}

/** Extracts a text answer from a successful provider response. */
export function readGeminiReply(data: unknown): string {
  const result = data as { candidates?: { content?: { parts?: { text?: unknown; thought?: boolean }[] } }[] } | null;
  const parts = result?.candidates?.[0]?.content?.parts;
  const reply = Array.isArray(parts) ? parts.filter(part => part && !part.thought && typeof part.text === 'string')
    .map(part => part.text).join('\n').trim() : '';
  if (!reply) throw new Error('Online advisor returned no answer.');
  return reply;
}
