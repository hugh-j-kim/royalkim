import { initializeApp, getApps } from "firebase/app"
import { getStorage, FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyApThOThn_cT2heKV_W3JJ4o71-c4yWofw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "royalkim.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "royalkim",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "royalkim.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1052940584501",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1052940584501:web:96da5ff02c3ad14785537c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-1929TKXLQP"
}

// Firebase가 이미 초기화되어 있는지 확인하고, 없으면 초기화
let app
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
} catch (error) {
  console.error('Firebase 초기화 실패:', error)
  throw error
}

let storage: FirebaseStorage
try {
  storage = getStorage(app)
} catch (error) {
  console.error('Firebase Storage 초기화 실패:', error)
  throw error
}

export { app, storage } 