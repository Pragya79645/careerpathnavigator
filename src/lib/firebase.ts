// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxm7qtwA-HnVlbNa0nbvkJ2GVDku38VIQ",
  authDomain: "careerpathnavigator-8783c.firebaseapp.com",
  projectId: "careerpathnavigator-8783c",
  storageBucket: "careerpathnavigator-8783c.firebasestorage.app",
  messagingSenderId: "411185912011",
  appId: "1:411185912011:web:03fb1b13a0aae0fe33634e",
  measurementId: "G-F14VF8W9RJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser)
let analytics = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, db, auth, googleProvider };