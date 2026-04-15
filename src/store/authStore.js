import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  initAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          set({
            user: { uid: firebaseUser.uid, id: firebaseUser.uid, ...userDoc.data() },
            isAuthenticated: true,
            loading: false,
          });
        } else {
          // If firestore doc is missing, preserve the staged memory data if any
          set((state) => ({
            user: { ...state.user, uid: firebaseUser.uid, id: firebaseUser.uid, email: firebaseUser.email },
            isAuthenticated: true,
            loading: false,
          }));
        }
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    });
  },

  login: async ({ email, password }) => {
    await signInWithEmailAndPassword(auth, email, password);
  },

  signup: async ({ email, password, username, name, college }) => {
    // 1. Check Username availability
    const usernameDoc = await getDoc(doc(db, 'usernames', username));
    if (usernameDoc.exists()) {
      throw new Error('Username already exists');
    }

    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('User already exists. Please login instead.');
      }
      throw err;
    }
    
    const userId = userCredential.user.uid;

    // Stage the user in local memory entirely. DO NOT push to Firestore 'users' collection yet!
    // It will be bulk uploaded when ChooseTribe concludes.
    set((state) => ({
      user: {
        ...state.user,
        userId,
        uid: userId,
        email,
        username,
        name: name || username,
        college: college || 'University',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        notificationsEnabled: true
      }
    }));
  },

  logout: async () => {
    await signOut(auth);
  },

  setStagedProfile: (partialUser) => {
    set((state) => ({
      user: { ...state.user, ...partialUser }
    }));
  },

  updateProfile: async (partialUser) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    // Use setDoc with merge: true so it creates the document if it wasn't made during signup
    const finalData = { ...currentUser, ...partialUser, createdAt: currentUser.createdAt || new Date().toISOString() };
    await setDoc(userDocRef, finalData, { merge: true });
    
    // Also reserve the username permanently here since it was deferred from signup
    if (finalData.username) {
      await setDoc(doc(db, 'usernames', finalData.username), { uid: currentUser.uid });
    }
    
    if (partialUser.prn) {
      await setDoc(doc(db, 'auth_identifiers', partialUser.prn.trim()), { email: currentUser.email });
    }
    if (partialUser.phoneNumber) {
      await setDoc(doc(db, 'auth_identifiers', partialUser.phoneNumber.trim()), { email: currentUser.email });
    }

    set((state) => ({
      user: { ...state.user, ...partialUser }
    }));
  },

  toggleNotifications: async () => {
    const currentUser = get().user;
    if (!currentUser) return;

    const newStatus = !currentUser.notificationsEnabled;
    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, { notificationsEnabled: newStatus });

    set((state) => ({
      user: {
        ...state.user,
        notificationsEnabled: newStatus,
      }
    }));
  },
}));
