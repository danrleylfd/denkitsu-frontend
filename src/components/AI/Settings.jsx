import { useState } from "react"
import { X, Waypoints, Eye, EyeClosed, Server } from "lucide-react"

import { useAI } from "../../contexts/AIContext"
import { useModels } from "../../contexts/ModelContext"

import AIModelSelect from "./ModelSelect"
import Paper from "../Paper"
import Input from "../Input"
import TextArea from "../TextArea"
import Button from "../Button"

const AISettings = ({ settingsDoor, toggleSettingsDoor }) => {
  const [showAIKey, setShowAIKey] = useState(false)
  const { customPrompt, setCustomPrompt } = useAI()
  const {
    aiProvider,
    aiKey,
    setAIKey,
    aiProviderToggle,
    loadingModels,
    customProviderUrl,
    setCustomProviderUrl,
    model,
    setModel
  } = useModels()

  if (!settingsDoor) return null

  const getProviderTitle = () => {
    if (aiProvider === "groq") return "Provedor: Groq"
    if (aiProvider === "openrouter") return "Provedor: OpenRouter"
    return "Provedor: Personalizado"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Paper
        className="relative w-full max-w-[95%] h-full max-h-[95%] flex flex-col px-0 py-2 gap-2 rounded-lg bg-lightBg-primary p-2 shadow-2xl dark:bg-darkBg-primary border border-solid border-brand-purple"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lightFg-primary dark:text-darkFg-primary">Configurações</h3>
          <Button variant="danger" size="icon" $rounded onClick={toggleSettingsDoor}>
            <X size={16} />
          </Button>
        </div>
        <div className="flex flex-1 flex-col gap-2 px-2 overflow-y-auto">
          <label htmlFor="api-key" className="text-lightFg-secondary dark:text-darkFg-secondary">
            Chave da API & Modelo ({aiProvider})
          </label>
          <div className="flex items-end gap-2">
            <Button
              variant={aiProvider === "groq" ? "orange" : aiProvider === "openrouter" ? "info" : "success"}
              size="icon"
              $rounded
              onClick={aiProviderToggle}
              title={getProviderTitle()}>
              {aiProvider === "custom" ? <Server size={16} /> : <Waypoints size={16} />}
            </Button>
            {aiProvider === "custom" ? (
              <Input
                className="max-w-64"
                id="custom-model"
                type="text"
                placeholder="ID do Modelo Personalizado"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            ) : (
              <AIModelSelect className="max-w-64" loadingModels={loadingModels} />
            )}
            <Input
              id="api-key"
              type={showAIKey ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Sua chave de API"
              value={aiKey}
              onChange={(e) => setAIKey(e.target.value)}>
              <Button type="button" variant="outline" size="icon" $rounded onClick={() => setShowAIKey(!showAIKey)} disabled={loadingModels}>
                {showAIKey ? <Eye size={16} /> : <EyeClosed size={16} />}
              </Button>
            </Input>
          </div>
          <small className="text-xs text-lightFg-tertiary dark:text-darkFg-tertiary">
            Sua chave é salva apenas localmente no seu navegador.
          </small>
          {aiProvider === "custom" && (
            <>
              <label htmlFor="custom-api-url" className="text-lightFg-secondary dark:text-darkFg-secondary">
                URL da API (Personalizado)
              </label>
              <Input
                id="custom-api-url"
                type="text"
                autoComplete="off"
                placeholder="https://seu-proxy.com/v1"
                value={customProviderUrl}
                onChange={(e) => setCustomProviderUrl(e.target.value)}
              />
            </>
          )}
          <div className="flex flex-col gap-2 flex-1 min-h-14">
            <label htmlFor="custom-prompt" className="text-lightFg-secondary dark:text-darkFg-secondary">
              Como Denkitsu deve se comportar?
            </label>
            <TextArea
              id="custom-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              maxLength={6144}
              placeholder="Escreva seu prompt de sistema"
              disabled={loadingModels}
              className="flex-1"
              textAreaClassName="h-full"
            />
          </div>
        </div>
      </Paper>
    </div>
  )
}

export default AISettings
