/**
 * COVO — Toxic Content Detection
 *
 * Callable Function: checkToxicity
 *
 * Uses HuggingFace Inference API with model:
 *   martin-ha/toxic-comment-model (DistilBERT, public, no gated access)
 *
 * Returns:
 *   { isToxic: boolean, label: string, score: number }
 *
 * Integrated into the post creation flow to block
 * harmful content before it reaches Firestore.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { HfInference } = require("@huggingface/inference");

// Model: DistilBERT fine-tuned on Wikipedia toxic comment dataset
// Public, no gated access, widely used in production
const HF_MODEL = "martin-ha/toxic-comment-model";

// Toxicity score threshold — anything above this is blocked
// Set to 0.60 to catch shorter toxic phrases reliably
const TOXICITY_THRESHOLD = 0.60;

/**
 * checkToxicity — HTTPS Callable Cloud Function
 *
 * Called from the frontend before creating a post.
 * Checks whether the provided text is toxic.
 *
 * Request data: { text: string }
 * Response:     { isToxic: boolean, label: string, score: number, reason: string }
 */
exports.checkToxicity = onCall(async (request) => {
  // Must be authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in to post.");
  }

  const { text, field } = request.data;

  // Validate input
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new HttpsError("invalid-argument", "Post text is required.");
  }

  if (text.trim().length > 5000) {
    throw new HttpsError(
      "invalid-argument",
      "Post text exceeds maximum length of 5000 characters."
    );
  }

  const token = process.env.HF_API_TOKEN;
  if (!token) {
    throw new HttpsError("internal", "Moderation service is not configured.");
  }

  try {
    const fieldLabel = field || 'text';
    const cleanText = text.trim().toLowerCase();
    console.log(
      `[Moderation] Checking ${fieldLabel} by user ${request.auth.uid}, length: ${cleanText.length} chars`
    );

    // ── Layer 1: Keyword Filter (fast, no API call needed) ──────────────────
    // Catches obvious hate/threat phrases the ML model might score low
    const TOXIC_KEYWORDS = [
      'i hate', 'hate you', 'hate everyone', 'hate all',
      'i want to kill', 'kill you', 'kill them', 'kill all',
      'i want to hurt', 'hurt you', 'hurt everyone',
      'stupid idiot', 'you are stupid', 'you are an idiot',
      'go die', 'you should die', 'die you',
      'piece of shit', 'you suck', 'f*** you', 'f**k you',
      'shut up', 'nobody likes you', 'you are worthless',
    ];

    const keywordMatch = TOXIC_KEYWORDS.find((kw) => cleanText.includes(kw));
    if (keywordMatch) {
      console.log(`[Moderation] Layer 1 keyword block: matched "${keywordMatch}" in ${fieldLabel}`);
      return {
        isToxic: true,
        label: 'KEYWORD_MATCH',
        score: 1.0,
        reason: 'Your post contains content that violates our community guidelines.',
      };
    }

    // ── Layer 2: ML Model (catches nuanced toxic content) ───────────────────
    // Initialize HuggingFace client
    const hf = new HfInference(token);

    // Call text classification
    // wait_for_model is an API option (2nd arg), NOT a model parameter
    const result = await hf.textClassification(
      { model: HF_MODEL, inputs: text.trim() },
      { wait_for_model: true }
    );

    console.log("[Moderation] Raw HF response:", JSON.stringify(result));

    if (!result || result.length === 0) {
      throw new Error("Empty response from moderation API");
    }

    // Result is [{ label: "LABEL_0" | "LABEL_1", score: 0.xx }, ...]
    // For martin-ha/toxic-comment-model:
    //   LABEL_0 = non-toxic
    //   LABEL_1 = toxic
    const topResult = result.reduce((a, b) => (a.score > b.score ? a : b));
    const label = topResult.label.toUpperCase();

    // Detect toxic label
    const isToxicLabel =
      label === "LABEL_1" ||
      (label.includes("TOXIC") && !label.includes("NON") && !label.includes("NOT")) ||
      label.includes("HATE") ||
      label.includes("OFFENSIVE");

    const isToxic = isToxicLabel && topResult.score >= TOXICITY_THRESHOLD;

    console.log(
      `[Moderation] Layer 2 ML result: label=${topResult.label}, score=${topResult.score.toFixed(3)}, blocked=${isToxic}`
    );

    return {
      isToxic: !!isToxic,
      label: topResult.label,
      score: topResult.score,
      reason: isToxic
        ? "Your post contains content that violates our community guidelines."
        : null,
    };
  } catch (error) {
    if (error instanceof HttpsError) throw error;

    console.error("[Moderation] Unexpected error:", error.message);
    throw new HttpsError(
      "internal",
      "Content moderation service encountered an error."
    );
  }
});
