import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "@firebase/auth"
import { createContext, useContext, useEffect, useState } from "react"
import { auth } from "../firebase"

const AuthContext = createContext()

const useAuth = () => useContext(AuthContext)

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      try {
        if (user) user.admin = (await user.getIdTokenResult()).claims.admin || false 
      } catch {
        console.log("Something went wrong!")
      } finally {
        setCurrentUser(user)
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider())
  const signout = () => signOut(auth)

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { useAuth, AuthProvider }
