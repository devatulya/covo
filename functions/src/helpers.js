/**
 * COVO — Utility helpers for Cloud Functions
 */

const { db } = require("./config");

/**
 * Deletes all documents in a collection or query in batches.
 * Firestore batch writes are limited to 500 operations, so we use 400 to be safe.
 *
 * @param {FirebaseFirestore.Query | FirebaseFirestore.CollectionReference} queryOrRef
 * @param {number} batchSize - Number of docs to delete per batch (max 400)
 * @returns {Promise<number>} - Total number of documents deleted
 */
async function deleteQueryBatch(queryOrRef, batchSize = 400) {
  let totalDeleted = 0;

  while (true) {
    const snapshot = await queryOrRef.limit(batchSize).get();

    if (snapshot.empty) {
      break;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    totalDeleted += snapshot.size;

    // If we got fewer than batchSize, we're done
    if (snapshot.size < batchSize) {
      break;
    }
  }

  return totalDeleted;
}

/**
 * Safely increments/decrements a numeric field using a transaction.
 * Clamps the result to a minimum of 0 to prevent negative counts.
 *
 * @param {FirebaseFirestore.DocumentReference} docRef
 * @param {string} field - The field name to update
 * @param {number} delta - Amount to change (+1 or -1 typically)
 */
async function safeCounterUpdate(docRef, field, delta) {
  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    if (!doc.exists) return;

    const currentValue = doc.data()[field] || 0;
    const newValue = Math.max(0, currentValue + delta);
    transaction.update(docRef, { [field]: newValue });
  });
}

module.exports = { deleteQueryBatch, safeCounterUpdate };
