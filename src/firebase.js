import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByEaV1M9JOSyFkMFdQVQv0JKe8H5mWAZk",
  authDomain: "my-current-medias.firebaseapp.com",
  projectId: "my-current-medias",
  storageBucket: "my-current-medias.firebasestorage.app",
  messagingSenderId: "224565426327",
  appId: "1:224565426327:web:e44cbd07b0f7dc186a91d2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);