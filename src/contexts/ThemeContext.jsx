import { createContext, useState, useEffect, useContext } from "react"

const ThemeContext = createContext()

const ThemeProvider = ({ children }) => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  let themeStorage = localStorage.getItem("@Denkitsu:theme")
  const [theme, setTheme] = useState(themeStorage || (mediaQuery.matches ? "dark" : "light"))
  !themeStorage && localStorage.setItem("@Denkitsu:theme", mediaQuery.matches ? "dark" : "light")
  themeStorage = localStorage.getItem("@Denkitsu:theme")

  useEffect(() => {
    themeStorage !== theme && localStorage.setItem("@Denkitsu:theme", theme)
    // Tailwind:
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light")

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
