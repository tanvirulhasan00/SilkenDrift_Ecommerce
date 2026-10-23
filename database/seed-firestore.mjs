/**
 * ==============================================================================
 * SILKEN DRIFT — FIREBASE FIRESTORE SEEDING CLI SCRIPT
 * Reads database/firestore-seed.json and commits all collections to Cloud Firestore.
 * ==============================================================================
 */

import fs from "node:fs";
import path from "node:path";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, writeBatch } from "firebase/firestore";

// Read .env if present
const envPath = path.resolve(".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...values] = trimmed.split("=");
    if (key && values.length) {
      process.env[key.trim()] = values.join("=").trim().replace(/^["']|["']$/g, "");
    }
  }
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.VITE_FIREBASE_APP_ID || "",
};

if (
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey.includes("your_") ||
  firebaseConfig.apiKey.includes("mock")
) {
  console.log("\n=======================================================");
  console.log("ℹ️  SilkenDrift Firebase Seeder — Offline Notice");
  console.log("=======================================================");
  console.log("No live Firebase credentials detected in .env (placeholders present).");
  console.log("The application already runs out of the box in complete offline demo mode.");
  console.log("To seed a live Firebase instance:");
  console.log("1. Add your real VITE_FIREBASE_* credentials in .env");
  console.log("2. Run: npm run seed:firestore\n");
  process.exit(0);
}

console.log(`\nConnecting to Firebase project: ${firebaseConfig.projectId}...`);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedPath = path.resolve("./database/firestore-seed.json");
const seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

async function seed() {
  let totalUploaded = 0;
  for (const [collectionName, documents] of Object.entries(seedData)) {
    console.log(`Uploading collection: ${collectionName}...`);
    const batch = writeBatch(db);
    let batchCount = 0;

    for (const [docId, docData] of Object.entries(documents)) {
      const docRef = doc(db, collectionName, docId);
      batch.set(docRef, docData, { merge: true });
      batchCount++;
      totalUploaded++;
    }

    await batch.commit();
    console.log(`  ✓ Synced ${batchCount} documents to "${collectionName}"`);
  }

  console.log(
    `\n🎉 Success! Successfully uploaded ${totalUploaded} documents to Cloud Firestore (${firebaseConfig.projectId})!\n`
  );
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err.message);
  process.exit(1);
});
