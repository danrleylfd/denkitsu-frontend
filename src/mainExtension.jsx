import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter as Router } from "react-router-dom"

import App from "./AppExtension"
import "./styles/global.css"

import NotificationProvider from "./contexts/NotificationContext"
import ThemeProvider from "./contexts/ThemeContext"
import AuthProvider from "./contexts/AuthContext"
import AIProvider from "./contexts/AIContext"
import ModelProvider from "./contexts/ModelContext"
import AgentProvider from "./contexts/AgentContext"
import ToolProvider from "./contexts/ToolContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <NotificationProvider>
        <ThemeProvider>
          <AuthProvider>
            <ModelProvider>
              <AgentProvider>
                <ToolProvider>
                  <AIProvider>
                    <App />
                  </AIProvider>
                </ToolProvider>
              </AgentProvider>
            </ModelProvider>
          </AuthProvider>
        </ThemeProvider>
      </NotificationProvider>
    </Router>
  </React.StrictMode>
)
