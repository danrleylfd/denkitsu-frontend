import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../services"

const AuthContext = createContext({})

const isExtension = !!(window.chrome && chrome.runtime && chrome.runtime.id)

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const storage = {
    getItem: async (key) => {
      if (isExtension) {
        const result = await chrome.storage.local.get(key)
        return result[key] || null
      }
      return localStorage.getItem(key)
    },
    setItem: async (key, value) => {
      if (isExtension) {
        return chrome.storage.local.set({ [key]: value })
      }
      return localStorage.setItem(key, value)
    },
    removeItem: async (key) => {
      if (isExtension) {
        return chrome.storage.local.remove(key)
      }
      return localStorage.removeItem(key)
    }
  }

  const signOut = useCallback(async () => {
    await storage.removeItem("@Denkitsu:refreshToken")
    await storage.removeItem("@Denkitsu:user")
    if (!isExtension) sessionStorage.removeItem("@Denkitsu:token")

    setUser(null)
    delete api.defaults.headers.Authorization
  }, [])

  const completeSignIn = useCallback(async (token, refreshToken, userData) => {
    await storage.setItem("@Denkitsu:user", JSON.stringify(userData))
    if (refreshToken) await storage.setItem("@Denkitsu:refreshToken", refreshToken)
    if (!isExtension) sessionStorage.setItem("@Denkitsu:token", token)
    api.defaults.headers.Authorization = `Bearer ${token}`
    setUser(userData)
  }, [])

  useEffect(() => {
    const loadStorageData = async () => {
      const storagedUser = await storage.getItem("@Denkitsu:user")
      const storagedRefreshToken = await storage.getItem("@Denkitsu:refreshToken")
      const storagedToken = isExtension ? null : sessionStorage.getItem("@Denkitsu:token")
      if (storagedToken && storagedUser) {
        api.defaults.headers.Authorization = `Bearer ${storagedToken}`
        setUser(JSON.parse(storagedUser))
      } else if (storagedRefreshToken && storagedUser) {
        try {
          const response = await api.post("/auth/refresh_token", { refreshToken: `Bearer ${storagedRefreshToken}` })
          const { token, refreshToken: newRefreshToken } = response.data
          await completeSignIn(token, newRefreshToken, JSON.parse(storagedUser))
        } catch (error) {
          console.error("Falha ao atualizar token, deslogando.", error)
          await signOut()
        }
      }
      setLoading(false)
    }
    loadStorageData()
    if (isExtension) {
      const listener = (changes, area) => {
        if (area === 'local' && (changes["@Denkitsu:user"] || changes["@Denkitsu:refreshToken"])) {
          console.log("AuthContext: Detectou mudança no storage, recarregando estado.")
          loadStorageData()
        }
      }
      chrome.storage.onChanged.addListener(listener)
      return () => chrome.storage.onChanged.removeListener(listener)
    }

  }, [signOut, completeSignIn])

  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post("/auth/signin", { email, password })
    const { token, refreshToken, user: userData } = response.data
    await completeSignIn(token, refreshToken, userData)
  }, [completeSignIn])

  const signUp = useCallback(async ({ name, email, password }) => {
    const response = await api.post("/auth/signup", { name, email, password })
    const { token, refreshToken, user: userData } = response.data
    await completeSignIn(token, refreshToken, userData)
  }, [completeSignIn])

  const completeOAuthSignIn = useCallback(async ({ token, refreshToken, user }) => {
    await completeSignIn(token, refreshToken, user)
  }, [completeSignIn])

  const updateUser = useCallback(async (newUserData) => {
    await storage.setItem("@Denkitsu:user", JSON.stringify(newUserData))
    setUser(newUserData)
  }, [])

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signUp, signOut, updateUser, completeOAuthSignIn }}>
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth deve ser usado dentro de um <AuthProvider>")
  return context
}

export { useAuth }
export default AuthProvider
