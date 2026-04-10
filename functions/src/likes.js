/**
 * COVO — Like system Cloud Functions
 *
 * Triggers:
 *   onLikeCreated  → posts/{postId}/likes/{likeUserId} onCreate
 *   onLikeDeleted  → posts/{postId}/likes/{likeUserId} onDelete
 */

const { onDocumentCreated, onDocumentDeleted } = require("firebase-functions/v2/firestore");
const { db } = require("./config");
const { safeCounterUpdate } = require("./helpers");
const { createNotification } = require("./notifications");

/**
 * When a like document is created:
 * 1. Increment likesCount on the parent post (transactional)
 * 2. Send a notification to the post owner (unless they liked their own post)
 */
exports.onLikeCreated = onDocumentCreated(
  "posts/{postId}/likes/{likeUserId}",
  async (event) => {
    const { postId, likeUserId } = event.params;
    const postRef = db.collection("posts").doc(postId);

    // Step 1: Increment likesCount
    await safeCounterUpdate(postRef, "likesCount", 1);

    // Step 2: Notify post owner
    try {
      const postDoc = await postRef.get();
      if (!postDoc.exists) return;

      const postData = postDoc.data();
      const postOwnerId = postData.userId;

      // Don't notify if user liked their own post
      if (likeUserId === postOwnerId) return;

      await createNotification({
        userId: postOwnerId,
        type: "like",
        postId,
        senderId: likeUserId,
      });
    } catch (error) {
      console.error(`Error sending like notification for post ${postId}:`, error.message);
    }
  }
);

/**
 * When a like document is deleted (unlike):
 * Decrement likesCount on the parent post (transactional, clamped to 0)
 */
exports.onLikeDeleted = onDocumentDeleted(
  "posts/{postId}/likes/{likeUserId}",
  async (event) => {
    const { postId } = event.params;
    const postRef = db.collection("posts").doc(postId);

    await safeCounterUpdate(postRef, "likesCount", -1);
  }
);
