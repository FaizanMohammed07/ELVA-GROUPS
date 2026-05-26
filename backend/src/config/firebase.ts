import * as admin from 'firebase-admin';
import { env } from './env';

let app: admin.app.App | null = null;

export function getFirebaseAdmin(): admin.app.App {
  if (app) return app;

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_PRIVATE_KEY || !env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('Firebase Admin SDK credentials not configured in environment variables');
  }

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
    }),
  });

  return app;
}

export async function verifyFirebaseToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  const firebaseApp = getFirebaseAdmin();
  return firebaseApp.auth().verifyIdToken(idToken, true);
}
