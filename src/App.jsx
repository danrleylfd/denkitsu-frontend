import { ThemeProvider as StyledThemeProvider } from "styled-components"
import AppRoutes from "./routes"

import Base from "./styles/base"
import ThemeProvider, { useTheme } from "./contexts/ThemeContext"
import { lightTheme, darkTheme } from "./styles/themes"

const AppContent = () => {
  const { theme } = useTheme()
  return (
    <StyledThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <Base />
      <AppRoutes />
    </StyledThemeProvider>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
