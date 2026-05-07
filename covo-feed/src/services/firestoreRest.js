const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;
const DATABASE = "(default)";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents`;

export function requireAuth(req) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    const error = new Error("Missing Firebase ID token");
    error.status = 401;
    throw error;
  }
  return match[1];
}

export function normalizeCollege(college) {
  return (college || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: value } : { doubleValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toFirestoreValue(item)])),
      },
    };
  }
  return { stringValue: String(value) };
}

export function fromFirestoreValue(value) {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ("mapValue" in value) return fromFirestoreFields(value.mapValue.fields || {});
  return undefined;
}

export function fromFirestoreFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromFirestoreValue(value)]));
}

export function fromDocument(document) {
  const parts = document.name.split("/");
  return {
    id: parts[parts.length - 1],
    ...fromFirestoreFields(document.fields || {}),
  };
}

export function toFields(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, toFirestoreValue(value)]));
}

async function firestoreFetch(path, token, options = {}) {
  if (!PROJECT_ID) {
    const error = new Error("VITE_FIREBASE_PROJECT_ID is not configured");
    error.status = 500;
    throw error;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    const error = new Error(details.error?.message || "Firestore request failed");
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function getDocument(path, token) {
  return firestoreFetch(`/${path}`, token);
}

export async function createDocument(collectionPath, token, data) {
  const result = await firestoreFetch(`/${collectionPath}`, token, {
    method: "POST",
    body: JSON.stringify({ fields: toFields(data) }),
  });
  return fromDocument(result);
}

export async function createDocumentWithId(collectionPath, documentId, token, data) {
  const result = await firestoreFetch(`/${collectionPath}?documentId=${encodeURIComponent(documentId)}`, token, {
    method: "POST",
    body: JSON.stringify({ fields: toFields(data) }),
  });
  return fromDocument(result);
}

export async function setDocument(path, token, data) {
  const result = await firestoreFetch(`/${path}`, token, {
    method: "PATCH",
    body: JSON.stringify({ fields: toFields(data) }),
  });
  return fromDocument(result);
}

export async function updateDocument(path, token, data, updateMask = Object.keys(data)) {
  const mask = updateMask.map((fieldPath) => `updateMask.fieldPaths=${encodeURIComponent(fieldPath)}`).join("&");
  const result = await firestoreFetch(`/${path}?${mask}`, token, {
    method: "PATCH",
    body: JSON.stringify({ fields: toFields(data) }),
  });
  return fromDocument(result);
}

export async function deleteDocument(path, token) {
  await firestoreFetch(`/${path}`, token, { method: "DELETE" });
}

export async function runQuery(token, structuredQuery) {
  const result = await firestoreFetch(":runQuery", token, {
    method: "POST",
    body: JSON.stringify({ structuredQuery }),
  });
  return result.filter((row) => row.document).map((row) => fromDocument(row.document));
}

export function fieldFilter(fieldPath, op, value) {
  return {
    fieldFilter: {
      field: { fieldPath },
      op,
      value: toFirestoreValue(value),
    },
  };
}

export function andFilter(filters) {
  return {
    compositeFilter: {
      op: "AND",
      filters,
    },
  };
}

export async function listCollection(path, token) {
  const result = await firestoreFetch(`/${path}`, token);
  return (result.documents || []).map(fromDocument);
}
