// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrW-AerPPN7Yds-B_Bkeqzsge77hWWRgw",
  authDomain: "smiles-for-speech-1b81d.firebaseapp.com",
  projectId: "smiles-for-speech-1b81d",
  storageBucket: "smiles-for-speech-1b81d.appspot.com",
  messagingSenderId: "725020537485",
  appId: "1:725020537485:web:aabbccddeeff"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app; 