/**
 * COVO — Notification system
 * Creates Firestore notification documents and sends FCM push notifications.
 */

const { db, messaging, FieldValue } = require("./config");

/**
 * Creates a notification document and sends an FCM push to the receiver.
 *
 * @param {Object} params
 * @param {string} params.userId - Receiver's UID
 * @param {string} params.type - Notification type: 'like', 'comment', 'event', 'post_approved', 'post_rejected'
 * @param {string} params.postId - Related post ID
 * @param {string} params.senderId - Sender's UID (or 'admin' / 'system')
 */
async function createNotification({ userId, type, postId, senderId }) {
  // Never notify yourself
  if (userId === senderId) return;

  // Create the notification document in Firestore
  const notifRef = db.collection("notifications").doc();
  await notifRef.set({
    userId,
    type,
    postId,
    senderId,
    isRead: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  // Attempt to send FCM push notification
  await sendPush(userId, type, postId);
}

/**
 * Sends an FCM push notification to all of a user's registered devices.
 * Automatically cleans up invalid/expired tokens.
 *
 * @param {string} userId - Receiver's UID
 * @param {string} type - Notification type
 * @param {string} postId - Related post ID
 */
async function sendPush(userId, type, postId) {
  try {
    // Fetch all FCM tokens from the user's subcollection
    const tokensSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("fcmTokens")
      .get();

    if (tokensSnapshot.empty) return;

    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);
    if (tokens.length === 0) return;

    const { title, body } = getNotificationContent(type);

    const message = {
      notification: { title, body },
      data: { type, postId },
      tokens,
    };

    const response = await messaging.sendEachForMulticast(message);

    // Clean up invalid/expired tokens
    const tokensToDelete = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error?.code;
        if (
          errorCode === "messaging/invalid-registration-token" ||
          errorCode === "messaging/registration-token-not-registered"
        ) {
          tokensToDelete.push(tokensSnapshot.docs[idx].ref.delete());
        }
      }
    });

    if (tokensToDelete.length > 0) {
      await Promise.all(tokensToDelete);
      console.log(`Cleaned up ${tokensToDelete.length} invalid FCM tokens for user ${userId}`);
    }
  } catch (error) {
    // FCM failures should not break the main flow
    console.error(`FCM push failed for user ${userId}:`, error.message);
  }
}

/**
 * Returns the notification title and body based on the type.
 */
function getNotificationContent(type) {
  switch (type) {
    case "like":
      return { title: "New Like ❤️", body: "Someone liked your post!" };
    case "comment":
      return { title: "New Comment 💬", body: "Someone commented on your post!" };
    case "event":
      return { title: "New Event 🎉", body: "A new event has been posted in your college!" };
    case "post_approved":
      return { title: "Post Approved ✅", body: "Your anonymous post has been approved and is now live!" };
    case "post_rejected":
      return { title: "Post Rejected ❌", body: "Your anonymous post was not approved by the moderators." };
    default:
      return { title: "COVO", body: "You have a new notification." };
  }
}

module.exports = { createNotification, sendPush };
