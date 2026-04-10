/**
 * COVO — Shared Firebase Admin configuration
 * Single initialization point for all Cloud Functions.
 */

const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { getAuth } = require("firebase-admin/auth");

// Initialize Firebase Admin SDK (uses default credentials in Cloud Functions)
const app = initializeApp();
const db = getFirestore(app);
const messaging = getMessaging(app);
const auth = getAuth(app);

module.exports = { app, db, messaging, auth, FieldValue };
