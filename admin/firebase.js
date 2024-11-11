// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
import { getFirestore } from "@firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7aOkH8W1Il8vXx5UhYFjvo9yB3EOJ-RY",
  authDomain: "salah-pulse-3411f.firebaseapp.com",
  projectId: "salah-pulse-3411f",
  storageBucket: "salah-pulse-3411f.appspot.com",
  messagingSenderId: "914145142566",
  appId: "1:914145142566:web:3b43b5f7340305f51683e7"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP)