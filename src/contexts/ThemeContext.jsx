import { createContext, useState, useEffect, useContext } from "react"
import { storage } from "../utils/storage"

const ThemeContext = createContext()

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    return mediaQuery.matches ? "dark" : "light"
  })

  useEffect(() => {
    const loadPersistedTheme = async () => {
      const themeStorage = await storage.local.getItem("@Denkitsu:theme")
      if (themeStorage) setTheme(themeStorage)
    }
    loadPersistedTheme()
  }, [])

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
    storage.local.setItem("@Denkitsu:theme", theme)
  }, [theme])

  const toggleTheme = () => setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme deve ser usado dentro de um <ThemeProvider>")
  return context
}

export { useTheme }
export default ThemeProvider
