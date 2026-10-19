import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes("DEMO") &&
    !firebaseConfig.apiKey.includes("your_") &&
    !firebaseConfig.apiKey.includes("mock")
  );
};

// Initialize Firebase App singleton safely
const isConfigured = isFirebaseConfigured();
const app: FirebaseApp = getApps().length > 0
  ? getApp()
  : initializeApp(
      isConfigured
        ? firebaseConfig
        : {
            apiKey: "mock-api-key",
            authDomain: "silkendrift-mock.firebaseapp.com",
            projectId: "silkendrift-mock",
            storageBucket: "silkendrift-mock.appspot.com",
            messagingSenderId: "1234567890",
            appId: "1:1234567890:web:mockappid",
          }
    );

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
