import { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react"
import { useAuth } from "./AuthContext"
import { useNotification } from "./NotificationContext"
import { getModels } from "../services/aiChat"

const ModelContext = createContext({})

const ModelProvider = ({ children }) => {
  const { signed } = useAuth()
  const { notifyError } = useNotification()

  const storedAIProvider = localStorage.getItem("@Denkitsu:aiProvider") || "groq"
  const storedGroqModel = localStorage.getItem("@Denkitsu:GroqModel") || "openai/gpt-oss-120b"
  const storedOpenRouterModel = localStorage.getItem("@Denkitsu:OpenRouterModel") || "deepseek/deepseek-r1-0528:free"
  const storedGroqKey = localStorage.getItem("@Denkitsu:Groq") || ""
  const storedOpenRouterKey = localStorage.getItem("@Denkitsu:OpenRouter") || ""

  const [aiProvider, setAIProvider] = useState(storedAIProvider)
  const [groqModel, setGroqModel] = useState(storedGroqModel)
  const [openRouterModel, setOpenRouterModel] = useState(storedOpenRouterModel)
  const [groqKey, setGroqKey] = useState(storedGroqKey)
  const [openRouterKey, setOpenRouterKey] = useState(storedOpenRouterKey)

  const [freeModels, setFreeModels] = useState([])
  const [payModels, setPayModels] = useState([])
  const [groqModels, setGroqModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(true)

  const aiKey = useMemo(() => (aiProvider === "groq" ? groqKey : openRouterKey), [aiProvider, groqKey, openRouterKey])
  const model = useMemo(() => (aiProvider === "groq" ? groqModel : openRouterModel), [aiProvider, groqModel, openRouterModel])
  const setModel = useCallback((newModel) => (aiProvider === "groq" ? setGroqModel(newModel) : setOpenRouterModel(newModel)), [aiProvider])
  const setAIKey = useCallback((newKey) => (aiProvider === "groq" ? setGroqKey(newKey) : setOpenRouterKey(newKey)), [aiProvider])

  const aiProviderToggle = useCallback(() => setAIProvider(prev => (prev === "groq" ? "openrouter" : "groq")), [])

  useEffect(() => {
    localStorage.setItem("@Denkitsu:aiProvider", aiProvider)
    localStorage.setItem("@Denkitsu:GroqModel", groqModel)
    localStorage.setItem("@Denkitsu:OpenRouterModel", openRouterModel)
    if (groqKey) localStorage.setItem("@Denkitsu:Groq", groqKey)
    else localStorage.removeItem("@Denkitsu:Groq")
    if (openRouterKey) localStorage.setItem("@Denkitsu:OpenRouter", openRouterKey)
    else localStorage.removeItem("@Denkitsu:OpenRouter")
  }, [aiProvider, groqModel, openRouterModel, groqKey, openRouterKey])

  useEffect(() => {
    if (!signed) return
    setLoadingModels(true)
    ;(async () => {
      try {
        const { freeModels: loadedFree, payModels: loadedPay, groqModels: loadedGroq } = await getModels()
        setFreeModels(loadedFree?.filter(m => !m.id.includes("whisper")) || [])
        if (aiKey) setPayModels(loadedPay?.filter(m => !m.id.includes("whisper")) || [])
        else setPayModels([])
        setGroqModels(loadedGroq?.filter(m => !m.id.includes("whisper")) || [])
      } catch (error) {
        notifyError(error.message || "Falha ao carregar modelos de IA.")
      } finally {
        setLoadingModels(false)
      }
    })()
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
