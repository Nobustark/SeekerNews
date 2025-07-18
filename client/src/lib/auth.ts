// The complete, corrected code for client/src/components/auth.ts

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  type User 
} from "firebase/auth";
import { auth } from "./firebase"; // Your existing firebase.ts file

export const registerWithFirebase = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const loginWithFirebase = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutFromFirebase = async () => {
  return await signOut(auth);
};

export const onFirebaseAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};