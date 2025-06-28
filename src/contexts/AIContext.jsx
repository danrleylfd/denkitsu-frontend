import { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react"
import { getPrompt } from "../services/aiChat"

const AIContext = createContext()

export const AIProvider = ({ children }) => {
  const initialMessage = { id: 1, role: "assistant", content: "Olá! Como posso ajudar você hoje?\n Shift + Enter para quebrar a linha." }
  const storedAIProvider = localStorage.getItem("@Denkitsu:aiProvider")
  const storedOpenRouterKey = localStorage.getItem("@Denkitsu:OpenRouter")
  const storedGroqKey = localStorage.getItem("@Denkitsu:Groq")
  const storedModelGroq = localStorage.getItem("@Denkitsu:GroqModel")
  const storedOpenRouterModel = localStorage.getItem("@Denkitsu:OpenRouterModel")
  const storedMessages = localStorage.getItem("@Denkitsu:messages")

  const [prompt, setPrompt] = useState(null)
  const [aiProvider, setAIProvider] = useState(storedAIProvider || "openrouter")
  const [openRouterKey, setOpenRouterKey] = useState(storedOpenRouterKey || "")
  const [groqKey, setGroqKey] = useState(storedGroqKey || "")
  const [openRouterModel, setOpenRouterModel] = useState(storedOpenRouterModel || "deepseek/deepseek-r1:free")
  const [groqModel, setGroqModel] = useState(storedModelGroq || "deepseek-r1-distill-llama-70b")
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
    if (openRouterKey.trim() === "") return localStorage.removeItem("@Denkitsu:OpenRouter")
    localStorage.setItem("@Denkitsu:OpenRouter", openRouterKey)
  }, [openRouterKey])

  useEffect(() => {
    if (groqKey.trim() === "") return localStorage.removeItem("@Denkitsu:Groq")
    localStorage.setItem("@Denkitsu:Groq", groqKey)
  }, [groqKey])

  useEffect(() => {
    localStorage.setItem("@Denkitsu:groqModel", groqModel)
  }, [groqModel])

  useEffect(() => {
    localStorage.setItem("@Denkitsu:openRouterModel", openRouterModel)
  }, [openRouterModel])

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

  const values = {
    prompt, setPrompt,
    aiProvider, setAIProvider, aiProviderToggle,
    aiKey: aiProvider === "groq" ? groqKey : openRouterKey, setAIKey: aiProvider === "groq" ? setGroqKey : setOpenRouterKey,
    model: aiProvider === "groq" ? groqModel : openRouterModel, setModel: aiProvider === "groq"? setGroqModel : setOpenRouterModel,
    messages, setMessages, clearHistory
  }

  return (
    <AIContext.Provider value={values}>
      {children}
    </AIContext.Provider>
  )
}

export const useAI = () => {
  const context = useContext(AIContext)
  if (!context) throw new Error("useAI deve ser usado dentro de um <AIProvider>")
  return context
}
