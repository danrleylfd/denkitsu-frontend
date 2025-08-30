import { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react"

import { useAuth } from "./AuthContext"
import { getTools, createTool, updateTool, deleteTool } from "../services/tool"
import { listTools } from "../services/aiChat"

import { storage } from "../utils/storage"

const ToolContext = createContext({})

const ToolProvider = ({ children }) => {
  const [tools, setTools] = useState({ internalTools: [], backendTools: [], customTools: [] })
  const [loadingTools, setLoadingTools] = useState(true)
  const [activeTools, setActiveTools] = useState(new Set())
  const { signed } = useAuth()

  const fetchTools = useCallback(async () => {
    try {
      setLoadingTools(true)
      const { data: backendData } = await listTools()
      let customData = []
      if (signed) customData = await getTools()
      setTools({
        internalTools: backendData?.internalTools || [],
        backendTools: backendData?.backendTools || [],
        customTools: customData || []
      })
    } catch (error) {
      console.error("Failed to fetch user tools:", error)
      setTools({ internalTools: [], backendTools: [], customTools: [] })
    } finally {
      setLoadingTools(false)
    }
  }, [signed])

  useEffect(() => {
    if (signed) fetchTools()
  }, [signed, fetchTools])

  useEffect(() => {
    if (loadingTools) return
    const allTools = [
      ...tools.internalTools,
      ...tools.backendTools,
      ...tools.customTools,
    ]
    const initialActiveTools = new Set()
    allTools.forEach((tool) => {
      try {
        const storedValue = storage.local.getItem(`@Denkitsu:${tool.name}`)
        if (JSON.parse(storedValue) === true) initialActiveTools.add(tool.name)
      } catch {}
    })
    setActiveTools(initialActiveTools)
  }, [tools, loadingTools])

  const handleToolToggle = useCallback((toolKey, isActive) => {
    setActiveTools(prev => {
      const newActiveTools = new Set(prev)
      if (isActive) newActiveTools.add(toolKey)
      else newActiveTools.delete(toolKey)
      return newActiveTools
    })
    storage.local.setItem(`@Denkitsu:${toolKey}`, JSON.stringify(isActive))
  }, [])

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

  const value = useMemo(() => ({
    tools, loadingTools, fetchTools, addTool, editTool, removeTool,
    activeTools, handleToolToggle
  }), [tools, loadingTools, fetchTools, addTool, editTool, removeTool, activeTools, handleToolToggle])

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
