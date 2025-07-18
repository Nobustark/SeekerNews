// The FINAL, COMPLETE, CORRECTED code for client/src/lib/auth.ts

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, // <--- The original function from Firebase
  type User 
} from "firebase/auth";
import { auth } from "./firebase";

export const registerWithFirebase = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const loginWithFirebase = async (email: string, password:string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutFromFirebase = async () => {
  return await signOut(auth);
};

// *** THIS IS THE FIX ***
// We are now correctly exporting the original Firebase function
// with the name that ArticleForm.tsx is looking for.
export { onAuthStateChanged };
export type { User }; // Also export the User type