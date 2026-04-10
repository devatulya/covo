/**
 * COVO — Cloud Functions Entry Point
 *
 * Re-exports all Cloud Function modules.
 * Firebase CLI discovers and deploys all exports from this file.
 *
 * Function naming convention:
 *   - Firestore triggers: on{Event}{Collection}  (e.g., onLikeCreated)
 *   - Callable functions: {actionName}            (e.g., generateImageKitAuth)
 */

// ─── Firestore Triggers ──────────────────────────────────────────────────────

// Like system
const { onLikeCreated, onLikeDeleted } = require("./src/likes");
exports.onLikeCreated = onLikeCreated;
exports.onLikeDeleted = onLikeDeleted;

// Comment system
const { onCommentCreated } = require("./src/comments");
exports.onCommentCreated = onCommentCreated;

// Post cleanup (cascade delete)
const { onPostDeleted } = require("./src/posts");
exports.onPostDeleted = onPostDeleted;

// Report flagging
const { onReportCreated } = require("./src/reports");
exports.onReportCreated = onReportCreated;

// ─── HTTPS Callable Functions ────────────────────────────────────────────────

// ImageKit upload authentication
const { generateImageKitAuth } = require("./src/imagekit");
exports.generateImageKitAuth = generateImageKitAuth;

// Admin & Moderation
const {
  onAnonymousPostCreated,
  listPendingPosts,
  approvePost,
  rejectPost,
  getReports,
  adminDeletePost,
} = require("./src/admin");
exports.onAnonymousPostCreated = onAnonymousPostCreated;
exports.listPendingPosts = listPendingPosts;
exports.approvePost = approvePost;
exports.rejectPost = rejectPost;
exports.getReports = getReports;
exports.adminDeletePost = adminDeletePost;
