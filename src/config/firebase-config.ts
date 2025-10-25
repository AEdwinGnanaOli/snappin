// src/config/firebase.ts (USE THIS AS YOUR SINGLE CONFIG FILE)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPllgLAbVQkXxRHDobAeVr-rTW86u0J-g",
  authDomain: "testchat-3839e.firebaseapp.com",
  projectId: "testchat-3839e",
  storageBucket: "testchat-3839e.appspot.com",
  messagingSenderId: "325519195917",
  appId: "1:325519195917:web:b0e7cf2ae01649f940fa44",
  measurementId: "G-904TBENZYD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const db = getFirestore(app); // Alias for compatibility
export const storage = getStorage(app);

// Firestore collection names
export const USERS_COLLECTION = "users";
export const CHATS_COLLECTION = "chats";
export const MESSAGES_COLLECTION = "messages";
export const GROUPS_COLLECTION = "groups";

// Helper functions
export const getCurrentUser = () => auth.currentUser;
export const getCurrentUserId = () => auth.currentUser?.uid || "";

export default app;
