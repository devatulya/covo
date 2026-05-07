/**
 * COVO — Set Admin Custom Claims
 *
 * One-time script to grant admin privileges to a Firebase Auth user.
 * Run this locally after logging into Firebase CLI.
 *
 * Usage:
 *   node scripts/set-admin.js <firebase-user-uid>
 *
 * Prerequisites:
 *   - Firebase CLI installed and logged in: `firebase login`
 *   - Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account key
 *     OR run within the Firebase emulator/Cloud Shell environment
 *
 * Example:
 *   set GOOGLE_APPLICATION_CREDENTIALS=path\to\service-account-key.json
 *   node scripts/set-admin.js abc123def456
 */

const admin = require("firebase-admin");

// Initialize with default credentials
admin.initializeApp({
  projectId: "covo-4eeef",
});

const uid = process.argv[2];

if (!uid) {
  console.error("❌ Usage: node scripts/set-admin.js <firebase-user-uid>");
  console.error("   Example: node scripts/set-admin.js abc123def456");
  process.exit(1);
}

async function setAdmin() {
  try {
    // Verify the user exists
    const user = await admin.auth().getUser(uid);
    console.log(`Found user: ${user.email || user.displayName || uid}`);

    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    // Verify it was set
    const updatedUser = await admin.auth().getUser(uid);
    console.log("✅ Admin claim set successfully!");
    console.log("   Custom claims:", JSON.stringify(updatedUser.customClaims));
    console.log("");
    console.log("⚠️  The user must sign out and back in for the claim to take effect.");
    console.log("   Or, force a token refresh on the client side.");

    process.exit(0);
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      console.error(`❌ No user found with UID: ${uid}`);
    } else {
      console.error("❌ Error:", error.message);
    }
    process.exit(1);
  }
}

setAdmin();
