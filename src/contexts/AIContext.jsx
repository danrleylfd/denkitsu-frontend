import { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react"
import { getPrompt } from "../services/aiChat"

const AIContext = createContext()

export const AIProvider = ({ children }) => {
  const initialMessage = { id: 1, role: "assistant", content: "Olá! Como posso ajudar você hoje?\n Shift + Enter para quebrar a linha." }
  const storedKey = localStorage.getItem("openRouterApiKey")
  const storedModel = localStorage.getItem("@Denkitsu:model")
  const storedMessages = localStorage.getItem("@Denkitsu:messages")

  const [prompt, setPrompt] = useState(null)
  const [aiKey, setAiKey] = useState(storedKey || "")
  const [model, setModel] = useState(storedModel || "deepseek/deepseek-r1:free")
  const [messages, setMessages] = useState(storedMessages ? JSON.parse(storedMessages) : [initialMessage])

  useEffect(() => {
    async function loadPrompt() {
      const promptData = await getPrompt()
      setPrompt(promptData)
    }
    loadPrompt()
  }, [])

  useEffect(() => {
    if (aiKey.trim() === "") return localStorage.removeItem("openRouterApiKey")
    localStorage.setItem("openRouterApiKey", aiKey)
  }, [aiKey])

  useEffect(() => {
    localStorage.setItem("@Denkitsu:model", model)
  }, [model])

  useEffect(() => {
    if(!prompt) return
    setMessages(prev => {
      const hasSystemMessage = prev.some(msg => msg.role === "system")
      if (!hasSystemMessage) return [{ id: 0, ...prompt }, ...prev]
      return prev
    })
    localStorage.setItem("@Denkitsu:messages", JSON.stringify(messages))
  }, [prompt, messages])

  const clearHistory = () => {
    setMessages(prev => [
      ...prev.filter(msg => msg.role === "system"),
      initialMessage
    ])
  }

  return (
    <AIContext.Provider value={{ aiKey, setAiKey, model, setModel, prompt, setPrompt, messages, setMessages, clearHistory }}>
      {children}
    </AIContext.Provider>
  )
}

export const useAI = () => {
  const context = useContext(AIContext)
  if (!context) throw new Error("useAI deve ser usado dentro de um <AIProvider>")
  return context
}
