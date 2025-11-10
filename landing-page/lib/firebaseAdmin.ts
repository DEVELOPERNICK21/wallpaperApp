import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

declare global {
  var __FIREBASE_ADMIN_APP__: App | undefined;
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

export function getFirebaseAdminApp(): App | undefined {
  if (typeof window !== "undefined") {
    return undefined;
  }

  if (global.__FIREBASE_ADMIN_APP__) {
    return global.__FIREBASE_ADMIN_APP__;
  }

  if (!projectId || !clientEmail || !privateKey) {
    return undefined;
  }

  const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

  global.__FIREBASE_ADMIN_APP__ = app;

  return app;
}

export function getFirestoreAdmin() {
  const app = getFirebaseAdminApp();
  if (!app) {
    return undefined;
  }

  return getFirestore(app);
}

