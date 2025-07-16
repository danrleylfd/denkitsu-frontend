import { createContext, useContext, useState, useEffect } from "react"
import api from "../services"

const AuthContext = createContext({})

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStorageData = async () => {
      const storagedRefreshToken = localStorage.getItem("@Denkitsu:refreshToken")
      const storagedToken = sessionStorage.getItem("@Denkitsu:token")
      const storagedUser = localStorage.getItem("@Denkitsu:user")
      if (!storagedRefreshToken || !storagedUser) return setLoading(false)
      if (!storagedToken) {
        const { refreshToken, token } = await updateToken(`Bearer ${storagedRefreshToken}`)
        localStorage.setItem("@Denkitsu:refreshToken", refreshToken)
        sessionStorage.setItem("@Denkitsu:token", token)
        api.defaults.headers.Authorization = `Bearer ${token}`
        setUser(JSON.parse(storagedUser))
        return setLoading(false)
      }
      api.defaults.headers.Authorization = `Bearer ${storagedToken}`
      setUser(JSON.parse(storagedUser))
      setLoading(false)
    }
    loadStorageData()
  }, [])

  const updateToken = async (storagedRefreshToken) => {
    try {
      const { data } = await api.post("/auth/refresh_token", { refreshToken: storagedRefreshToken })
      return data
    } catch (error) {
      console.error("Token update failed:", error.response?.data || error.message)
      throw error
    }
  }

  const completeOAuthSignIn = ({ token, refreshToken, user }) => {
    localStorage.setItem("@Denkitsu:user", JSON.stringify(user))
    localStorage.setItem("@Denkitsu:refreshToken", refreshToken)
    sessionStorage.setItem("@Denkitsu:token", token)
    api.defaults.headers.Authorization = `Bearer ${token}`
    setUser(user)
  }

  const signIn = async ({ email, password }) => {
    try {
      const response = await api.post("/auth/signin", { email, password })
      const { token, refreshToken, user: userData } = response.data
      localStorage.setItem("@Denkitsu:refreshToken", refreshToken)
      sessionStorage.setItem("@Denkitsu:token", token)
      localStorage.setItem("@Denkitsu:user", JSON.stringify(userData))
      api.defaults.headers.Authorization = `Bearer ${token}`
      setUser(userData)
    } catch (error) {
      console.error("Sign in failed:", error.response?.data || error.message)
      throw error
    }
  }

  const signUp = async ({ name, email, password }) => {
    try {
      const response = await api.post("/auth/signup", { name, email, password })
      const { token, refreshToken, user: userData } = response.data
      localStorage.setItem("@Denkitsu:refreshToken", refreshToken)
      sessionStorage.setItem("@Denkitsu:token", token)
      localStorage.setItem("@Denkitsu:user", JSON.stringify(userData))
      api.defaults.headers.Authorization = `Bearer ${token}`
      setUser(userData)
    } catch (error) {
      console.error("Sign up failed:", error.response?.data || error.message)
      throw error
    }
  }

  const signOut = () => {
    localStorage.removeItem("@Denkitsu:refreshToken")
    sessionStorage.removeItem("@Denkitsu:token")
    localStorage.removeItem("@Denkitsu:user")
    localStorage.removeItem("@Denkitsu:messages")
    setUser(null)
    delete api.defaults.headers.Authorization
  }

  const updateUser = (userData) => {
    localStorage.setItem("@Denkitsu:user", JSON.stringify({ ...user, ...userData }))
    setUser(user)
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, completeOAuthSignIn, signIn, signUp, signOut, updateUser }}>
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
