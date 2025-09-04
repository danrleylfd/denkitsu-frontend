import { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react"

import { useAuth } from "./AuthContext"
import { useNotification } from "./NotificationContext"

import { getModels } from "../services/aiChat"

import { storage } from "../utils/storage"

const ModelContext = createContext({})

const ModelProvider = ({ children }) => {
  const { signed, user } = useAuth()
  const { notifyError } = useNotification()

  const [aiProvider, setAIProvider] = useState("groq")
  const [groqModel, setGroqModel] = useState("openai/gpt-oss-120b")
  const [openRouterModel, setOpenRouterModel] = useState("deepseek/deepseek-r1-0528:free")
  const [customModel, setCustomModel] = useState("custom/model")
  const [groqKey, setGroqKey] = useState("")
  const [openRouterKey, setOpenRouterKey] = useState("")
  const [customProviderUrl, setCustomProviderUrl] = useState("")
  const [customProviderKey, setCustomProviderKey] = useState("")

  const [freeModels, setFreeModels] = useState([])
  const [payModels, setPayModels] = useState([])
  const [groqModels, setGroqModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(true)

  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedProvider = await storage.local.getItem("@Denkitsu:aiProvider")
        const storedGroqModel = await storage.local.getItem("@Denkitsu:GroqModel")
        const storedOpenRouterModel = await storage.local.getItem("@Denkitsu:OpenRouterModel")
        const storedCustomModel = await storage.local.getItem("@Denkitsu:CustomModel")
        const storedGroqKey = await storage.local.getItem("@Denkitsu:Groq")
        const storedOpenRouterKey = await storage.local.getItem("@Denkitsu:OpenRouter")
        const storedCustomUrl = await storage.local.getItem("@Denkitsu:CustomProviderUrl")
        const storedCustomKey = await storage.local.getItem("@Denkitsu:CustomProviderKey")
        storedProvider ? setAIProvider(storedProvider) : setAIProvider("groq")
        storedGroqModel ? setGroqModel(storedGroqModel) : setGroqModel("openai/gpt-oss-120b")
        storedOpenRouterModel ? setOpenRouterModel(storedOpenRouterModel) : setOpenRouterModel("deepseek/deepseek-r1-0528:free")
        storedCustomModel ? setCustomModel(storedCustomModel) : setCustomModel("custom/model")
        storedGroqKey ? setGroqKey(storedGroqKey) : setGroqKey("")
        storedOpenRouterKey ? setOpenRouterKey(storedOpenRouterKey) : setOpenRouterKey("")
        storedCustomUrl ? setCustomProviderUrl(storedCustomUrl) : setCustomProviderUrl("")
        storedCustomKey ? setCustomProviderKey(storedCustomKey) : setCustomProviderKey("")
      } catch (error) {
        console.error("Falha ao carregar as configurações:", error)
      } finally {
        setIsInitialized(true)
      }
    }
    loadSettings()
  }, [signed])

  const aiKey = useMemo(() => {
    if (aiProvider === "groq") return groqKey
    if (aiProvider === "openrouter") return openRouterKey
    if (aiProvider === "custom") return customProviderKey
    return ""
  }, [aiProvider, groqKey, openRouterKey, customProviderKey])

  const model = useMemo(() => {
    if (aiProvider === "groq") return groqModel
    if (aiProvider === "openrouter") return openRouterModel
    if (aiProvider === "custom") return customModel
    return ""
  }, [aiProvider, groqModel, openRouterModel, customModel])

  const setModel = useCallback((newModel) => {
    if (aiProvider === "groq") setGroqModel(newModel)
    else if (aiProvider === "openrouter") setOpenRouterModel(newModel)
    else if (aiProvider === "custom") setCustomModel(newModel)
  }, [aiProvider])

  const setAIKey = useCallback((newKey) => {
    if (aiProvider === "groq") setGroqKey(newKey)
    else if (aiProvider === "openrouter") setOpenRouterKey(newKey)
    else if (aiProvider === "custom") setCustomProviderKey(newKey)
  }, [aiProvider])

  const aiProviderToggle = useCallback(() => {
    if (!signed) return
    setAIProvider(prev => {
      if (prev === "groq") return "openrouter"
      if (prev === "openrouter") return (user.plan === "free") ? "groq" : "custom"
      return "groq"
    })
  }, [signed])

  useEffect(() => {
    if (!isInitialized) return
    storage.local.setItem("@Denkitsu:aiProvider", aiProvider)
    storage.local.setItem("@Denkitsu:GroqModel", groqModel)
    storage.local.setItem("@Denkitsu:OpenRouterModel", openRouterModel)
    storage.local.setItem("@Denkitsu:CustomModel", customModel)
    if (groqKey) storage.local.setItem("@Denkitsu:Groq", groqKey); else storage.local.removeItem("@Denkitsu:Groq")
    if (openRouterKey) storage.local.setItem("@Denkitsu:OpenRouter", openRouterKey); else storage.local.removeItem("@Denkitsu:OpenRouter")
    if (customProviderUrl) storage.local.setItem("@Denkitsu:CustomProviderUrl", customProviderUrl); else storage.local.removeItem("@Denkitsu:CustomProviderUrl")
    if (customProviderKey) storage.local.setItem("@Denkitsu:CustomProviderKey", customProviderKey); else storage.local.removeItem("@Denkitsu:CustomProviderKey")
  }, [aiProvider, groqModel, openRouterModel, customModel, groqKey, openRouterKey, customProviderUrl, customProviderKey, isInitialized])

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
  }, [signed, aiKey])

  const value = useMemo(() => ({
    aiProvider, aiProviderToggle,
    model, setModel,
    aiKey, setAIKey,
    customProviderUrl, setCustomProviderUrl,
    freeModels, payModels, groqModels,
    loadingModels
  }), [
    aiProvider, aiProviderToggle, model, setModel, aiKey, setAIKey,
    customProviderUrl, setCustomProviderUrl,
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
  if (!context) throw new Error("useModels must be used within a ModelProvider")
  return context
}

export { useModels }
export default ModelProvider
