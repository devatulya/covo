const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// To use emulator, set FIRESTORE_EMULATOR_HOST before running this script
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

const app = initializeApp({ projectId: "covo-4eeef" });
const db = getFirestore(app);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  try {
    console.log("=== Testing Like Flow ===");
    // 1. Create a post
    const postRef = await db.collection("posts").add({
      userId: "test-user-1",
      college: "Test Univ",
      text: "Hello from Emulator!",
      category: "discussion",
      isAnonymous: false,
      status: "approved",
      likesCount: 0,
      commentsCount: 0,
      isFlagged: false,
      createdAt: new Date(),
    });
    console.log("Created post:", postRef.id);

    // 2. Add a like
    await postRef.collection("likes").doc("test-liker-1").set({
      userId: "test-liker-1",
      createdAt: new Date(),
    });
    console.log("Added like from test-liker-1");

    // Wait for the function to run (it's async)
    await sleep(2000);

    // 3. Check likesCount
    let postDoc = await postRef.get();
    console.log("likesCount after like:", postDoc.data().likesCount, "(Expected: 1)");

    console.log("=== Testing Unlike Flow ===");
    // 4. Delete the like
    await postRef.collection("likes").doc("test-liker-1").delete();
    console.log("Deleted like from test-liker-1");

    await sleep(2000);

    // 5. Check likesCount
    postDoc = await postRef.get();
    console.log("likesCount after unlike:", postDoc.data().likesCount, "(Expected: 0)");

    console.log("=== Testing Comment Flow ===");
    // 6. Add a comment
    const commentRef = await db.collection("comments").add({
      postId: postRef.id,
      userId: "test-commenter",
      text: "Nice post!",
      createdAt: new Date(),
    });
    console.log("Added comment:", commentRef.id);

    await sleep(2000);

    // 7. Check commentsCount
    postDoc = await postRef.get();
    console.log("commentsCount after comment:", postDoc.data().commentsCount, "(Expected: 1)");

    console.log("=== Testing Delete Cascade ===");
    // Re-add a like so it has something to delete
    await postRef.collection("likes").doc("test-liker-1").set({ userId: "test-liker-1" });
    
    // Create a mock notification for the post
    await db.collection("notifications").add({ postId: postRef.id, type: "comment" });
    
    // 8. Delete the post
    await postRef.delete();
    console.log("Deleted post");

    await sleep(3000);

    // 9. Verify related collections are empty
    const likesSnap = await postRef.collection("likes").get();
    console.log("Remaining likes:", likesSnap.size, "(Expected: 0)");

    const commentsSnap = await db.collection("comments").where("postId", "==", postRef.id).get();
    console.log("Remaining comments:", commentsSnap.size, "(Expected: 0)");

    const notifsSnap = await db.collection("notifications").where("postId", "==", postRef.id).get();
    console.log("Remaining notifications:", notifsSnap.size, "(Expected: 0)");

    console.log("=== TETS COMPLETE ===");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTests();
