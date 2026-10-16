// Bicol University GWA Calculator — Gemini AI Vision Multi-Model OCR Worker (JavaScript)
// Compatible with Cloudflare Dashboard worker.js (Service Worker format)

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

function getModelOrder(imageCount) {
  // Modern models cascade: starts with gemini-3.8-flash recommended by Google,
  // falling back through other available tiers
  return [
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-1.5-flash',
  ];
}

function getAvailableKeys(env) {
  const keys = [];
  const g = typeof globalThis !== 'undefined' ? globalThis : {};
  const k1 = (env && env.GEMINI_API_KEY) || g.GEMINI_API_KEY;
  const k2 = (env && env.GEMINI_API_KEY_2) || g.GEMINI_API_KEY_2;
  const k3 = (env && env.GEMINI_API_KEY_3) || g.GEMINI_API_KEY_3;
  const kAll = (env && env.GEMINI_API_KEYS) || g.GEMINI_API_KEYS;

  if (k1) keys.push(String(k1).trim());
  if (k2) keys.push(String(k2).trim());
  if (k3) keys.push(String(k3).trim());
  if (kAll) {
    String(kAll).split(',').forEach(k => {
      const trimmed = k.trim();
      if (trimmed && !keys.includes(trimmed)) keys.push(trimmed);
    });
  }
  return keys.filter(Boolean);
}

function rotateKeys(keys) {
  if (keys.length <= 1) return keys;
  const startIdx = Math.floor(Math.random() * keys.length);
  return [...keys.slice(startIdx), ...keys.slice(0, startIdx)];
}

function cleanAndParseJson(raw) {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  return JSON.parse(cleaned);
}

async function handleRequest(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const url = new URL(request.url);

  // Diagnostic endpoint to check Google's active model list for this key
  if (request.method === 'GET' && url.pathname === '/models') {
    const keys = getAvailableKeys(env);
    if (keys.length === 0) {
      return new Response(JSON.stringify({ error: 'No API key configured' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keys[0]}`);
    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
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
    const body = await request.json();
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

    let lastError = null;
    const attemptLogs = [];

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
                    { inlineData: { mimeType: mimeType, data: cleanBase64 } },
                  ],
                },
              ],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
            }),
          });

          if (geminiResponse.ok) {
            const data = await geminiResponse.json();
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

          if (status === 400) {
            return new Response(
              JSON.stringify({ error: 'Malformed image payload', details: errorText }),
              { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
            );
          }

          if (status === 403) break;
        } catch (netErr) {
          attemptLogs.push(`Key #${kIdx + 1}/${model} (NetErr: ${netErr.message || 'unknown'})`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        error: 'All Gemini models in pool exhausted quota or currently unavailable',
        attempts: attemptLogs,
        lastError: lastError ? `${lastError.status}: ${lastError.text}` : 'No response',
      }),
      { status: 429, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal worker error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}

// Service Worker format entry listener:
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, null));
});
