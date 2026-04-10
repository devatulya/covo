/**
 * COVO — Report system Cloud Function
 *
 * Trigger:
 *   onReportCreated → reports/{reportId} onCreate
 *
 * When a report is created, count total reports for the same post.
 * If the count exceeds the threshold, flag the post for admin review.
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { db } = require("./config");

// Configurable via .env - defaults to 5
const REPORT_THRESHOLD = parseInt(process.env.REPORT_THRESHOLD || "5", 10);

exports.onReportCreated = onDocumentCreated(
  "reports/{reportId}",
  async (event) => {
    const reportData = event.data.data();
    const { postId } = reportData;

    if (!postId) {
      console.error("Report created without postId, skipping.");
      return;
    }

    // Count all reports for this post
    const reportsSnapshot = await db
      .collection("reports")
      .where("postId", "==", postId)
      .get();

    const reportCount = reportsSnapshot.size;

    console.log(`Post ${postId} now has ${reportCount} report(s). Threshold: ${REPORT_THRESHOLD}`);

    // Flag the post if reports exceed threshold
    if (reportCount >= REPORT_THRESHOLD) {
      const postRef = db.collection("posts").doc(postId);
      const postDoc = await postRef.get();

      if (!postDoc.exists) {
        console.log(`Post ${postId} no longer exists, skipping flag.`);
        return;
      }

      // Only flag if not already flagged (idempotent)
      if (!postDoc.data().isFlagged) {
        await postRef.update({ isFlagged: true });
        console.log(`Post ${postId} has been flagged for review (${reportCount} reports).`);
      }
    }
  }
);
