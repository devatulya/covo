# COVO — Backend Documentation

> College social network backend powered by Firebase

## Architecture Overview

```
Client App
    │
    ├── Firebase Auth ──→ Google / Email login
    │
    ├── Firestore (direct reads/writes with security rules)
    │   ├── users/
    │   ├── posts/
    │   │   └── likes/ (subcollection)
    │   ├── comments/
    │   ├── reports/
    │   └── notifications/
    │
    ├── Cloud Functions (auto-triggered)
    │   ├── onLikeCreated / onLikeDeleted
    │   ├── onCommentCreated
    │   ├── onPostDeleted (cascade cleanup)
    │   ├── onReportCreated (auto-flag)
    │   └── onAnonymousPostCreated
    │
    ├── Callable Functions
    │   ├── generateImageKitAuth (upload credentials)
    │   ├── listPendingPosts (admin)
    │   ├── approvePost (admin)
    │   ├── rejectPost (admin)
    │   ├── getReports (admin)
    │   └── adminDeletePost (admin)
    │
    └── ImageKit (image upload + CDN)
```

---

## Quick Start

### 1. Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`

### 2. Setup

```bash
# Clone and navigate to the project
cd d:\Projects\COVO

# Login to Firebase
firebase login

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 3. Configure Environment

```bash
# Copy the env template
copy functions\.env.example functions\.env

# Edit functions\.env with your ImageKit credentials:
# IMAGEKIT_PUBLIC_KEY=your_public_key
# IMAGEKIT_PRIVATE_KEY=your_private_key
# IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
# REPORT_THRESHOLD=5
```

### 4. Set Admin Users

After a user signs up and you have their UID:

```bash
# Set GOOGLE_APPLICATION_CREDENTIALS to your service account key
set GOOGLE_APPLICATION_CREDENTIALS=path\to\service-account-key.json

# Grant admin privileges
node scripts/set-admin.js <user-uid>
```

### 5. Deploy

```bash
# Deploy everything (rules, indexes, functions)
firebase deploy

# Or deploy individually:
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only functions
```

### 6. Local Development (Emulators)

```bash
firebase emulators:start
```

---

## Firestore Collections

### `users`
| Field | Type | Description |
|-------|------|-------------|
| userId | string | Firebase Auth UID (= doc ID) |
| username | string | Display name |
| email | string | User email |
| college | string | College name |
| bio | string | User bio |
| profilePic | string | ImageKit URL |
| isVerified | boolean | Verification status |
| createdAt | timestamp | Account creation time |

**Subcollection:** `users/{userId}/fcmTokens/{tokenId}`
| Field | Type |
|-------|------|
| token | string |
| platform | string |
| createdAt | timestamp |

### `posts`
| Field | Type | Description |
|-------|------|-------------|
| userId | string | Author UID |
| college | string | Author's college |
| text | string | Post body |
| imageUrl | string | ImageKit URL (optional) |
| category | string | `meme` / `rant` / `event` / `discussion` |
| isAnonymous | boolean | Anonymous flag |
| status | string | `approved` / `pending_review` |
| likesCount | number | System-managed counter |
| commentsCount | number | System-managed counter |
| isFlagged | boolean | Auto-flagged by report system |
| createdAt | timestamp | Post creation time |

**Subcollection:** `posts/{postId}/likes/{userId}`

### `comments`
| Field | Type |
|-------|------|
| postId | string |
| userId | string |
| text | string |
| createdAt | timestamp |

### `reports`
| Field | Type |
|-------|------|
| postId | string |
| reportedBy | string |
| reason | string |
| createdAt | timestamp |

### `notifications`
| Field | Type |
|-------|------|
| userId | string |
| type | string |
| postId | string |
| senderId | string |
| isRead | boolean |
| createdAt | timestamp |

---

## Cloud Functions Reference

### Automatic Triggers (Firestore Events)

| Function | Trigger | Description |
|----------|---------|-------------|
| `onLikeCreated` | `posts/{postId}/likes/{userId}` create | Increments likesCount + notifies post owner |
| `onLikeDeleted` | `posts/{postId}/likes/{userId}` delete | Decrements likesCount |
| `onCommentCreated` | `comments/{commentId}` create | Increments commentsCount + notifies post owner |
| `onPostDeleted` | `posts/{postId}` delete | Cascade deletes likes, comments, reports, notifications |
| `onReportCreated` | `reports/{reportId}` create | Auto-flags post after 5 reports |
| `onAnonymousPostCreated` | `posts/{postId}` create | Logs new anonymous posts for admin review |

### Callable Functions (Frontend Invocation)

| Function | Access | Description |
|----------|--------|-------------|
| `generateImageKitAuth` | Authenticated users | Returns ImageKit upload credentials |
| `listPendingPosts` | Admin only | Lists anonymous posts awaiting approval |
| `approvePost` | Admin only | Approves an anonymous post |
| `rejectPost` | Admin only | Rejects + deletes an anonymous post |
| `getReports` | Admin only | Lists flagged posts with report details |
| `adminDeletePost` | Admin only | Force-deletes any post |

---

## Frontend Integration Guide (for Rigved)

### Creating a Post

```javascript
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Non-anonymous post (goes live immediately)
await addDoc(collection(db, "posts"), {
  userId: auth.currentUser.uid,
  college: "MIT",
  text: "Hello COVO!",
  imageUrl: "",  // or ImageKit URL after upload
  category: "discussion",
  isAnonymous: false,
  status: "approved",       // goes live immediately
  likesCount: 0,
  commentsCount: 0,
  isFlagged: false,
  createdAt: serverTimestamp(),
});

