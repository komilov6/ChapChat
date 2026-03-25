import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual firebaseConfig from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDC3b0h64LHOjKzRTzBcJUI3dGwRgARYk4",
  authDomain: "chapchat-7f6e9.firebaseapp.com",
  projectId: "chapchat-7f6e9",
  storageBucket: "chapchat-7f6e9.firebasestorage.app",
  messagingSenderId: "927420032921",
  appId: "1:927420032921:web:4fe88f066337c62f13d508",
  measurementId: "G-NX7V8G6SZX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
