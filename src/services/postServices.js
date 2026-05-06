import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";

import { db } from "../config/firebase";

export const createPost = async ({
  user,
  content,
  college,
  category = "discussion",
  mediaUrl = "",
  mediaType = "none",
}) => {
  if (!user) throw new Error("User not logged in");
  if (!content.trim()) throw new Error("Content is required");

  const postData = {
    authorId: user.uid,
    authorName: user.displayName || user.name || "Anonymous",
    authorAvatar: user.photoURL || user.avatar || "",
    authorCollege: college,
    content: content.trim(),
    mediaUrl,
    mediaType,
    college,
    category,
    likes: [],
    comments: [],
    commentsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  export async function deletePost(postId, userId) {
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    throw new Error("Post not found");
  }

  const post = postSnap.data();

  if (post.authorId !== userId) {
    throw new Error("Unauthorized: You can delete only your own post");
  }

  await deleteDoc(postRef);

  return true;
}

  const docRef = await addDoc(collection(db, "posts"), postData);

  return {
    id: docRef.id,
    ...postData,
  };
};



export async function getFeed() {
  const postsRef = collection(db, "posts");

  const q = query(
    postsRef,
    orderBy("createdAt", "desc"),
    limit(10)
  );

  const querySnapshot = await getDocs(q);

  const posts = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return posts;
}

export async function getPostsByCollege(college) {
  const postsRef = collection(db, "posts");

  const q = query(
    postsRef,
    where("college", "==", college),
    orderBy("createdAt", "desc"),
    limit(10)
  );

  const querySnapshot = await getDocs(q);

  const posts = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return posts;
}

export async function likePost(postId, userId) {
  const postRef = doc(db, "posts", postId);

  if(!userId) {
    throw new Error("User not logged in");
  }
  else if(!postId) {
    throw new Error("post not found");
  }

  if(post.likes.includes(userId)) {
    throw new Error("You have already liked this post");
  };
  
  await updateDoc(postRef, {
    likes: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });
}

export async function unlikePost(postId, userId) {
  const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
  if(!postSnap.exists()) {
    throw new Error("Post not found");
  }
  const post = postSnap.data();
  if(!post.likes.includes(userId)) {
    throw new Error("You have not liked this post");
  };

  await updateDoc(postRef, {
    likes: arrayRemove(userId),
    updatedAt: serverTimestamp(),
  });
}

export async function addComment(postId, commentData , userId) {
  const postRef = doc(db, "posts", postId);
  const commentId = `${userId}_${Date.now()}`;

  const comment = {
    id : commentId,
    authorId: userId,
    ...commentData,
    createdAt: new Date().toISOString(),
  };

  await updateDoc(postRef, {
    comments: arrayUnion(comment),
    commentsCount: increment(1),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteComment(postId, commentId, userId) 
{
  const postref = doc(db , "posts", postId);
  const postSnap = await getDoc(postref);

  if(!postSnap.exists()) {
    throw new Error("Post not found");
  }
  const post = postSnap.data();
  const comment = post.comments.find(c => c.id === commentId);
  if(!comment) {
    throw new Error("Comment not found");
  }
  if(comment.authorId !== userId) {
    throw new Error("Unauthorized: You can delete only your own comment");
  }

  await updateDoc(postref, {
    comments: arrayRemove(comment),
    commentsCount: increment(-1),
    updatedAt: serverTimestamp(),
  });
}

export async function getComments(postId) {
  const postRef = doc(db, "posts", postId);
  const postDoc = await getDoc(postRef);

  if (!postDoc.exists()) {
    throw new Error("Post not found");
  }

  return postDoc.data().comments || [];
}