import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAH-WubmiilrnFZk53WPTMeXT8FwIgHgOQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "daktarkhana-test-db.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "daktarkhana-test-db",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "daktarkhana-test-db.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "595413880552",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:595413880552:web:f2977074c3aa7cc9ac835d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-77PZNP9T29",
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes("DEMO")
  );
};

// Initialize Firebase App singleton
const app: FirebaseApp = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Browser-safe Google Analytics initialization
let analyticsInstance: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported or blocked by ad-blocker
  });
}

export const getFirebaseAnalytics = () => analyticsInstance;
export default app;
