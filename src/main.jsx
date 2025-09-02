import React from "react"
import ReactDOM from "react-dom/client"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

import App from "./App.jsx"

import NotificationProvider from "./contexts/NotificationContext"
import BackgroundProvider from "./contexts/BackgroundContext"
import ThemeProvider from "./contexts/ThemeContext"
import AuthProvider from "./contexts/AuthContext"
import AIProvider from "./contexts/AIContext.jsx"
import ModelProvider from "./contexts/ModelContext.jsx"
import AgentProvider from "./contexts/AgentContext.jsx"
import ToolProvider from "./contexts/ToolContext"
import TasksProvider from "./contexts/TasksContext"
import DndProvider from "./contexts/DndContext"

import "./styles/global.css"

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <NotificationProvider>
        <BackgroundProvider>
          <ThemeProvider>
            <AuthProvider>
              <ModelProvider>
                <AgentProvider>
                  <ToolProvider>
                    <AIProvider>
                      <TasksProvider>
                        <DndProvider>
                          <App />
                        </DndProvider>
                      </TasksProvider>
                    </AIProvider>
                  </ToolProvider>
                </AgentProvider>
              </ModelProvider>
            </AuthProvider>
          </ThemeProvider>
        </BackgroundProvider>
      </NotificationProvider>
    </Elements>
  </React.StrictMode>
)
