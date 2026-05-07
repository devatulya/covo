import {
  andFilter,
  createDocument,
  createDocumentWithId,
  deleteDocument,
  fieldFilter,
  fromDocument,
  getDocument,
  listCollection,
  normalizeCollege,
  runQuery,
} from "./firestoreRest.js";

const PAGE_SIZE = 10;
const userCache = new Map();

function byCreatedAtDesc(a, b) {
  return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

async function getUserProfile(userId, token) {
  if (!userId) return null;
  if (userCache.has(userId)) return userCache.get(userId);
  try {
    const profile = fromDocument(await getDocument(`users/${userId}`, token));
    userCache.set(userId, profile);
    return profile;
  } catch {
    userCache.set(userId, null);
    return null;
  }
}

export async function getProfile({ token, userId }) {
  const profile = await getUserProfile(userId, token);
  if (!profile) {
    const error = new Error("User profile not found");
    error.status = 404;
    throw error;
  }
  return profile;
}

async function getCommentsForPost(postId, token) {
  const comments = await runQuery(token, {
    from: [{ collectionId: "comments" }],
    where: fieldFilter("postId", "EQUAL", postId),
    limit: 100,
  });
  return comments.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
}

async function hydratePost(post, token, userId) {
  const [likes, comments, authorProfile] = await Promise.all([
    listCollection(`posts/${post.id}/likes`, token).catch(() => []),
    getCommentsForPost(post.id, token).catch(() => []),
    !post.isAnonymous && !post.authorName ? getUserProfile(post.userId, token) : Promise.resolve(null),
  ]);

  return {
    ...post,
    authorName: post.authorName || authorProfile?.username || authorProfile?.name || "",
    authorAvatar: post.authorAvatar || authorProfile?.avatar || authorProfile?.profilePic || "",
    isLiked: likes.some((like) => like.id === userId || like.userId === userId),
    likesCount: likes.length,
    commentsCount: comments.length,
  };
}

async function belongsToCollege(post, token, collegeKey) {
  if (!collegeKey) return false;
  if (normalizeCollege(post.collegeKey) === collegeKey) return true;
  if (normalizeCollege(post.college) === collegeKey) return true;

  const authorProfile = await getUserProfile(post.userId, token);
  return normalizeCollege(authorProfile?.college) === collegeKey;
}

export async function getFeed({ token, userId, feed = "global", college = "" }) {
  const baseFilters = [fieldFilter("status", "EQUAL", "approved")];
  const collegeKey = normalizeCollege(college);

  if (feed === "college" && !collegeKey) return [];

  if (feed === "college") {
    const recentApproved = await runQuery(token, {
      from: [{ collectionId: "posts" }],
      where: baseFilters[0],
      orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
      limit: 50,
    });

    const matchingPosts = [];
    for (const post of recentApproved) {
      if (await belongsToCollege(post, token, collegeKey)) {
        matchingPosts.push(post);
      }
      if (matchingPosts.length >= PAGE_SIZE) break;
    }

    return Promise.all(matchingPosts.map((post) => hydratePost(post, token, userId)));
  }

  const normalizedFilters = [...baseFilters];

  const normalizedPosts = await runQuery(token, {
    from: [{ collectionId: "posts" }],
    where: normalizedFilters.length > 1 ? andFilter(normalizedFilters) : normalizedFilters[0],
    orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
    limit: PAGE_SIZE,
  });

  return Promise.all(normalizedPosts.map((post) => hydratePost(post, token, userId)));
}

export async function getPostsByUser({ token, viewerId, profileUserId }) {
  if (!profileUserId) return [];

  const posts = await runQuery(token, {
    from: [{ collectionId: "posts" }],
    where: fieldFilter("userId", "EQUAL", profileUserId),
    limit: 50,
  });

  const approvedPosts = posts
    .filter((post) => post.status === "approved")
    .sort(byCreatedAtDesc)
    .slice(0, 25);

  return Promise.all(approvedPosts.map((post) => hydratePost(post, token, viewerId)));
}

export async function createPost({ token, user, body }) {
  const content = (body.content || "").trim();
  const imageUrl = body.imageUrl || "";
  const isAnonymous = !!body.isAnonymous;
  const category = body.category || "discussion";
  const mediaType = imageUrl ? "image" : "none";

  if (!content) {
    const error = new Error("Content is required");
    error.status = 400;
    throw error;
  }

  if (body.hasImage === true && !imageUrl) {
    const error = new Error("Image URL is required after ImageKit upload");
    error.status = 400;
    throw error;
  }

  const profile = await getUserProfile(user.uid, token);
  const college = profile?.college || user.college || "";
  return createDocument("posts", token, {
    userId: user.uid,
    authorId: user.uid,
    authorName: profile?.username || profile?.name || user.username || user.name || "Anonymous",
    authorAvatar: profile?.avatar || profile?.profilePic || user.avatar || user.profilePic || "",
    authorCollege: college,
    college,
    collegeKey: normalizeCollege(college),
    title: body.title || "",
    content,
    imageUrl,
    image: imageUrl,
    mediaUrl: imageUrl,
    mediaType,
    likesCount: 0,
    commentsCount: 0,
    isFlagged: false,
    category,
    status: isAnonymous ? "pending_review" : "approved",
    isAnonymous,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function setLike({ token, userId, postId, liked }) {
  const path = `posts/${postId}/likes/${userId}`;
  if (liked) {
    await createDocumentWithId(`posts/${postId}/likes`, userId, token, { userId, createdAt: new Date().toISOString() }).catch((error) => {
      if (error.status !== 409) throw error;
    });
  } else {
    await deleteDocument(path, token).catch((error) => {
      if (error.status !== 404) throw error;
    });
  }

  const likes = await listCollection(`posts/${postId}/likes`, token).catch(() => []);
  return { isLiked: liked, likesCount: likes.length };
}

export async function getComments({ token, postId }) {
  const comments = await getCommentsForPost(postId, token);
  return Promise.all(
    comments.map(async (comment) => {
      if (comment.authorName && comment.authorAvatar) return comment;
      const profile = await getUserProfile(comment.userId, token);
      return {
        ...comment,
        authorName: comment.authorName || profile?.username || profile?.name || "",
        authorAvatar: comment.authorAvatar || profile?.avatar || profile?.profilePic || "",
      };
    }),
  );
}

export async function addComment({ token, user, postId, text }) {
  const comment = await createDocument("comments", token, {
    postId,
    userId: user.uid,
    text: text.trim(),
    authorName: user.username || user.name || "Anonymous",
    authorAvatar: user.avatar || user.profilePic || "",
    createdAt: new Date().toISOString(),
  });
  const comments = await getCommentsForPost(postId, token);
  return { comment, commentsCount: comments.length };
}

export async function deletePost({ token, postId }) {
  await deleteDocument(`posts/${postId}`, token);
}

export async function deleteComment({ token, postId, commentId }) {
  await deleteDocument(`comments/${commentId}`, token);
  const comments = await getCommentsForPost(postId, token);
  return { commentsCount: comments.length };
}
