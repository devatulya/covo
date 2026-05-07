/**
 * COVO — Post deletion cascade Cloud Function
 *
 * Trigger:
 *   onPostDeleted → posts/{postId} onDelete
 *
 * When a post is deleted, clean up all related data:
 * - Likes subcollection
 * - Comments
 * - Reports
 * - Notifications
 */

const { onDocumentDeleted } = require("firebase-functions/v2/firestore");
const { db } = require("./config");
const { deleteQueryBatch } = require("./helpers");

exports.onPostDeleted = onDocumentDeleted(
  "posts/{postId}",
  async (event) => {
    const { postId } = event.params;

    console.log(`Post ${postId} deleted. Starting cascade cleanup...`);

    const cleanupTasks = [];

    // 1. Delete all likes in the subcollection
    const likesRef = db.collection("posts").doc(postId).collection("likes");
    cleanupTasks.push(
      deleteQueryBatch(likesRef).then((count) =>
        console.log(`Deleted ${count} likes for post ${postId}`)
      )
    );

    // 2. Delete all comments referencing this post
    const commentsQuery = db.collection("comments").where("postId", "==", postId);
    cleanupTasks.push(
      deleteQueryBatch(commentsQuery).then((count) =>
        console.log(`Deleted ${count} comments for post ${postId}`)
      )
    );

    // 3. Delete all reports referencing this post
    const reportsQuery = db.collection("reports").where("postId", "==", postId);
    cleanupTasks.push(
      deleteQueryBatch(reportsQuery).then((count) =>
        console.log(`Deleted ${count} reports for post ${postId}`)
      )
    );

    // 4. Delete all notifications referencing this post
    const notificationsQuery = db.collection("notifications").where("postId", "==", postId);
    cleanupTasks.push(
      deleteQueryBatch(notificationsQuery).then((count) =>
        console.log(`Deleted ${count} notifications for post ${postId}`)
      )
    );

    // Run all cleanup tasks in parallel
    await Promise.all(cleanupTasks);

    console.log(`Cascade cleanup complete for post ${postId}`);
  }
);
