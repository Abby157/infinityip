import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDZ3TcWWqPfTjnHIRX3f1SFrqyBcTT6cjk",
  authDomain: "infinity-ip.firebaseapp.com",
  projectId: "infinity-ip",
  storageBucket: "infinity-ip.firebasestorage.app",
  messagingSenderId: "697895545617",
  appId: "1:697895545617:web:6984ea90916aede3a03ab0",
  measurementId: "G-RLVLMKP3YQ"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app