import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

const initializeFirebaseAdmin = () => {
  if (getApps().length > 0) return true;
  
  // If we are using emulators, we don't need credentials, just projectId
  if (process.env.NEXT_PUBLIC_USE_EMULATOR === 'true' || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    if (process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
      if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
      }
      if (!process.env.FIRESTORE_EMULATOR_HOST) {
        process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
      }
      if (!process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
        process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';
      }
    }
    initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project' });
    return true;
  }

  // Explicit service account credentials (if provided)
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'remax-sales',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      return true;
    } catch (error) {
      console.error('Firebase Admin initialization with cert error', error);
    }
  }

  // Application Default Credentials (ADC) - standard on Firebase App Hosting / Cloud Run
  try {
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'remax-sales',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    return true;
  } catch (error) {
    console.warn('Firebase Admin initialization with ADC skipped or failed:', error);
    return false;
  }
};

const initialized = initializeFirebaseAdmin();

const getUninitializedProxy = (serviceName: string) => new Proxy({}, {
  get: (target, prop) => {
    throw new Error(`Firebase Admin SDK is not initialized. Cannot access ${serviceName}.${String(prop)}. Please ensure FIREBASE_PRIVATE_KEY is set or enable the emulator.`);
  }
});

export const adminAuth = (initialized ? getAuth() : getUninitializedProxy('adminAuth')) as Auth;
export const adminDb = (initialized ? getFirestore() : getUninitializedProxy('adminDb')) as Firestore;
export const adminStorage = (initialized ? getStorage() : getUninitializedProxy('adminStorage')) as Storage;