// Anonymous post (requires admin approval)
await addDoc(collection(db, "posts"), {
  userId: auth.currentUser.uid,  // stored but hidden from UI
  college: "MIT",
  text: "Anonymous confession...",
  imageUrl: "",
  category: "rant",
  isAnonymous: true,
  status: "pending_review",   // admin must approve
  likesCount: 0,
  commentsCount: 0,
  isFlagged: false,
  createdAt: serverTimestamp(),
});
```

### Fetching Feed

```javascript
import { query, collection, where, orderBy, limit, startAfter } from "firebase/firestore";

// College feed (paginated)
const collegeFeed = query(
  collection(db, "posts"),
  where("status", "==", "approved"),
  where("college", "==", userCollege),
  orderBy("createdAt", "desc"),
  limit(10)
);

// Global feed (paginated)
const globalFeed = query(
  collection(db, "posts"),
  where("status", "==", "approved"),
  orderBy("createdAt", "desc"),
  limit(10)
);

// Next page: startAfter(lastVisibleDoc)
```

### Liking a Post

```javascript
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

// Like
await setDoc(
  doc(db, "posts", postId, "likes", auth.currentUser.uid),
  { userId: auth.currentUser.uid, createdAt: serverTimestamp() }
);

// Unlike
await deleteDoc(doc(db, "posts", postId, "likes", auth.currentUser.uid));
```

### Adding a Comment

```javascript
await addDoc(collection(db, "comments"), {
  postId: postId,
  userId: auth.currentUser.uid,
  text: "Great post!",
  createdAt: serverTimestamp(),
});
```

### Reporting a Post

```javascript
await addDoc(collection(db, "reports"), {
  postId: postId,
  reportedBy: auth.currentUser.uid,
  reason: "Inappropriate content",
  createdAt: serverTimestamp(),
});
```

### Uploading Images via ImageKit

```javascript
import { httpsCallable } from "firebase/functions";

// 1. Get auth credentials from your Cloud Function
const getAuth = httpsCallable(functions, "generateImageKitAuth");
const { data } = await getAuth();

// 2. Upload directly to ImageKit
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("fileName", "post-image.jpg");
formData.append("token", data.token);
formData.append("expire", data.expire);
formData.append("signature", data.signature);
formData.append("publicKey", "YOUR_IMAGEKIT_PUBLIC_KEY");

const response = await fetch("https://upload.imagekit.io/api/v2/files/upload", {
  method: "POST",
  body: formData,
});

const result = await response.json();
const imageUrl = result.url;  // Use this in your post document
```

### Admin Functions (Callable)

```javascript
import { httpsCallable } from "firebase/functions";

// List pending posts
const listPending = httpsCallable(functions, "listPendingPosts");
const { data } = await listPending();

// Approve
const approve = httpsCallable(functions, "approvePost");
await approve({ postId: "abc123" });

// Reject
const reject = httpsCallable(functions, "rejectPost");
await reject({ postId: "abc123", reason: "Inappropriate" });

// Get flagged posts with reports
const reports = httpsCallable(functions, "getReports");
const { data: reportData } = await reports();

// Force delete
const deleteFn = httpsCallable(functions, "adminDeletePost");
await deleteFn({ postId: "abc123" });
```

### Registering FCM Token

```javascript
import { getToken } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const token = await getToken(fcmMessaging, { vapidKey: "YOUR_VAPID_KEY" });

await setDoc(
  doc(db, "users", auth.currentUser.uid, "fcmTokens", token),
  {
    token: token,
    platform: "web",
    createdAt: serverTimestamp(),
  }
);
```

### Anonymous Posting (Frontend Display Logic)

```javascript
// When displaying a post:
function getDisplayAuthor(post) {
  if (post.isAnonymous) {
    return { username: "Anonymous", profilePic: "/default-avatar.png" };
  }
  // Fetch from users collection
  return getUserProfile(post.userId);
}
```

---

## Security Rules Summary

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| users | Auth'd users | Owner only | Owner only (can't change userId/email) | ❌ |
| posts | Auth'd users | Owner; anon→pending, normal→approved | Owner (can't touch counters/flags/status) | Owner or Admin |
| likes | Auth'd users | Own UID only | ❌ | Own UID only |
| comments | Auth'd users | Owner | ❌ (immutable) | Owner or Admin |
| reports | Admin only | Auth'd users | ❌ | ❌ |
| notifications | Own only | ❌ (Cloud Fn only) | Own (isRead only) | Own only |

---

## Team Responsibilities

| Person | Scope |
|--------|-------|
| **Atulya** | Firestore schema, Cloud Functions, Security Rules, Admin scripts |
| **Rigved** | Frontend (feeds, post creation, moderation UI, FCM token registration) |
| **Saarthak** | Firebase Auth (Google + Email/Password), User profile creation, OCR |
