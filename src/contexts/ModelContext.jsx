import { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react"

import { useAuth } from "./AuthContext"
import { useNotification } from "./NotificationContext"

import { getModels } from "../services/aiChat"

import { storage } from "../utils/storage"

const ModelContext = createContext({})

const ModelProvider = ({ children }) => {
  const { signed } = useAuth()
  const { notifyError } = useNotification()

  const [aiProvider, setAIProvider] = useState("groq")
  const [groqModel, setGroqModel] = useState("openai/gpt-oss-120b")
  const [openRouterModel, setOpenRouterModel] = useState("deepseek/deepseek-r1-0528:free")
  const [groqKey, setGroqKey] = useState("")
  const [openRouterKey, setOpenRouterKey] = useState("")

  const [freeModels, setFreeModels] = useState([])
  const [payModels, setPayModels] = useState([])
  const [groqModels, setGroqModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      const storedProvider = await storage.local.getItem("@Denkitsu:aiProvider")
      const storedGroqModel = await storage.local.getItem("@Denkitsu:GroqModel")
      const storedOpenRouterModel = await storage.local.getItem("@Denkitsu:OpenRouterModel")
      const storedGroqKey = await storage.local.getItem("@Denkitsu:Groq")
      const storedOpenRouterKey = await storage.local.getItem("@Denkitsu:OpenRouter")
      if (storedProvider) setAIProvider(storedProvider)
      if (storedGroqModel) setGroqModel(storedGroqModel)
      if (storedOpenRouterModel) setOpenRouterModel(storedOpenRouterModel)
      if (storedGroqKey) setGroqKey(storedGroqKey)
      if (storedOpenRouterKey) setOpenRouterKey(storedOpenRouterKey)
    }
    loadSettings()
  }, [])

  const aiKey = useMemo(() => (aiProvider === "groq" ? groqKey : openRouterKey), [aiProvider, groqKey, openRouterKey])
  const model = useMemo(() => (aiProvider === "groq" ? groqModel : openRouterModel), [aiProvider, groqModel, openRouterModel])
  const setModel = useCallback((newModel) => (aiProvider === "groq" ? setGroqModel(newModel) : setOpenRouterModel(newModel)), [aiProvider])
  const setAIKey = useCallback((newKey) => (aiProvider === "groq" ? setGroqKey(newKey) : setOpenRouterKey(newKey)), [aiProvider])
  const aiProviderToggle = useCallback(() => setAIProvider(prev => (prev === "groq" ? "openrouter" : "groq")), [])

  useEffect(() => {
    storage.local.setItem("@Denkitsu:aiProvider", aiProvider)
    storage.local.setItem("@Denkitsu:GroqModel", groqModel)
    storage.local.setItem("@Denkitsu:OpenRouterModel", openRouterModel)
    if (groqKey) storage.local.setItem("@Denkitsu:Groq", groqKey)
    else storage.local.removeItem("@Denkitsu:Groq")
    if (openRouterKey) storage.local.setItem("@Denkitsu:OpenRouter", openRouterKey)
    else storage.local.removeItem("@Denkitsu:OpenRouter")
  }, [aiProvider, groqModel, openRouterModel, groqKey, openRouterKey])

  useEffect(() => {
    if (!signed) {
      setLoadingModels(false)
      return
    }

    const fetchModels = async () => {
      setLoadingModels(true)
      try {
        const { freeModels: loadedFree, payModels: loadedPay, groqModels: loadedGroq } = await getModels()
        setFreeModels(loadedFree?.filter(m => !m.id.includes("whisper")) || [])
        if (aiKey) setPayModels(loadedPay?.filter(m => !m.id.includes("whisper")) || [])
        else setPayModels([])
        setGroqModels(loadedGroq?.filter(m => !m.id.includes("whisper")) || [])
      } catch (error) {
        notifyError(error.message || "Falha ao carregar modelos de IA.")
        setFreeModels([])
        setPayModels([])
        setGroqModels([])
      } finally {
        setLoadingModels(false)
      }
    }
    fetchModels()
  }, [aiKey, signed, notifyError])

  const value = useMemo(() => ({
    aiProvider, aiProviderToggle,
    model, setModel,
    aiKey, setAIKey,
    freeModels, payModels, groqModels,
    loadingModels
  }), [
    aiProvider, aiProviderToggle, model, setModel, aiKey, setAIKey,
    freeModels, payModels, groqModels, loadingModels
  ])

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  )
}

const useModels = () => {
  const context = useContext(ModelContext)
  if (!context) {
    throw new Error("useModels must be used within a ModelProvider")
  }
  return context
}

export { useModels }
export default ModelProvider
