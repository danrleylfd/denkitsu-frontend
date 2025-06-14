import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider } from "./contexts/AuthContext"
import { AIProvider } from "./contexts/AIContext.jsx"
import { KanbanProvider } from "./contexts/KanbanContext"
import "./styles/base.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AIProvider>
          <KanbanProvider>
            <App />
          </KanbanProvider>
        </AIProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)
