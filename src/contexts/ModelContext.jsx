import { createContext, useState, useEffect, useContext } from "react"
import { useAuth } from "./AuthContext"
import { useNotification } from "./NotificationContext"
import { getModels } from "../services/aiChat"
import { storage } from "../utils/storage"

const ModelContext = createContext(null)

const ModelProvider = ({ children }) => {
  const { signed } = useAuth()
  const { notifyError } = useNotification()
  const [providers, setProviders] = useState([
    { id: "groq", name: "Groq", defaultModel: "openai/gpt-oss-120b" },
    { id: "openrouter", name: "OpenRouter", defaultModel: "deepseek/deepseek-r1-0528:free" },
    { id: "custom", name: "Personalizado", defaultModel: "" }
  ])
  const [selectedProvider, setSelectedProvider] = useState(storage.get("aiProvider") || "groq")
  const [customProviderConfig, setCustomProviderConfig] = useState(() => {
    const saved = storage.get("customProviderConfig")
    return saved || { apiUrl: "", apiKey: "" }
  })
  const [models, setModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(false)

  const fetchModels = async () => {
    if (!signed) return
    setLoadingModels(true)
    try {
      let config = null
      if (selectedProvider === "custom") {
        if (!customProviderConfig.apiUrl || !customProviderConfig.apiKey) {
          notifyError("Configure a URL e a chave da API para o provedor personalizado.")
          setLoadingModels(false)
          return
        }
        config = customProviderConfig
      }
      const modelsData = await getModels(selectedProvider, null, config)
      setModels(modelsData)
    } catch (error) {
      notifyError(error.message || "Erro ao carregar modelos. Verifique suas configurações.")
      console.error("Erro ao carregar modelos:", error)
    } finally {
      setLoadingModels(false)
    }
  }

  const saveCustomProviderConfig = (apiUrl, apiKey) => {
    const newConfig = { apiUrl, apiKey }
    setCustomProviderConfig(newConfig)
    storage.set("customProviderConfig", newConfig)
  }

  const selectProvider = (providerId) => {
    setSelectedProvider(providerId)
    storage.set("aiProvider", providerId)
    if (providerId !== "custom") {
      const provider = providers.find(p => p.id === providerId)
      if (provider && provider.defaultModel) storage.set("aiModel", provider.defaultModel)
    }
  }

  useEffect(() => {
    if (signed && selectedProvider) fetchModels()
  }, [signed, selectedProvider, customProviderConfig])

  const value = {
    providers,
    selectedProvider,
    selectProvider,
    models,
    loadingModels,
    fetchModels,
    customProviderConfig,
    saveCustomProviderConfig
  }

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  )
}

const useModels = () => {
  const context = useContext(ModelContext)
  if (!context) throw new Error("useModels deve ser usado dentro de um <ModelProvider>")
  return context
}

export { useModels }
export default ModelProvider
