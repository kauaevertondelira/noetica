import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, addDoc, deleteDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore/lite';

export function services(config) {
  const app = getApps()[0] || initializeApp(config);
  return {
    auth: getAuth(app), db: getFirestore(app),
    authSDK: { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, signOut },
    firestore: { doc, collection, getDoc, getDocs, setDoc, addDoc, deleteDoc, query, orderBy, limit, serverTimestamp },
  };
}
