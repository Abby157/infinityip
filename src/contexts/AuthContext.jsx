import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const AuthContext = createContext(null)

export const ADMIN_EMAIL = 'davehack966@gmail.com'

export function AuthProvider({ children }) {
  const [user,       setUser]       = useState(null)
  const [userData,   setUserData]   = useState(null)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (snap.exists()) setUserData(snap.data())
        } catch (err) { console.error(err) }
      } else {
        setUserData(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const login  = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password)
  const logout = () => { setUserData(null); return signOut(auth) }
  const resetPassword = (email) => sendPasswordResetEmail(auth, email)

  const isAdmin    = user?.email === ADMIN_EMAIL
  const isReseller = !!userData?.resellerId && !isAdmin

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, signup, logout, resetPassword, isAdmin, isReseller }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}