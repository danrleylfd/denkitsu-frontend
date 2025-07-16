import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../services"

const AuthContext = createContext({})

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const signOut = useCallback(() => {
    localStorage.removeItem("@Denkitsu:refreshToken")
    sessionStorage.removeItem("@Denkitsu:token")
    localStorage.removeItem("@Denkitsu:user")
    localStorage.removeItem("@Denkitsu:messages")
    setUser(null)
    delete api.defaults.headers.Authorization
  }, [])

  const completeSignIn = useCallback((token, refreshToken, userData) => {
    localStorage.setItem("@Denkitsu:user", JSON.stringify(userData))
    if (refreshToken) localStorage.setItem("@Denkitsu:refreshToken", refreshToken)
    sessionStorage.setItem("@Denkitsu:token", token)
    api.defaults.headers.Authorization = `Bearer ${token}`
    setUser(userData)
  }, [])

  useEffect(() => {
    const loadStorageData = async () => {
      const storagedRefreshToken = localStorage.getItem("@Denkitsu:refreshToken")
      const storagedToken = sessionStorage.getItem("@Denkitsu:token")
      const storagedUser = localStorage.getItem("@Denkitsu:user")

      if (storagedToken && storagedUser) {
        api.defaults.headers.Authorization = `Bearer ${storagedToken}`
        setUser(JSON.parse(storagedUser))
      } else if (storagedRefreshToken && storagedUser) {
        try {
          const response = await api.post("/auth/refresh_token", { refreshToken: `Bearer ${storagedRefreshToken}` })
          const { token, refreshToken: newRefreshToken } = response.data
          completeSignIn(token, newRefreshToken, JSON.parse(storagedUser))
        } catch (error) {
          console.error("Falha ao atualizar token, deslogando.", error)
          signOut()
        }
      }
      setLoading(false)
    }
    loadStorageData()
  }, [signOut, completeSignIn])

  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post("/auth/signin", { email, password })
    const { token, refreshToken, user: userData } = response.data
    completeSignIn(token, refreshToken, userData)
  }, [completeSignIn])

  const signUp = useCallback(async ({ name, email, password }) => {
    const response = await api.post("/auth/signup", { name, email, password })
    const { token, refreshToken, user: userData } = response.data
    completeSignIn(token, refreshToken, userData)
  }, [completeSignIn])

  const completeOAuthSignIn = useCallback(({ token, refreshToken, user }) => {
    completeSignIn(token, refreshToken, user)
  }, [completeSignIn])

  const updateUser = useCallback((newUserData) => {
    localStorage.setItem("@Denkitsu:user", JSON.stringify(newUserData))
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
