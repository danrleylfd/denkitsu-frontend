import { createContext, useState, useEffect, useContext, useCallback } from "react"
import { useAuth } from "./AuthContext"
import { getTools } from "../services/tool"
import { listTools } from "../services/aiChat" // Importar o serviço de listagem

const ToolContext = createContext({})

const ToolProvider = ({ children }) => {
  const [tools, setTools] = useState({ internalTools: [], backendTools: [], customTools: [] })
  const [loading, setLoading] = useState(true)
  const { signed } = useAuth()

  const fetchTools = useCallback(async () => {
    if (!signed) {
      setTools({ internalTools: [], backendTools: [], customTools: [] })
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const { data: backendData } = await listTools()
      const customData = await getTools()
      setTools({
        internalTools: backendData?.internalTools || [],
        backendTools: backendData?.backendTools || [],
        customTools: customData || []
      })
    } catch (error) {
      console.error("Failed to fetch user tools:", error)
      setTools({ internalTools: [], backendTools: [], customTools: [] })
    } finally {
      setLoading(false)
    }
  }, [signed])

  useEffect(() => {
    fetchTools()
  }, [fetchTools])

  const addTool = async (toolData) => {
    const newTool = await createTool(toolData)
    setTools(prev => ({ ...prev, customTools: [newTool, ...prev.customTools] }))
    return newTool
  }

  const editTool = async (toolId, toolData) => {
    const updatedTool = await updateTool(toolId, toolData)
    setTools(prev => ({ ...prev, customTools: prev.customTools.map(t => t._id === toolId ? updatedTool : t) }))
    return updatedTool
  }

  const removeTool = async (toolId) => {
    await deleteTool(toolId)
    setTools(prev => ({ ...prev, customTools: prev.customTools.filter(t => t._id !== toolId) }))
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
