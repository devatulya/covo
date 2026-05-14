import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  deleteUser
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, limit, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const normalizeUsername = (username) => username.trim().toLowerCase();

function isCompletedProfile(profile) {
  return profile?.registrationCompleted === true || profile?.onboardingComplete === true;
}

async function usernameBelongsToAnotherUser(username, currentUid) {
  const usernameQuery = query(collection(db, 'users'), where('username', '==', username), limit(10));
  const usernameSnap = await getDocs(usernameQuery);
  return usernameSnap.docs.some((userDoc) => userDoc.id !== currentUid && isCompletedProfile(userDoc.data()));
}

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  signupRecoveryInProgress: false,

  initAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Wait for the auth token to fully propagate to Firestore
          // (avoids "Missing or insufficient permissions" race condition)
          await firebaseUser.getIdToken(true);

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
            const stagedUser = get().user;
            if (
              (stagedUser?.uid === firebaseUser.uid && stagedUser?.username)
              || get().signupRecoveryInProgress
            ) {
              set({
                user: {
                  ...stagedUser,
                  uid: firebaseUser.uid,
                  id: firebaseUser.uid,
                  email: firebaseUser.email,
                  needsOnboarding: true,
                },
                isAuthenticated: true,
                loading: false,
              });
              return;
            }

            await signOut(auth);
            set({ user: null, isAuthenticated: false, loading: false });
          }
        } catch (err) {
          console.error('initAuth: Error fetching user profile:', err);
          await signOut(auth);
          set({ user: null, isAuthenticated: false, loading: false });
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
    const normalizedUsername = normalizeUsername(username);
    let userCredential;
    let reusedExistingAuth = false;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        try {
          set({ signupRecoveryInProgress: true });
          userCredential = await signInWithEmailAndPassword(auth, email, password);
          reusedExistingAuth = true;
        } catch {
          set({ signupRecoveryInProgress: false });
          throw new Error('This email already has an account. Login instead or use the same password to finish setup.');
        }
      } else {
        throw err;
      }
    }
    
    const userId = userCredential.user.uid;
    await userCredential.user.getIdToken(true);

    const existingProfileDoc = await getDoc(doc(db, 'users', userId));
    if (existingProfileDoc.exists() && isCompletedProfile(existingProfileDoc.data())) {
      set({
        user: { uid: userId, id: userId, ...existingProfileDoc.data() },
        isAuthenticated: true,
        loading: false,
        signupRecoveryInProgress: false,
      });
      return { existingCompleted: true };
    }

    const usernameDoc = await getDoc(doc(db, 'usernames', normalizedUsername));
    if (usernameDoc.exists() && usernameDoc.data()?.uid !== userId) {
      const reservedUid = usernameDoc.data()?.uid;
      const reservedUserDoc = reservedUid ? await getDoc(doc(db, 'users', reservedUid)) : null;
      if (reservedUserDoc?.exists() && isCompletedProfile(reservedUserDoc.data())) {
        await deleteUser(userCredential.user).catch(() => {});
        throw new Error('Username already exists');
      }
    }
    if (await usernameBelongsToAnotherUser(normalizedUsername, userId)) {
      await deleteUser(userCredential.user).catch(() => {});
      throw new Error('Username already exists');
    }

    // Stage the user in local memory entirely. DO NOT push to Firestore 'users' collection yet!
    // It will be bulk uploaded when ChooseTribe concludes.
    set((state) => ({
      user: {
        ...state.user,
        userId,
        uid: userId,
        email,
        username: normalizedUsername,
        name: name || normalizedUsername,
        college: college || 'University',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedUsername}`,
        notificationsEnabled: true
      },
      signupRecoveryInProgress: false,
    }));

    return { existingIncomplete: reusedExistingAuth };
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
    const finalData = {
      ...currentUser,
      ...partialUser,
      username: normalizeUsername(partialUser.username || currentUser.username || ''),
      userId: currentUser.uid,
      uid: currentUser.uid,
      createdAt: currentUser.createdAt || new Date().toISOString(),
    };
    
    // Reserve the username before creating/updating the user profile.
    // If an old reservation points to a UID with no user profile, treat it as stale and reclaim it.
    if (finalData.username) {
      if (await usernameBelongsToAnotherUser(finalData.username, currentUser.uid)) {
        throw new Error('Username already exists');
      }

      const usernameRef = doc(db, 'usernames', finalData.username);
      const usernameDoc = await getDoc(usernameRef);
      if (!usernameDoc.exists()) {
        await setDoc(usernameRef, { uid: currentUser.uid });
      } else if (usernameDoc.data()?.uid !== currentUser.uid) {
        const reservedUid = usernameDoc.data()?.uid;
        const reservedUserDoc = reservedUid ? await getDoc(doc(db, 'users', reservedUid)) : null;
        if (reservedUserDoc?.exists() && isCompletedProfile(reservedUserDoc.data())) {
          throw new Error('Username already exists');
        }
        await setDoc(usernameRef, { uid: currentUser.uid }, { merge: false }).catch((err) => {
          if (err?.code === 'permission-denied') {
            throw new Error('Username reservation is stale, but Firestore rules must be deployed before it can be reclaimed.');
          }
          throw err;
        });
      }
    }

    // Use setDoc with merge: true so it creates the document if it wasn't made during signup
    await setDoc(userDocRef, finalData, { merge: true });
    
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
