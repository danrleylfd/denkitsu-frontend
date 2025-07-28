import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter as Router } from "react-router-dom"

import App from "./App"
import "../styles/global.css"

import NotificationProvider from "../contexts/NotificationContext"
import ThemeProvider from "../contexts/ThemeContext"
import AuthProvider from "../contexts/AuthContext"
import AIProvider from "../contexts/AIContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <NotificationProvider>
        <ThemeProvider>
          <AuthProvider>
            <AIProvider>
              <App />
            </AIProvider>
          </AuthProvider>
        </ThemeProvider>
      </NotificationProvider>
    </Router>
  </React.StrictMode>
)
