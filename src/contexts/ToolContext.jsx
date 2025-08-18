import { createContext, useState, useEffect, useContext, useCallback } from "react"
import { useAuth } from "./AuthContext"
import { getTools, createTool, updateTool, deleteTool } from "../services/tool"

const ToolContext = createContext({})

const ToolProvider = ({ children }) => {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const { signed } = useAuth()

  const fetchTools = useCallback(async () => {
    if (!signed) {
      setTools([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const userTools = await getTools()
      setTools(userTools || [])
    } catch (error) {
      console.error("Failed to fetch user tools:", error)
      setTools([])
    } finally {
      setLoading(false)
    }
  }, [signed])

  useEffect(() => {
    fetchTools()
  }, [fetchTools])

  const addTool = async (toolData) => {
    const newTool = await createTool(toolData)
    setTools(prev => [newTool, ...prev])
    return newTool
  }

  const editTool = async (toolId, toolData) => {
    const updatedTool = await updateTool(toolId, toolData)
    setTools(prev => prev.map(t => t._id === toolId ? updatedTool : t))
    return updatedTool
  }

  const removeTool = async (toolId) => {
    await deleteTool(toolId)
    setTools(prev => prev.filter(t => t._id !== toolId))
  }

  const value = { tools, loading, fetchTools, addTool, editTool, removeTool }

  return (
    <ToolContext.Provider value={value}>
      {children}
    </ToolContext.Provider>
  )
}

const useTools = () => {
  const context = useContext(ToolContext)
  if (!context) {
    throw new Error("useTools must be used within a ToolProvider")
  }
  return context
}

export { useTools }
export default ToolProvider
