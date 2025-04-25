"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { setUserOnline, setUserOffline } from "@/lib/user-status"

interface AuthContextType {
  user: FirebaseUser | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // E-posta ve şifre ile giriş yapma fonksiyonu
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (error: any) {
      console.error("Login error:", error)

      // Simplified error messages
      let errorMessage = "Giriş yapılırken bir hata oluştu."

      if (error.code === "auth/user-not-found") {
        errorMessage = "Kullanıcı bulunamadı."
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Şifre yanlış."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Geçersiz e-posta adresi."
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Bu hesap devre dışı bırakılmış."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin."
      }

      return { success: false, error: errorMessage }
    }
  }

  // Yeni kullanıcı kaydı fonksiyonu
  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Yeni kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const newUser = userCredential.user

      // Kullanıcı profilini güncelle
      await updateProfile(newUser, {
        displayName: name,
      })

      // Firestore'a kullanıcı bilgilerini kaydet
      await setDoc(doc(db, "users", newUser.uid), {
        uid: newUser.uid,
        email: newUser.email,
        displayName: name,
        photoURL: newUser.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: "user",
      })

      return { success: true }
    } catch (error: any) {
      console.error("Registration error:", error)

      // Simplified error messages
      let errorMessage = "Kayıt olurken bir hata oluştu."

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Bu e-posta adresi zaten kullanılıyor."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Geçersiz e-posta adresi."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Şifre çok zayıf. En az 6 karakter olmalıdır."
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "E-posta/şifre girişi etkin değil."
      }

      return { success: false, error: errorMessage }
    }
  }

  // Google ile giriş yapma fonksiyonu
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Google ile giriş hatası:", error)
      throw error
    }
  }

  // Çıkış yapma fonksiyonu
  const signOut = async () => {
    try {
      if (user) {
        await setUserOffline(user.uid)
      }
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Çıkış hatası:", error)
      throw error
    }
  }

  // Check if user is admin
  const checkAdminStatus = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        setIsAdmin(userData.role === "admin")
      } else {
        setIsAdmin(false)
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)

        // Kullanıcı bilgilerini Firestore'da güncelle
        const userRef = doc(db, "users", firebaseUser.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          // Kullanıcı zaten var, son giriş zamanını güncelle
          const userData = userSnap.data()
          setIsAdmin(userData.role === "admin")

          await setDoc(
            userRef,
            {
              lastLogin: serverTimestamp(),
            },
            { merge: true },
          )
        } else {
          // Yeni kullanıcı oluştur
          setIsAdmin(false)
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            role: "user",
          })
        }

        // Kullanıcı durumunu çevrimiçi olarak ayarla
        await setUserOnline(firebaseUser.uid)
      } else {
        setUser(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    // Sayfa kapatıldığında kullanıcı durumunu çevrimdışı olarak ayarla
    const handleBeforeUnload = async () => {
      if (user) {
        await setUserOffline(user.uid)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      unsubscribe()
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
