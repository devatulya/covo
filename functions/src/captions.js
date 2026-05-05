/**
 * COVO — AI Caption Assistant
 *
 * Callable function: generateCaptionSuggestions
 *
 * Accepts { text, category, college } from the frontend and returns
 * three caption variants plus a set of hashtags, powered by Gemini 2.0 Flash.
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_TONE = {
  meme:       'funny, absurd, self-aware, internet-culture-savvy',
  rant:       'raw, unfiltered, relatable frustration with a dash of dark humour',
  event:      'energetic, hype-building, FOMO-inducing',
  discussion: 'thought-provoking, conversational, slightly witty',
};

function buildPrompt({ text, category, college }) {
  const tone = CATEGORY_TONE[category] || 'casual and relatable';
  const collegeLine = college ? `The user attends ${college}.` : '';

  return `
You are a witty campus social media assistant for COVO, a college-only social network.
${collegeLine}
The user is writing a "${category}" post with this draft caption:
"""
${text || '(no draft yet — suggest a cold-start caption for this category)'}
"""

Your task:
1. Write exactly 3 short, punchy caption alternatives (max 240 chars each). Tone: ${tone}.
2. Suggest exactly 8 relevant hashtags (no # prefix, comma-separated).

Rules:
- Keep it campus-life flavoured and relatable to college students.
- Do NOT use emojis inside the captions (hashtag section can have one).
- Do NOT number the captions — just write them.
- Return ONLY valid JSON matching this exact schema, nothing else:

{
  "captions": ["caption1", "caption2", "caption3"],
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"]
}
`.trim();
}

// ── Cloud Function ─────────────────────────────────────────────────────────────

exports.generateCaptionSuggestions = onCall(
  { enforceAppCheck: false },
  async (request) => {
    // Auth guard — must be a signed-in COVO user
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in to use the AI assistant.');
    }

    const { text = '', category = 'discussion', college = '' } = request.data ?? {};

    // Basic input validation
    if (typeof text !== 'string' || text.length > 500) {
      throw new HttpsError('invalid-argument', 'text must be a string under 500 characters.');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError('internal', 'Gemini API key is not configured.');
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = buildPrompt({ text, category, college });
      const result = await model.generateContent(prompt);
      const raw = result.response.text().trim();

      // Strip markdown code fences if Gemini wraps the JSON in them
      const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        console.error('Gemini returned non-JSON:', raw);
        throw new HttpsError('internal', 'AI returned an unexpected format. Please try again.');
      }

      // Validate shape
      if (
        !Array.isArray(parsed.captions) ||
        !Array.isArray(parsed.hashtags) ||
        parsed.captions.length === 0
      ) {
        throw new HttpsError('internal', 'AI response did not match expected schema.');
      }

      return {
        captions:  parsed.captions.slice(0, 3),
        hashtags:  parsed.hashtags.slice(0, 8),
      };
    } catch (err) {
      // Re-throw HttpsErrors as-is
      if (err instanceof HttpsError) throw err;
      console.error('generateCaptionSuggestions error:', err);
      throw new HttpsError('internal', 'Failed to generate suggestions. Please try again.');
    }
  },
);
