// import { ThemeProvider as StyledThemeProvider } from "styled-components"

// import Base from "./styles/base"
import AppRoutes from "./routes"
// import { useTheme } from "./contexts/ThemeContext"
// import { lightTheme, darkTheme } from "./styles/themes"

const App = () => {
  // const { theme } = useTheme()
  return (
    // <StyledThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      // <Base />
      <AppRoutes />
    // </StyledThemeProvider>
  )
}

export default App
