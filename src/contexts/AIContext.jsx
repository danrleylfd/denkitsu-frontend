import { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react"

import { TOOL_DEFINITIONS } from "../constants/tools"

import useMessage from "../hooks/message"
import useAudio from "../hooks/audio"

const AIContext = createContext()

const isExtension = !!(window.chrome && chrome.runtime && chrome.runtime.id)

const storage = {
  getItem: async (key) => {
    if (isExtension) {
      const result = await chrome.storage.local.get(key)
      return result[key] || null
    }
    return localStorage.getItem(key)
  },
  setItem: async (key, value) => {
    if (isExtension) {
      return chrome.storage.local.set({ [key]: value })
    }
    return localStorage.setItem(key, value)
  }
}


const AIProvider = ({ children }) => {
  const [aiProvider, setAIProvider] = useState("groq")
  const [groqModel, setGroqModel] = useState("deepseek-r1-distill-llama-70b")
  const [openRouterModel, setOpenRouterModel] = useState("deepseek/deepseek-r1:free")
  const [freeModels, setFreeModels] = useState([])
  const [payModels, setPayModels] = useState([])
  const [groqModels, setGroqModels] = useState([])
  const [customPrompt, setCustomPrompt] = useState(`Responda em ${navigator.language}`)
  const [groqKey, setGroqKey] = useState("")
  const [openRouterKey, setOpenRouterKey] = useState("")
  const [stream, setStream] = useState(false)
  const [imageUrls, setImageUrls] = useState([])
  const [userPrompt, setUserPrompt] = useState("")
  const [messages, setMessages] = useState([])
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [audioFile, setAudioFile] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState("Padrão")
  const [activeTools, setActiveTools] = useState(new Set())
  const [isContextLoading, setIsContextLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const [
        storedAIProvider, storedGroqModel, storedOpenRouterModel, storedCustomPrompt,
        storedGroqKey, storedOpenRouterKey, storedStream, storedMessages
      ] = await Promise.all([
        storage.getItem("@Denkitsu:aiProvider"),
        storage.getItem("@Denkitsu:GroqModel"),
        storage.getItem("@Denkitsu:OpenRouterModel"),
        storage.getItem("@Denkitsu:customPrompt"),
        storage.getItem("@Denkitsu:Groq"),
        storage.getItem("@Denkitsu:OpenRouter"),
        storage.getItem("@Denkitsu:Stream"),
        storage.getItem("@Denkitsu:messages"),
      ])

      if (storedAIProvider) setAIProvider(storedAIProvider)
      if (storedGroqModel) setGroqModel(storedGroqModel)
      if (storedOpenRouterModel) setOpenRouterModel(storedOpenRouterModel)
      if (storedCustomPrompt) setCustomPrompt(storedCustomPrompt)
      if (storedGroqKey) setGroqKey(storedGroqKey)
      if (storedOpenRouterKey) setOpenRouterKey(storedOpenRouterKey)
      if (storedStream !== null) setStream(JSON.parse(storedStream))
      setMessages(storedMessages ? JSON.parse(storedMessages) : [{ role: "system", content: storedCustomPrompt || `Responda em ${navigator.language}` }])
     
      const initialTools = new Set()
      for (const tool of TOOL_DEFINITIONS) {
        try {
          const storedValue = await storage.getItem(`@Denkitsu:${tool.key}`)
          if (JSON.parse(storedValue) === true) initialTools.add(tool.key)
        } catch {}
      }
      setActiveTools(initialTools)
      setIsContextLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => { if (!isContextLoading) storage.setItem("@Denkitsu:aiProvider", aiProvider) }, [aiProvider, isContextLoading])
  useEffect(() => { if (!isContextLoading) storage.setItem("@Denkitsu:GroqModel", groqModel) }, [groqModel, isContextLoading])
  useEffect(() => { if (!isContextLoading) storage.setItem("@Denkitsu:OpenRouterModel", openRouterModel) }, [openRouterModel, isContextLoading])
  useEffect(() => { if (!isContextLoading) storage.setItem("@Denkitsu:customPrompt", customPrompt) }, [customPrompt, isContextLoading])
  useEffect(() => { if (!isContextLoading) storage.setItem("@Denkitsu:Stream", JSON.stringify(stream)) }, [stream, isContextLoading])
  useEffect(() => { if (!isContextLoading) storage.setItem("@Denkitsu:Groq", groqKey) }, [groqKey, isContextLoading])
  useEffect(() => { if (!isContextLoading) storage.setItem("@Denkitsu:OpenRouter", openRouterKey) }, [openRouterKey, isContextLoading])
  useEffect(() => { if (!isContextLoading) storage.setItem("@Denkitsu:messages", JSON.stringify(messages))}, [messages, isContextLoading])

  const aiKey = aiProvider === "groq" ? groqKey : openRouterKey
  const model = aiProvider === "groq" ? groqModel : openRouterModel
  const toggleListening = useCallback(() => setListening(l => !l), [])

  const {
    recording, fileInputRef, handleStartRecording,
    handleStopRecording, handleUploadClick, handleFileChange
  } = useAudio({ setAudioFile, setUserPrompt, listening })

  const {
    loading, isImproving, onSendMessage, handleRegenerateResponse, improvePrompt
  } = useMessage({
    aiProvider, aiKey, model, stream, activeTools, userPrompt, imageUrls, audioFile, messages,
    freeModels, payModels, groqModels, selectedAgent,
    setUserPrompt, setImageUrls, setAudioFile, setMessages
  })

  const handleToolToggle = useCallback((toolKey, isActive) => {
    const newActiveTools = new Set(activeTools)
    if (isActive) {
      newActiveTools.add(toolKey)
    } else {
      newActiveTools.delete(toolKey)
    }
    setActiveTools(newActiveTools)
    storage.setItem(`@Denkitsu:${toolKey}`, JSON.stringify(isActive))
  }, [activeTools])

  const aiProviderToggle = useCallback(() => setAIProvider((prev) => (prev === "groq" ? "openrouter" : "groq")), [])
  const clearHistory = useCallback(() => setMessages([{ role: "system", content: customPrompt }]), [customPrompt])
  const toggleStream = useCallback(() => setStream(s => !s), [])

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
    audioFile, setAudioFile,
    aiProvider, setAIProvider, aiProviderToggle,
    aiKey,
    setAIKey: aiProvider === "groq" ? setGroqKey : setOpenRouterKey,
    model,
    setModel: aiProvider === "groq" ? setGroqModel : setOpenRouterModel,
    freeModels, setFreeModels,
    payModels, setPayModels,
    groqModels, setGroqModels,
    customPrompt, setCustomPrompt,
    userPrompt, setUserPrompt,
    messages, setMessages, clearHistory,
    selectedAgent, setSelectedAgent,
    loading, isImproving, onSendMessage, handleRegenerateResponse, improvePrompt,
    recording, fileInputRef, handleStartRecording, handleStopRecording, handleUploadClick, handleFileChange,
  }), [
    stream, speaking, listening, activeTools, handleToolToggle, imageUrls, audioFile,
    aiProvider, aiKey, model, groqKey, openRouterKey, groqModel, openRouterModel,
    freeModels, payModels, groqModels, customPrompt, userPrompt, messages,
    toggleStream, speakResponse, toggleListening, aiProviderToggle, clearHistory,
    selectedAgent, loading, isImproving, onSendMessage, handleRegenerateResponse, improvePrompt,
    recording, fileInputRef, handleStartRecording, handleStopRecording, handleUploadClick, handleFileChange,
  ])

  return (
    <AIContext.Provider value={values}>
      {!isContextLoading && children}
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
