import { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react"
import { getPrompt } from "../services/aiChat"

const AIContext = createContext()

export const AIProvider = ({ children }) => {
  const storedAIProvider = localStorage.getItem("@Denkitsu:aiProvider")
  const storedGroqKey = localStorage.getItem("@Denkitsu:Groq")
  const storedOpenRouterKey = localStorage.getItem("@Denkitsu:OpenRouter")
  const storedModelGroq = localStorage.getItem("@Denkitsu:GroqModel")
  const storedOpenRouterModel = localStorage.getItem("@Denkitsu:OpenRouterModel")
  const storedMessages = localStorage.getItem("@Denkitsu:messages")

  const initialMessage = { id: 1, role: "assistant", content: "Olá! Como posso ajudar você hoje?\n Shift + Enter para quebrar a linha." }

  const [prompt, setPrompt] = useState(null)
  const [aiProvider, setAIProvider] = useState(storedAIProvider || "openrouter")
  const [groqKey, setGroqKey] = useState(storedGroqKey || "")
  const [openRouterKey, setOpenRouterKey] = useState(storedOpenRouterKey || "")
  const [groqModel, setGroqModel] = useState(storedModelGroq || "deepseek-r1-distill-llama-70b")
  const [openRouterModel, setOpenRouterModel] = useState(storedOpenRouterModel || "deepseek/deepseek-r1:free")
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
    if (groqKey.trim() === "") return localStorage.removeItem("@Denkitsu:Groq")
    localStorage.setItem("@Denkitsu:Groq", groqKey)
  }, [groqKey])

  useEffect(() => {
    if (openRouterKey.trim() === "") return localStorage.removeItem("@Denkitsu:OpenRouter")
    localStorage.setItem("@Denkitsu:OpenRouter", openRouterKey)
  }, [openRouterKey])

  useEffect(() => {
    localStorage.setItem("@Denkitsu:GroqModel", groqModel)
  }, [groqModel])

  useEffect(() => {
    localStorage.setItem("@Denkitsu:OpenRouterModel", openRouterModel)
  }, [openRouterModel])

  useEffect(() => {
    if (!prompt) return
    setMessages((prev) => {
      const hasSystemMessage = prev.some((msg) => msg.role === "system")
      if (!hasSystemMessage) return prompt.map((msg, pos) => ({ id: pos,...msg }))
      return prev
    })
    localStorage.setItem("@Denkitsu:messages", JSON.stringify(messages))
  }, [prompt, messages])

  const aiProviderToggle = () => {
    setAIProvider((prev) => (prev === "groq" ? "openrouter" : "groq"))
  }

  const clearHistory = () => {
    setMessages((prev) => [...prev.filter((msg) => msg.role === "system"), initialMessage])
  }

  const values = {
    prompt,
    setPrompt,
    aiProvider,
    setAIProvider,
    aiProviderToggle,
    aiKey: aiProvider === "groq" ? groqKey : openRouterKey,
    setAIKey: aiProvider === "groq" ? setGroqKey : setOpenRouterKey,
    model: aiProvider === "groq" ? groqModel : openRouterModel,
    setModel: aiProvider === "groq" ? setGroqModel : setOpenRouterModel,
    messages,
    setMessages,
    clearHistory
  }

  return <AIContext.Provider value={values}>{children}</AIContext.Provider>
}

export const useAI = () => {
  const context = useContext(AIContext)
  if (!context) throw new Error("useAI deve ser usado dentro de um <AIProvider>")
  return context
}
