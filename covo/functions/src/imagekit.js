/**
 * COVO — ImageKit authentication signature generator
 *
 * Provides a callable Cloud Function that returns upload authentication
 * parameters (token, expire, signature) for client-side ImageKit uploads.
 *
 * The frontend calls this before uploading an image to get secure credentials.
 * The actual upload goes directly from client → ImageKit (no server relay).
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { ImageKit } = require("@imagekit/nodejs");

// Lazy-init ImageKit instance (reused across invocations in the same instance)
let imagekitInstance = null;

function getImageKit() {
  if (!imagekitInstance) {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new HttpsError(
        "failed-precondition",
        "ImageKit credentials not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env"
      );
    }

    imagekitInstance = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
  }

  return imagekitInstance;
}

/**
 * Callable function: generateImageKitAuth
 *
 * Requires: authenticated user
 * Returns: { token, expire, signature }
 */
exports.generateImageKitAuth = onCall(
  { cors: true },
  async (request) => {
    // Ensure user is authenticated
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to upload images."
      );
    }

    try {
      const imagekit = getImageKit();
      const authParams = imagekit.helper.getAuthenticationParameters();

      return {
        token: authParams.token,
        expire: authParams.expire,
        signature: authParams.signature,
      };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      console.error("ImageKit auth error:", error.message);
      throw new HttpsError("internal", "Failed to generate upload credentials.");
    }
  }
);
