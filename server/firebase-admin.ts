// The FINAL, CORRECTED, and ROBUST code for server/firebase-admin.ts

import admin from 'firebase-admin';
import path from 'path';

// Define the absolute path to the secret key file on Render's server.
// Render places secret files in the root of the project directory.
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'firebase-service-account.json');

try {
  admin.initializeApp({
    // Explicitly tell the SDK to use the credential file at this path
    credential: admin.credential.cert(SERVICE_ACCOUNT_PATH),
  });
  console.log('Firebase Admin SDK initialized successfully using explicit path.');
} catch (error: any) {
  // Add more detailed error logging
  if (error.code === 'ENOENT') {
    console.error('CRITICAL: Could not find the Firebase service account file at:', SERVICE_ACCOUNT_PATH);
  }
  console.error('Firebase Admin SDK initialization error:', error);
}

export const firebaseAdmin = admin;