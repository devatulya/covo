/**
 * COVO — Comment system Cloud Functions
 *
 * Trigger:
 *   onCommentCreated → comments/{commentId} onCreate
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { db } = require("./config");
const { safeCounterUpdate } = require("./helpers");
const { createNotification } = require("./notifications");

/**
 * When a comment document is created:
 * 1. Increment commentsCount on the referenced post (transactional)
 * 2. Send a notification to the post owner (unless they commented on their own post)
 */
exports.onCommentCreated = onDocumentCreated(
  "comments/{commentId}",
  async (event) => {
    const commentData = event.data.data();
    const { postId, userId: commenterId } = commentData;

    if (!postId) {
      console.error("Comment created without postId, skipping.");
      return;
    }

    const postRef = db.collection("posts").doc(postId);

    // Step 1: Increment commentsCount
    await safeCounterUpdate(postRef, "commentsCount", 1);

    // Step 2: Notify post owner
    try {
      const postDoc = await postRef.get();
      if (!postDoc.exists) return;

      const postData = postDoc.data();
      const postOwnerId = postData.userId;

      // Don't notify if user commented on their own post
      if (commenterId === postOwnerId) return;

      await createNotification({
        userId: postOwnerId,
        type: "comment",
        postId,
        senderId: commenterId,
      });
    } catch (error) {
      console.error(`Error sending comment notification for post ${postId}:`, error.message);
    }
  }
);
