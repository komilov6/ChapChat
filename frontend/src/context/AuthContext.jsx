import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export function formatLastSeen(lastSeen) {
  if (!lastSeen) return 'Yaqinda onlayn edi';
  const diff = Date.now() - lastSeen;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Hozirgina';
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Kecha';
  return `${days} kun oldin`;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to all users
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setAllUsers(usersList);
    });
    return unsubscribe;
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ ...userDoc.data(), id: firebaseUser.uid, email: firebaseUser.email, uid: firebaseUser.uid });
        } else {
          // Fallback if doc doesn't exist yet
          const fallback = { id: firebaseUser.uid, name: firebaseUser.displayName || 'User', avatar: '', email: firebaseUser.email };
          setUser(fallback);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (username, password) => {
    // For simplicity with the existing UI, we use username as email if it's not an email
    const email = username.includes('@') ? username : `${username}@chapchat.app`;
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      // Update status to online in Firestore
      await updateDoc(doc(db, 'users', res.user.uid), {
        status: 'online',
        statusText: 'Online',
        lastSeen: null
      });
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error('Elektron pochta yoki parol noto\'g\'ri');
      }
      throw err;
    }
  };

  const register = async (username, displayName, password) => {
    const email = username.includes('@') ? username : `${username}@chapchat.app`;
    const res = await createUserWithEmailAndPassword(auth, email, password);
    
    const seed = username + Date.now();
    const newUser = {
      id: res.user.uid,
      name: displayName,
      tag: '#' + Math.floor(1000 + Math.random() * 9000),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
      status: 'online',
      statusText: 'Online',
      color: '#5b8cf7',
      friends: [], 
      friendRequests: [], 
      sentRequests: [],
      lastSeen: null
    };

    // Save to Firestore
    await setDoc(doc(db, 'users', res.user.uid), newUser);
    
    // Update Firebase display name
    await firebaseUpdateProfile(res.user, { displayName });
    
    return res.user;
  };

  const logout = async () => {
    if (user) {
      await updateDoc(doc(db, 'users', user.id), {
        status: 'offline',
        statusText: 'Offline',
        lastSeen: Date.now()
      });
    }
    await signOut(auth);
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: "User not logged in" };
    try {
      await updateDoc(doc(db, 'users', user.id), updates);
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  };

  const getAllUsers = () => {
    // In a real app, this would be a Firestore query. 
    // For simplicity, we can fetch all users or use a hook.
    // For now, let's keep it as a placeholder or fetch on demand.
    return []; 
  };

  const refetchUser = async () => {
    if (!auth.currentUser) return;
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (userDoc.exists()) {
      setUser({ ...userDoc.data(), id: auth.currentUser.uid, email: auth.currentUser.email, uid: auth.currentUser.uid });
    }
  };

  // Friend logic would go here using Firestore arrayUnion/arrayRemove
  const sendFriendRequest = async (targetId) => {
    await updateDoc(doc(db, 'users', user.id), {
      sentRequests: [...(user.sentRequests || []), targetId]
    });
    await updateDoc(doc(db, 'users', targetId), {
      friendRequests: [...(user.friendRequests || []), user.id]
    });
  };

  const acceptFriendRequest = async (requesterId) => {
    // Real implementation would use server-side or more careful client-side updates
    // For brevity, using simple updates
  };

  return (
    <AuthContext.Provider value={{
      user, allUsers, loading, login, register, logout, updateProfile,
      refetchUser, sendFriendRequest
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

