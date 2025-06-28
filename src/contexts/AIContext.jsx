import { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react"
import { getPrompt } from "../services/aiChat"

const AIContext = createContext()

export const AIProvider = ({ children }) => {
  const initialMessage = { id: 1, role: "assistant", content: "Olá! Como posso ajudar você hoje?\n Shift + Enter para quebrar a linha." }
  const storedAIProvider = localStorage.getItem("@Denkitsu:aiProvider")
  const storedKey = localStorage.getItem("@Denkitsu:OpenRouter")
  const storedGroqKey = localStorage.getItem("@Denkitsu:Groq")
  const storedModel = localStorage.getItem("@Denkitsu:model")
  const storedMessages = localStorage.getItem("@Denkitsu:messages")

  const [prompt, setPrompt] = useState(null)
  const [aiKey, setAIKey] = useState(storedKey || "")
  const [groqKey, setGroqKey] = useState(storedGroqKey || "")
  const [model, setModel] = useState(storedModel || "deepseek/deepseek-r1:free")
  const [aiProvider, setAIProvider] = useState(storedAIProvider || "openrouter")
  const [messages, setMessages] = useState(storedMessages ? JSON.parse(storedMessages) : [initialMessage])

  useEffect(() => {
    async function loadPrompt() {
      const promptData = await getPrompt()
      setPrompt(promptData)
    }
    loadPrompt()
  }, [])

  useEffect(() => {
    localStorage.setItem("@Denkitsu:aiProvider", aiProvider)
  }, [aiProvider])

  useEffect(() => {
    if (aiKey.trim() === "") return localStorage.removeItem("@Denkitsu:OpenRouter")
    localStorage.setItem("@Denkitsu:OpenRouter", aiKey)
  }, [aiKey])

  useEffect(() => {
    if (groqKey.trim() === "") return localStorage.removeItem("@Denkitsu:Groq")
    localStorage.setItem("@Denkitsu:Groq", groqKey)
  }, [groqKey])

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

  const aiProviderToggle = () => {
    setAIProvider((prev) => (prev === "groq"? "openrouter" : "groq"))
  }

  const clearHistory = () => {
    setMessages(prev => [
      ...prev.filter(msg => msg.role === "system"),
      initialMessage
    ])
  }

  return (
    <AIContext.Provider value={{ aiKey: aiProvider === "groq" ? groqKey : aiKey, setAIKey: aiProvider === "groq" ? setGroqKey : setAIKey, model, setModel, prompt, setPrompt, aiProvider, setAIProvider, aiProviderToggle, messages, setMessages, clearHistory }}>
      {children}
    </AIContext.Provider>
  )
}

export const useAI = () => {
  const context = useContext(AIContext)
  if (!context) throw new Error("useAI deve ser usado dentro de um <AIProvider>")
  return context
}
