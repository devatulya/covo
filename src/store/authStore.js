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
          // If firestore doc is missing, just fallback
          set({
            user: { uid: firebaseUser.uid, id: firebaseUser.uid, email: firebaseUser.email },
            isAuthenticated: true,
            loading: false,
          });
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
    // 1. Proactive check to see if email is already in our users collection
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('User already exists. Please login instead.');
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

    const newUserProfile = {
      userId,
      username,
      name: name || username,
      email,
      college: college || 'University',
      createdAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      notificationsEnabled: true,
    };

    // Save profile to Firestore
    await setDoc(doc(db, 'users', userId), newUserProfile);
    
    // update state will be handled automatically by onAuthStateChanged,
    // but we can enforce local update here if we want
  },

  logout: async () => {
    await signOut(auth);
  },

  updateProfile: async (partialUser) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, partialUser);
    
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
