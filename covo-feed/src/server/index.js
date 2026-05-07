import "dotenv/config";
import crypto from "crypto";
import cors from "cors";
import express from "express";
import ImageKit from "imagekit";
import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  getComments,
  getFeed,
  getPostsByUser,
  getProfile,
  setLike,
} from "../services/feedService.js";
import { requireAuth } from "../services/firestoreRest.js";

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: FRONTEND_ORIGINS }));
app.use(express.json({ limit: "12mb" }));

const requiredEnv = [
  "IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_PRIVATE_KEY",
  "IMAGEKIT_URL_ENDPOINT",
];

function assertImageKitEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing ImageKit env vars: ${missing.join(", ")}`);
  }
}

function createImageKitAuth() {
  assertImageKitEnv();
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 10 * 60;
  const signature = crypto
    .createHmac("sha1", process.env.IMAGEKIT_PRIVATE_KEY)
    .update(`${token}${expire}`)
    .digest("hex");

  return {
    token,
    expire,
    signature,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  };
}

function getImageKit() {
  assertImageKitEnv();
  return new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
}

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/debug/routes", (_req, res) => {
  res.status(200).json({
    routes: [
      "GET /health",
      "GET /imagekit-auth",
      "POST /imagekit-auth",
      "POST /imagekit-upload",
      "GET /feed",
      "GET /users/:userId",
      "GET /users/:userId/posts",
      "POST /posts",
      "DELETE /posts/:postId",
      "POST /posts/:postId/like",
      "GET /posts/:postId/comments",
      "POST /posts/:postId/comments",
      "DELETE /posts/:postId/comments/:commentId",
    ],
  });
});

function sendImageKitAuth(_req, res) {
  try {
    res.set("Cache-Control", "no-store, max-age=0");
    res.status(200).json(createImageKitAuth());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

app.get("/imagekit-auth", sendImageKitAuth);
app.post("/imagekit-auth", sendImageKitAuth);

app.post("/imagekit-upload", async (req, res, next) => {
  try {
    const { file, fileName } = req.body;
    if (!file || !fileName) {
      const error = new Error("file and fileName are required");
      error.status = 400;
      throw error;
    }

    const result = await getImageKit().upload({
      file,
      fileName,
      folder: "/covo/posts",
    });

    if (!result.url) {
      const error = new Error("ImageKit upload did not return a URL");
      error.status = 502;
      throw error;
    }

    res.status(201).json({
      url: result.url,
      fileId: result.fileId,
      name: result.name,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/feed", async (req, res, next) => {
  try {
    const token = requireAuth(req);
    const posts = await getFeed({
      token,
      userId: req.query.userId,
      feed: req.query.feed || "global",
      college: req.query.college || "",
    });
    res.status(200).json({ posts });
  } catch (error) {
    next(error);
  }
});

app.get("/users/:userId", async (req, res, next) => {
  try {
    const token = requireAuth(req);
    const user = await getProfile({ token, userId: req.params.userId });
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

app.get("/users/:userId/posts", async (req, res, next) => {
  try {
    const token = requireAuth(req);
    const posts = await getPostsByUser({
      token,
      viewerId: req.query.viewerId || "",
      profileUserId: req.params.userId,
    });
    res.status(200).json({ posts });
  } catch (error) {
    next(error);
  }
});

app.post("/posts", async (req, res, next) => {
  try {
    const token = requireAuth(req);
    const post = await createPost({ token, user: req.body.user, body: req.body });
    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
});

app.delete("/posts/:postId", async (req, res, next) => {
  try {
    const token = requireAuth(req);
    await deletePost({ token, postId: req.params.postId });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.post("/posts/:postId/like", async (req, res, next) => {
  try {
    const token = requireAuth(req);
    const result = await setLike({
      token,
      userId: req.body.userId,
      postId: req.params.postId,
      liked: !!req.body.liked,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

app.get("/posts/:postId/comments", async (req, res, next) => {
  try {
    const token = requireAuth(req);
    const comments = await getComments({ token, postId: req.params.postId });
    res.status(200).json({ comments });
  } catch (error) {
    next(error);
  }
});

app.post("/posts/:postId/comments", async (req, res, next) => {
  try {
    const token = requireAuth(req);
    const result = await addComment({
      token,
      user: req.body.user,
      postId: req.params.postId,
      text: req.body.text || "",
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

app.delete("/posts/:postId/comments/:commentId", async (req, res, next) => {
  try {
    const token = requireAuth(req);
    const result = await deleteComment({
      token,
      postId: req.params.postId,
      commentId: req.params.commentId,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  console.error(`[${status}] ${error.message}`);
  res.status(status).json({ message: error.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`covo-feed API listening on http://localhost:${PORT}`);
});
