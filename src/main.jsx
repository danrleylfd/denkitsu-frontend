import React from "react"
import ReactDOM from "react-dom/client"
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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
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
  </React.StrictMode>
)
