import { initializeApp, getApps } from "firebase/app"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyApThOThn_cT2heKV_W3JJ4o71-c4yWofw",
  authDomain: "royalkim.firebaseapp.com",
  projectId: "royalkim",
  storageBucket: "royalkim.firebasestorage.app",
  messagingSenderId: "1052940584501",
  appId: "1:1052940584501:web:96da5ff02c3ad14785537c",
  measurementId: "G-1929TKXLQP"
}

// Firebase가 이미 초기화되어 있는지 확인하고, 없으면 초기화
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const storage = getStorage(app)

export { app, storage } 