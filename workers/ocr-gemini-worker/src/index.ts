export interface Env {
  GEMINI_API_KEY: string;
  GEMINI_API_KEY_2?: string;
  GEMINI_API_KEY_3?: string;
  GEMINI_API_KEYS?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const EXTRACTION_PROMPT = `You are a transcript and grades extraction engine for Bicol University (BU) student portal screenshots.
Extract all enrolled academic courses and their corresponding grades from this image.

Extract every course row into this exact JSON format:
{
  "courses": [
    {
      "code": "e.g. IT 101, GEC 11, PATHFit 1, NSTP 11",
      "name": "e.g. Introduction to Computing",
      "units": 3.0,
      "grade": "e.g. 1.5, 1.75, 2.0, INC, DRP"
    }
  ]
}

Rules:
1. Extract ALL subjects in the table without skipping any row.
2. For non-credit or civic subjects like NSTP 11 or NSTP 12, units must be 0.0.
3. For PATHFit courses, use formatting like "PATHFit 1", "PATHFit 2", etc.
4. If a grade is marked as PASSED but has a numerical rating column (like 1.0 - 3.0), extract the numerical rating as "grade".
5. Return ONLY raw JSON without markdown code fences or conversational text.`;

/**
 * Modern Google Gemini models ordered by quota tier and task size.
 */
function getModelOrder(imageCount?: number): string[] {
  if (typeof imageCount === 'number' && imageCount >= 9) {
    // Large bulk scans (9+ images): start with high-capacity workhorse (1500 RPD)
    return [
      'gemini-1.5-flash',
      'gemini-2.0-flash-lite',
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
    ];
  }
  if (typeof imageCount === 'number' && imageCount >= 4) {
    // Medium multi-semester batches (4-8 images)
    return [
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
    ];
  }
  // Standard / quick scans (1-3 images): start with ultra-fast lite model
  return [
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-2.5-flash',
  ];
}

/**
 * Extracts and deduplicates all configured API keys from environment.
 */
function getAvailableKeys(env: Env): string[] {
  const keys: string[] = [];
  if (env.GEMINI_API_KEY) keys.push(env.GEMINI_API_KEY.trim());
  if (env.GEMINI_API_KEY_2) keys.push(env.GEMINI_API_KEY_2.trim());
  if (env.GEMINI_API_KEY_3) keys.push(env.GEMINI_API_KEY_3.trim());
  if (env.GEMINI_API_KEYS) {
    env.GEMINI_API_KEYS.split(',').forEach((k) => {
      const trimmed = k.trim();
      if (trimmed && !keys.includes(trimmed)) keys.push(trimmed);
    });
  }
  return keys.filter(Boolean);
}

/**
 * Shuffles key list starting point to achieve distributed round-robin across projects.
 */
function rotateKeys(keys: string[]): string[] {
  if (keys.length <= 1) return keys;
  const startIdx = Math.floor(Math.random() * keys.length);
  return [...keys.slice(startIdx), ...keys.slice(0, startIdx)];
}

/**
 * Strips markdown code block wrappers from Gemini output if present.
 */
function cleanAndParseJson(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  return JSON.parse(cleaned);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const availableKeys = getAvailableKeys(env);
    if (availableKeys.length === 0) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the worker.' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const body = (await request.json()) as {
        imageBase64?: string;
        mimeType?: string;
        imageCount?: number;
      };

      if (!body.imageBase64) {
        return new Response(JSON.stringify({ error: 'Missing imageBase64 field' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const mimeType = body.mimeType || 'image/png';
      const cleanBase64 = body.imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

      const modelOrder = getModelOrder(body.imageCount);
      const rotatedKeys = rotateKeys(availableKeys);

      let lastError: { status: number; text: string } | null = null;
      const attemptLogs: string[] = [];

      // Multi-key x Multi-model cascade execution
      for (let kIdx = 0; kIdx < rotatedKeys.length; kIdx++) {
        const apiKey = rotatedKeys[kIdx];

        for (let mIdx = 0; mIdx < modelOrder.length; mIdx++) {
          const model = modelOrder[mIdx];
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          try {
            const geminiResponse = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: EXTRACTION_PROMPT },
                      {
                        inlineData: {
                          mimeType: mimeType,
                          data: cleanBase64,
                        },
                      },
                    ],
                  },
                ],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.1,
                },
              }),
            });

            if (geminiResponse.ok) {
              const data = (await geminiResponse.json()) as any;
              const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

              if (!textOutput) {
                attemptLogs.push(`Key #${kIdx + 1}/${model}: empty candidates`);
                continue;
              }

              const parsed = cleanAndParseJson(textOutput);
              return new Response(JSON.stringify(parsed), {
                headers: {
                  ...CORS_HEADERS,
                  'Content-Type': 'application/json',
                  'X-Gemini-Model': model,
                  'X-Gemini-Key-Slot': `${kIdx + 1} of ${rotatedKeys.length}`,
                  'X-Gemini-Attempts': (attemptLogs.length + 1).toString(),
                },
              });
            }

            const status = geminiResponse.status;
            const errorText = await geminiResponse.text();
            lastError = { status, text: errorText };
            attemptLogs.push(`Key #${kIdx + 1}/${model} (HTTP ${status})`);

            // 400 Bad Request: unrecoverable client image issue, stop immediate retry
            if (status === 400) {
              return new Response(
                JSON.stringify({ error: 'Malformed image payload', details: errorText }),
                { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
              );
            }

            // 403 Forbidden: bad or suspended API key, break to next key immediately
            if (status === 403) {
              break;
            }

            // 429 Quota Exceeded / 503 Overloaded: fall through to next model
          } catch (netErr: any) {
            attemptLogs.push(`Key #${kIdx + 1}/${model} (NetErr: ${netErr.message || 'unknown'})`);
          }
        }
      }

      // If all keys and all models exhausted quota or failed
      return new Response(
        JSON.stringify({
          error: 'All Gemini models in pool exhausted quota or currently unavailable',
          attempts: attemptLogs,
          lastError: lastError ? `${lastError.status}: ${lastError.text}` : 'No response',
        }),
        {
          status: 429,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || 'Internal worker error' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  },
};
