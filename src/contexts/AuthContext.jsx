import { createContext, useContext, useState, useEffect, useCallback } from "react"

import api from "../services"
import { getUserAccount } from "../services/account"
import { storage } from "../utils/storage"

const AuthContext = createContext({})

const isExtension = !!(window.chrome && chrome.runtime && chrome.runtime.id)

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const signOut = useCallback(async () => {
    await storage.local.clear()
    await storage.session.clear()
    setUser(null)
    delete api.defaults.headers.Authorization
  }, [])

  const loadUser = useCallback(async (userId) => {
    const targetUserId = userId || user?._id
    if (!targetUserId) return null
    try {
      const userData = await getUserAccount(targetUserId)
      if (targetUserId === user?._id) {
        setUser(userData)
        await storage.local.setItem("@Denkitsu:user", JSON.stringify(userData))
      }
      return userData
    } catch (error) {
      console.error(`Falha ao buscar dados do usuário ${targetUserId}:`, error)
      if (targetUserId === user?._id) await signOut()
      throw error
    }
  }, [user?._id, signOut])

  const updateUser = useCallback(async (partialUserData) => {
    if (!user) return
    const updatedUser = { ...user, ...partialUserData }
    setUser(updatedUser)
    await storage.local.setItem("@Denkitsu:user", JSON.stringify(updatedUser))
  }, [user])

  const saveSignData = useCallback(async (token, refreshToken, userData) => {
    await storage.local.setItem("@Denkitsu:user", JSON.stringify(userData))
    if (refreshToken) await storage.local.setItem("@Denkitsu:refreshToken", refreshToken)
    await storage.session.setItem("@Denkitsu:token", token)
    api.defaults.headers.Authorization = `Bearer ${token}`
    setUser(userData)
  }, [])

  const signUp = useCallback(async ({ name, email, password }) => {
    const response = await api.post("/auth/signup", { name, email, password })
    const { token, refreshToken, user: userData } = response.data
    await saveSignData(token, refreshToken, userData)
  }, [saveSignData])

  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post("/auth/signin", { email, password })
    const { token, refreshToken, user: userData } = response.data
    await saveSignData(token, refreshToken, userData)
  }, [saveSignData])

  const signWithOAuth = useCallback(async ({ token, refreshToken }) => {
    await storage.session.setItem("@Denkitsu:token", token)
    if (refreshToken) await storage.local.setItem("@Denkitsu:refreshToken", refreshToken)
    api.defaults.headers.Authorization = `Bearer ${token}`
    await loadUser()
  }, [loadUser])

  useEffect(() => {
    const loadStorageData = async () => {
      const storagedRefreshToken = await storage.local.getItem("@Denkitsu:refreshToken")
      const storagedToken = await storage.session.getItem("@Denkitsu:token")
      if (storagedToken) {
        api.defaults.headers.Authorization = `Bearer ${storagedToken}`
        const storagedUser = await storage.local.getItem("@Denkitsu:user")
        if (storagedUser) setUser(JSON.parse(storagedUser))
        else await loadUser()
      } else if (storagedRefreshToken) {
        try {
          const response = await api.post("/auth/refresh_token", { refreshToken: `Bearer ${storagedRefreshToken}` })
          const { token, refreshToken: newRefreshToken } = response.data
          await storage.session.setItem("@Denkitsu:token", token)
          await storage.local.setItem("@Denkitsu:refreshToken", newRefreshToken)
          await loadUser()
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
        if (area === "local" || area === "session") {
          if (changes["@Denkitsu:user"] || changes["@Denkitsu:refreshToken"] || changes["@Denkitsu:token"]) {
            console.log("AuthContext: Detectou mudança no storage da extensão, recarregando estado.")
            loadStorageData()
          }
        }
      }
      chrome.storage.onChanged.addListener(listener)
      return () => chrome.storage.onChanged.removeListener(listener)
    }
  }, [signOut, loadUser])

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signUp, signIn, signWithOAuth, signOut, loadUser, updateUser }}>
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
