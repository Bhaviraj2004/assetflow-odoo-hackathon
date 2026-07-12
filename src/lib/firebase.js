import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDP5ojPUA7k_xEJHslkaZxw-NdQLyDLkVE",
  authDomain: "assetflow-cea64.firebaseapp.com",
  projectId: "assetflow-cea64",
  storageBucket: "assetflow-cea64.firebasestorage.app",
  messagingSenderId: "731956527466",
  appId: "1:731956527466:web:c9df7a226fc3cb3aa46513",
  measurementId: "G-YS9BH3MDZ9",
  databaseURL: "https://assetflow-cea64-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
