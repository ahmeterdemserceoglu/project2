import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getDatabase } from "firebase/database"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtCGW8quUVeer_ImQURcYaJyzm8zzDG0M",
  authDomain: "hosting-cb11e.firebaseapp.com",
  databaseURL: "https://hosting-cb11e-default-rtdb.firebaseio.com",
  projectId: "hosting-cb11e",
  storageBucket: "hosting-cb11e.appspot.com",
  messagingSenderId: "366229891129",
  appId: "1:366229891129:web:c6ffb574c4bdf4a3ee45e8",
  measurementId: "G-MKKNTWSDJ4",
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const database = getDatabase(app)

export { app, auth, db, storage, database }
