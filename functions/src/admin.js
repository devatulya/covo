/**
 * COVO — Admin & Moderation Cloud Functions
 *
 * All functions require admin custom claim (admin: true).
 * Set admin claims using: node scripts/set-admin.js <uid>
 *
 * Functions:
 *   listPendingPosts  → Get all anonymous posts awaiting approval
 *   approvePost       → Approve a pending anonymous post
 *   rejectPost        → Reject and delete a pending anonymous post
 *   getReports        → Get all flagged posts with their reports
 *   adminDeletePost   → Force-delete any post (triggers cascade cleanup)
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { db, FieldValue } = require("./config");
const { createNotification } = require("./notifications");

// ─── Helper: Verify admin access ─────────────────────────────────────────────

function requireAdmin(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }
  if (!request.auth.token.admin) {
    throw new HttpsError("permission-denied", "Admin access required.");
  }
}

// ─── Moderation: Anonymous Post Approval ─────────────────────────────────────

/**
 * Notify admins when a new anonymous post is submitted for review.
 * Trigger: posts/{postId} onCreate (only for pending_review posts)
 */
exports.onAnonymousPostCreated = onDocumentCreated(
  "posts/{postId}",
  async (event) => {
    const postData = event.data.data();
    const { postId } = event.params;

    // Only act on anonymous posts that need review
    if (postData.status !== "pending_review") return;

    console.log(`New anonymous post ${postId} submitted for review.`);
    // Admins will see these via listPendingPosts — no push needed for MVP
  }
);

/**
 * List all posts with status 'pending_review' (anonymous posts awaiting approval).
 */
exports.listPendingPosts = onCall(
  { cors: true },
  async (request) => {
    requireAdmin(request);

    const snapshot = await db
      .collection("posts")
      .where("status", "==", "pending_review")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    return {
      posts: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      })),
      count: snapshot.size,
    };
  }
);

/**
 * Approve a pending anonymous post.
 * Sets status to 'approved' and notifies the post author.
 */
exports.approvePost = onCall(
  { cors: true },
  async (request) => {
    requireAdmin(request);

    const { postId } = request.data || {};
    if (!postId) {
      throw new HttpsError("invalid-argument", "postId is required.");
    }

    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new HttpsError("not-found", "Post not found.");
    }

    const postData = postDoc.data();
    if (postData.status !== "pending_review") {
      throw new HttpsError(
        "failed-precondition",
        `Post is not pending review. Current status: ${postData.status}`
      );
    }

    // Approve the post
    await postRef.update({
      status: "approved",
    });

    // Notify the post author
    await createNotification({
      userId: postData.userId,
      type: "post_approved",
      postId,
      senderId: "admin",
    });

    console.log(`Post ${postId} approved by admin ${request.auth.uid}`);
    return { success: true, postId };
  }
);

/**
 * Reject a pending anonymous post.
 * Notifies the author, then deletes the post (triggers cascade cleanup via onPostDeleted).
 */
exports.rejectPost = onCall(
  { cors: true },
  async (request) => {
    requireAdmin(request);

    const { postId, reason } = request.data || {};
    if (!postId) {
      throw new HttpsError("invalid-argument", "postId is required.");
    }

    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new HttpsError("not-found", "Post not found.");
    }

    const postData = postDoc.data();

    // Notify the author before deletion
    await createNotification({
      userId: postData.userId,
      type: "post_rejected",
      postId,
      senderId: "admin",
    });

    // Delete the post (triggers onPostDeleted cascade)
    await postRef.delete();

    console.log(`Post ${postId} rejected by admin ${request.auth.uid}. Reason: ${reason || "N/A"}`);
    return { success: true, postId };
  }
);

// ─── Report Management ───────────────────────────────────────────────────────

/**
 * Get all flagged posts along with their associated reports.
 */
exports.getReports = onCall(
  { cors: true },
  async (request) => {
    requireAdmin(request);

    // Fetch all flagged posts
    const flaggedPostsSnapshot = await db
      .collection("posts")
      .where("isFlagged", "==", true)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const results = [];

    for (const postDoc of flaggedPostsSnapshot.docs) {
      // Fetch reports for each flagged post
      const reportsSnapshot = await db
        .collection("reports")
        .where("postId", "==", postDoc.id)
        .orderBy("createdAt", "desc")
        .get();

      results.push({
        post: {
          id: postDoc.id,
          ...postDoc.data(),
          createdAt: postDoc.data().createdAt?.toDate?.()?.toISOString() || null,
        },
        reports: reportsSnapshot.docs.map((r) => ({
          id: r.id,
          ...r.data(),
          createdAt: r.data().createdAt?.toDate?.()?.toISOString() || null,
        })),
        reportCount: reportsSnapshot.size,
      });
    }

    return { flaggedPosts: results, count: results.length };
  }
);

/**
 * Admin force-delete any post. Triggers onPostDeleted cascade cleanup.
 */
exports.adminDeletePost = onCall(
  { cors: true },
  async (request) => {
    requireAdmin(request);

    const { postId } = request.data || {};
    if (!postId) {
      throw new HttpsError("invalid-argument", "postId is required.");
    }

    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new HttpsError("not-found", "Post not found.");
    }

    // Delete triggers onPostDeleted cascade
    await postRef.delete();

    console.log(`Post ${postId} force-deleted by admin ${request.auth.uid}`);
    return { success: true, postId };
  }
);
