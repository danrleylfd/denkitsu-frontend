import { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react"

import { TOOL_DEFINITIONS } from "../constants/tools"

const AIContext = createContext()

const AIProvider = ({ children }) => {
  const storedAIProvider = localStorage.getItem("@Denkitsu:aiProvider")
  const storedModelGroq = localStorage.getItem("@Denkitsu:GroqModel")
  const storedOpenRouterModel = localStorage.getItem("@Denkitsu:OpenRouterModel")
  const storedCustomPrompt = localStorage.getItem("@Denkitsu:customPrompt")
  const storedGroqKey = localStorage.getItem("@Denkitsu:Groq")
  const storedOpenRouterKey = localStorage.getItem("@Denkitsu:OpenRouter")
  const storedStream = JSON.parse(localStorage.getItem("@Denkitsu:Stream"))
  const storedMessages = localStorage.getItem("@Denkitsu:messages")

  const [aiProvider, setAIProvider] = useState(storedAIProvider || "groq")
  const [groqModel, setGroqModel] = useState(storedModelGroq || "deepseek-r1-distill-llama-70b")
  const [openRouterModel, setOpenRouterModel] = useState(storedOpenRouterModel || "deepseek/deepseek-r1:free")
  const [freeModels, setFreeModels] = useState([])
  const [payModels, setPayModels] = useState([])
  const [groqModels, setGroqModels] = useState([])
  const [customPrompt, setCustomPrompt] = useState(storedCustomPrompt || `Responda em ${navigator.language}`)
  const [groqKey, setGroqKey] = useState(storedGroqKey || "")
  const [openRouterKey, setOpenRouterKey] = useState(storedOpenRouterKey || "")
  const [stream, setStream] = useState(storedStream === null ? false : storedStream)
  const [imageUrls, setImageUrls] = useState([])
  const [userPrompt, setUserPrompt] = useState("")
  const [messages, setMessages] = useState(storedMessages ? JSON.parse(storedMessages) : [])
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [activeTools, setActiveTools] = useState(() => {
    const initialTools = new Set()
    TOOL_DEFINITIONS.forEach((tool) => {
      try {
        const storedValue = localStorage.getItem(`@Denkitsu:${tool.key}`)
        if (JSON.parse(storedValue) === true) initialTools.add(tool.key)
      } catch {}
    })
    return initialTools
  })

  useEffect(() => (localStorage.setItem("@Denkitsu:aiProvider", aiProvider)), [aiProvider])
  useEffect(() => (localStorage.setItem("@Denkitsu:GroqModel", groqModel)), [groqModel])
  useEffect(() => (localStorage.setItem("@Denkitsu:OpenRouterModel", openRouterModel)), [openRouterModel])
  useEffect(() => (localStorage.setItem("@Denkitsu:customPrompt", customPrompt)), [customPrompt])
  useEffect(() => (localStorage.setItem("@Denkitsu:Stream", stream)), [stream])

  const handleToolToggle = useCallback((toolKey, isActive) => {
    setActiveTools(prev => {
      const newActiveTools = new Set(prev)
      if (isActive) newActiveTools.add(toolKey)
      else newActiveTools.delete(toolKey)
      return newActiveTools
    })
  }, [])

  useEffect(() => {
    if (groqKey.trim() === "") return localStorage.removeItem("@Denkitsu:Groq")
    localStorage.setItem("@Denkitsu:Groq", groqKey)
  }, [groqKey])

  useEffect(() => {
    if (openRouterKey.trim() === "") return localStorage.removeItem("@Denkitsu:OpenRouter")
    localStorage.setItem("@Denkitsu:OpenRouter", openRouterKey)
  }, [openRouterKey])

  useEffect(() => {
    setMessages((prev) => {
      const hasSystemMessage = prev.some((msg) => msg.role === "system")
      if (!hasSystemMessage) return [{ role: "system", content: customPrompt }]
      return prev
    })
    localStorage.setItem("@Denkitsu:messages", JSON.stringify(messages))
  }, [messages, customPrompt])

  const aiProviderToggle = useCallback(() => setAIProvider((prev) => (prev === "groq" ? "openrouter" : "groq")), [])
  const clearHistory = useCallback(() => setMessages([{ role: "system", content: customPrompt }]), [customPrompt])
  const toggleStream = useCallback(() => setStream(s => !s), [])
  const toggleListening = useCallback(() => setListening(l => !l), [])

  const speakResponse = useCallback((text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        text
          .replace(/!\[.*?\]\(.*?\)/g, "")
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
          .replace(/[^a-zA-Z0-9À-ÿ,.\-!?;\s]/g, "")
      )
      utterance.lang = "pt-BR"
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    } else {
      console.warn("Speech Synthesis API not supported in this browser.")
    }
  }, [])

  const values = useMemo(() => ({
    stream, setStream, toggleStream,
    speaking, setSpeaking, speakResponse,
    listening, setListening, toggleListening,
    activeTools, handleToolToggle,
    imageUrls, setImageUrls,
    aiProvider, setAIProvider, aiProviderToggle,
    aiKey: aiProvider === "groq" ? groqKey : openRouterKey,
    setAIKey: aiProvider === "groq" ? setGroqKey : setOpenRouterKey,
    model: aiProvider === "groq" ? groqModel : openRouterModel,
    setModel: aiProvider === "groq" ? setGroqModel : setOpenRouterModel,
    freeModels, setFreeModels,
    payModels, setPayModels,
    groqModels, setGroqModels,
    customPrompt, setCustomPrompt,
    userPrompt, setUserPrompt,
    messages, setMessages, clearHistory,
  }), [
    stream, speaking, listening, activeTools, handleToolToggle, imageUrls,
    aiProvider, groqKey, openRouterKey, groqModel, openRouterModel,
    freeModels, payModels, groqModels, customPrompt, userPrompt, messages,
    toggleStream, speakResponse, toggleListening, aiProviderToggle, clearHistory,
  ])
  return (
    <AIContext.Provider value={values}>
      {children}
    </AIContext.Provider>
  )
}

const useAI = () => {
  const context = useContext(AIContext)
  if (!context) throw new Error("useAI deve ser usado dentro de um <AIProvider>")
  return context
}

export { useAI }
export default AIProvider
