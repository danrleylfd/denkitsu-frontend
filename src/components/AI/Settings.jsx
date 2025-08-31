import { useState, useEffect } from "react"

import { useModels } from "../../contexts/ModelContext"

import Button from "../Button"
import Input from "../Input"
import Paper from "../Paper"
import { Eye, EyeClosed } from "lucide-react"

const AISettings = ({ settingsDoor, toggleSettingsDoor }) => {
  if (!settingsDoor) return null
  const {
    providers,
    selectedProvider,
    selectProvider,
    models,
    loadingModels,
    customProviderConfig,
    saveCustomProviderConfig
  } = useModels()

  const [tempCustomApiUrl, setTempCustomApiUrl] = useState(customProviderConfig.apiUrl)
  const [tempCustomApiKey, setTempCustomApiKey] = useState(customProviderConfig.apiKey)
  const [showAIKey, setShowAIKey] = useState(false)

  useEffect(() => {
    setTempCustomApiUrl(customProviderConfig.apiUrl)
    setTempCustomApiKey(customProviderConfig.apiKey)
  }, [customProviderConfig])

  const handleSaveCustomProvider = () => {
    saveCustomProviderConfig(tempCustomApiUrl, tempCustomApiKey)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Paper className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-6">Configurações de IA</h2>
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-lightFg-primary dark:text-darkFg-primary">Provedor de IA</h3>
          <div className="flex flex-wrap gap-2">
            {providers.map((provider) => (
              <Button
                key={provider.id}
                variant={selectedProvider === provider.id ? "primary" : "outline"}
                size="sm"
                onClick={() => selectProvider(provider.id)}
              >
                {provider.name}
              </Button>
            ))}
          </div>
        </div>
        {selectedProvider === "custom" && (
          <div className="mb-6 p-4 border border-lightFg-tertiary dark:border-darkFg-tertiary rounded-lg bg-lightBg-secondary dark:bg-darkBg-secondary">
            <h3 className="font-semibold mb-3 text-lightFg-primary dark:text-darkFg-primary">Configuração de Provedor Personalizado</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="custom-api-url" className="block text-sm font-medium mb-1 text-lightFg-secondary dark:text-darkFg-secondary">
                  URL da API
                </label>
                <Input
                  id="custom-api-url"
                  type="url"
                  placeholder="https://api.exemplo.com/v1"
                  value={tempCustomApiUrl}
                  onChange={(e) => setTempCustomApiUrl(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="custom-api-key" className="block text-sm font-medium mb-1 text-lightFg-secondary dark:text-darkFg-secondary">
                  Chave da API
                </label>
                <div className="relative">
                  <Input
                    id="custom-api-key"
                    type={showAIKey ? "text" : "password"}
                    placeholder="sk-..."
                    value={tempCustomApiKey}
                    onChange={(e) => setTempCustomApiKey(e.target.value)}
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowAIKey(!showAIKey)}
                    title={showAIKey ? "Ocultar chave" : "Mostrar chave"}
                  >
                    {showAIKey ? <Eye size={16} /> : <EyeClosed size={16} />}
                  </Button>
                </div>
                <small className="text-xs text-lightFg-tertiary dark:text-darkFg-tertiary block mt-1">
                  Sua chave é salva localmente no seu navegador e nunca será salva em nossos servidores.
                </small>
              </div>
              <Button
                onClick={handleSaveCustomProvider}
                disabled={!tempCustomApiUrl || !tempCustomApiKey}
              >
                Salvar Configuração
              </Button>
            </div>
          </div>
        )}
        <div className="mb-6">
          <label htmlFor="model-select" className="block font-semibold mb-2 text-lightFg-primary dark:text-darkFg-primary">
            Modelo
          </label>
          <div className="relative">
            <select
              id="model-select"
              className="w-full p-2 border border-lightFg-tertiary dark:border-darkFg-tertiary rounded bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary"
              disabled={loadingModels}
            >
              <option disabled value="">Selecionar Modelo</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                  {model.supports_tools && " 🛠️"}
                  {model.supports_images && " 🖼️"}
                </option>
              ))}
            </select>
            {loadingModels && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                Carregando...
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={toggleSettingsDoor}>
            Fechar
          </Button>
        </div>
      </Paper>
    </div>
  )
}

export default AISettings
