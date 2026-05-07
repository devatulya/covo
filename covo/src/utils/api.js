import { auth } from '../firebase/config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function apiFetch(path, options = {}) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('You must be logged in.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}
