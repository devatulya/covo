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
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { HfInference } = require("@huggingface/inference");

const HF_MODEL = "martin-ha/toxic-comment-model";
const TOXICITY_THRESHOLD = 0.60;

exports.checkToxicity = onCall({ secrets: ["HF_API_TOKEN"] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in to post.");
  }

  const { text, field } = request.data;

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
    const fieldLabel = field || "text";
    const cleanText = text.trim().toLowerCase();
    console.log(
      `[Moderation] Checking ${fieldLabel} by user ${request.auth.uid}, length: ${cleanText.length} chars`
    );

    const TOXIC_KEYWORDS = [
      "i hate", "hate you", "hate everyone", "hate all",
      "i want to kill", "kill you", "kill them", "kill all",
      "i want to hurt", "hurt you", "hurt everyone",
      "stupid idiot", "you are stupid", "you are an idiot",
      "go die", "you should die", "die you",
      "piece of shit", "you suck", "f*** you", "f**k you",
      "shut up", "nobody likes you", "you are worthless",
    ];

    const keywordMatch = TOXIC_KEYWORDS.find((kw) => cleanText.includes(kw));
    if (keywordMatch) {
      console.log(`[Moderation] Layer 1 keyword block: matched "${keywordMatch}" in ${fieldLabel}`);
      return {
        isToxic: true,
        label: "KEYWORD_MATCH",
        score: 1.0,
        reason: "Your post contains content that violates our community guidelines.",
      };
    }

    const hf = new HfInference(token);
    const result = await hf.textClassification(
      { model: HF_MODEL, inputs: text.trim() },
      { wait_for_model: true }
    );

    if (!result || result.length === 0) {
      throw new Error("Empty response from moderation API");
    }

    const topResult = result.reduce((a, b) => (a.score > b.score ? a : b));
    const label = topResult.label.toUpperCase();
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
