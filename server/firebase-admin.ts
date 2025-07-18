// New File: server/firebase-admin.ts

import admin from 'firebase-admin';

try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
}

export const firebaseAdmin = admin;