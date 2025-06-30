import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider } from "./contexts/AuthContext"
import { AIProvider } from "./contexts/AIContext.jsx"
import { TasksProvider } from "./contexts/TasksContext"
import { DndProvider } from "./contexts/DndContext"
import "./styles/global.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode data-oid="j1-marm">
    <ThemeProvider data-oid="apzujg:">
      <AuthProvider data-oid="752moal">
        <AIProvider data-oid="ldmy3p4">
          <TasksProvider data-oid="7v0-963">
            <DndProvider data-oid="6x9tkag">
              <App data-oid=":4l2xqv" />
            </DndProvider>
          </TasksProvider>
        </AIProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)
