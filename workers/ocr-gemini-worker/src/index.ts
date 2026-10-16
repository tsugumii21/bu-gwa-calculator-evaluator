export interface Env {
  GEMINI_API_KEY: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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

    if (!env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the worker.' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const body = (await request.json()) as { imageBase64?: string; mimeType?: string };
      if (!body.imageBase64) {
        return new Response(JSON.stringify({ error: 'Missing imageBase64 field' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const mimeType = body.mimeType || 'image/png';
      // Strip base64 prefix if client sent data URI
      const cleanBase64 = body.imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

      const prompt = `You are a transcript and grades extraction engine for Bicol University (BU) student portal screenshots.
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

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${env.GEMINI_API_KEY}`;

      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
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

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        return new Response(
          JSON.stringify({ error: `Gemini API error: ${geminiResponse.statusText}`, details: errorText }),
          { status: geminiResponse.status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      const data = (await geminiResponse.json()) as any;
      const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textOutput) {
        return new Response(JSON.stringify({ error: 'No content received from Gemini model' }), {
          status: 502,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      // Parse JSON
      const parsed = JSON.parse(textOutput);
      return new Response(JSON.stringify(parsed), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || 'Internal worker error' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  },
};
