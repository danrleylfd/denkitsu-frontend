import { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react"

import { useAuth } from "./AuthContext"
import { useNotification } from "./NotificationContext"

import { getTools, createTool, updateTool, deleteTool } from "../services/tool"
import { listTools } from "../services/aiChat"
import { storage } from "../utils/storage"

const ToolContext = createContext({})

const ToolProvider = ({ children }) => {
  const [tools, setTools] = useState({ internalTools: [], backendTools: [], customTools: [] })
  const [loadingTools, setLoadingTools] = useState(true)
  const [activeTools, setActiveTools] = useState(new Set())
  const { signed, user } = useAuth()
  const { notifyWarning } = useNotification()

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

    const loadActiveTools = async () => {
      const allTools = [
        ...tools.internalTools,
        ...tools.backendTools,
        ...tools.customTools,
      ]
      const initialActiveTools = new Set()

      for (const tool of allTools) {
        if (tool && tool.name) {
          try {
            const storedValue = await storage.local.getItem(`@Denkitsu:${tool.name}`)
            if (JSON.parse(storedValue) === true) initialActiveTools.add(tool.name)
          } catch {}
        }
      }
      setActiveTools(initialActiveTools)
    }
    loadActiveTools()
  }, [tools, loadingTools])

  const handleToolToggle = useCallback((toolKey) => {
    if (typeof toolKey === "undefined") {
      console.error("handleToolToggle foi chamado com uma toolKey indefinida.")
      return
    }

    if (user?.plan === "free") {
      if (activeTools.size >= 3) {
        notifyWarning("Plano Free permite no máximo 3 ferramentas ativas. Desative uma ou faça upgrade para o Plano Pro.")
        return
      }
    }

    setActiveTools(prevActiveTools => {
      const newActiveTools = new Set(prevActiveTools)
      const wasActive = newActiveTools.has(toolKey)
      if (wasActive) newActiveTools.delete(toolKey)
      else newActiveTools.add(toolKey)
      storage.local.setItem(`@Denkitsu:${toolKey}`, JSON.stringify(!wasActive))
      return newActiveTools
    })
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
  }), [tools, loadingTools, activeTools, fetchTools, addTool, editTool, removeTool, handleToolToggle])

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
