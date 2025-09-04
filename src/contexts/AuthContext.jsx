import { createContext, useContext, useState, useEffect, useCallback } from "react"

import api from "../services"

import { getUserAccount } from "../services/account"

import { storage } from "../utils/storage"

const AuthContext = createContext({})

const isExtension = !!(window.chrome && chrome.runtime && chrome.runtime.id)

const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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

  const signWithOAuth = useCallback(async ({ token, refreshToken, user }) => {
    await saveSignData(token, refreshToken, user)
  }, [saveSignData])

  const signOut = useCallback(async () => {
    await storage.local.clear()
    await storage.local.clear()
    setUser(null)
    delete api.defaults.headers.Authorization
  }, [])

  const loadUser = useCallback(async (userID) => {
    if (!user) return
    const updatedUser = await getUserAccount(userID || user._id)
    if (updatedUser._id !== user._id) return updatedUser
    await storage.local.setItem("@Denkitsu:user", JSON.stringify(updatedUser))
    setUser((prev) => ({ ...prev, ...updatedUser }))
    return user
  }, [user])

  const updateUser = useCallback(async (partialUser) => {
    if (!user || user._id !== partialUser._id) return
    setUser((prev) => ({ ...prev, ...partialUser }))
    await storage.local.setItem("@Denkitsu:user", JSON.stringify(user))
    return user
  }, [user])

  useEffect(() => {
    if (!user) return
    loadUser(user._id)
  }, [])

  useEffect(() => {
    const loadStorageData = async () => {
      const storagedUser = await storage.local.getItem("@Denkitsu:user")
      const storagedRefreshToken = await storage.local.getItem("@Denkitsu:refreshToken")
      const storagedToken = await storage.session.getItem("@Denkitsu:token")
      if (storagedToken && storagedUser) {
        api.defaults.headers.Authorization = `Bearer ${storagedToken}`
        setUser(JSON.parse(storagedUser))
      } else if (storagedRefreshToken && storagedUser) {
        try {
          const response = await api.post("/auth/refresh_token", { refreshToken: `Bearer ${storagedRefreshToken}` })
          const { token, refreshToken: newRefreshToken } = response.data
          await saveSignData(token, newRefreshToken, JSON.parse(storagedUser))
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
  }, [saveSignData, signOut])

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
