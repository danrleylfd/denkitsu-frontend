import { useState } from "react"
import { X, Brain, Eye, EyeClosed } from "lucide-react"

import { useAI } from "../../contexts/AIContext"

import AIModelSelect from "./ModelSelect"
import Input from "../Input"
import Button from "../Button"

const AISettings = ({ settingsOpen, toggleSettings, freeModels, payModels, groqModels, selectedPrompt, onSelectPrompt }) => {
  const [showAIKey, setShowAIKey] = useState(false)
  const { aiKey, model, aiProvider, prompts, customPrompt, loading, setAIKey, setModel, setAIProvider, aiProviderToggle, setCustomPrompt } = useAI()
  if (!settingsOpen) return null
  const getModeName = (content) => {
    if (!content) return "Padrão"
    const firstLine = content.trim().split("\n")[0]
    return firstLine.replace("## Modo ", "").trim()
  }

  const gradientColors = ["gradient-green", "gradient-yellow", "gradient-blue", "gradient-red", "gradient-pink", "gradient-orange", "gradient-purple"]

  const modeColorMap = new Map()
  prompts.slice(1).forEach((prompt, index) => {
    const name = getModeName(prompt.content)
    modeColorMap.set(name, gradientColors[index % gradientColors.length])
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="relative flex w-full max-w-md flex-col gap-2 rounded-lg bg-lightBg-primary p-4 shadow-2xl dark:bg-darkBg-primary"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lightFg-primary dark:text-darkFg-primary">Configurações do Denkitsu</h3>
          <Button variant="danger" size="icon" $rounded onClick={toggleSettings}>
            <X size={16} />
          </Button>
        </div>
        <label htmlFor="api-key" className="text-lightFg-secondary dark:text-darkFg-secondary">
          Chave da API ({aiProvider})
        </label>
        <div className="flex gap-2">
          <Button
            variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"}
            size="icon"
            $rounded
            onClick={aiProviderToggle}
            title={aiProvider === "groq" ? "Groq" : "OpenRouter"}>
            <Brain size={16} />
          </Button>
          <Input
            id="api-key"
            type={showAIKey ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Sua chave de API"
            value={aiKey}
            onChange={(e) => setAIKey(e.target.value)}>
            <Button type="button" variant="outline" size="icon" $rounded onClick={() => setShowAIKey(!showAIKey)} disabled={loading}>
              {showAIKey ? <Eye size={16} /> : <EyeClosed size={16} />}
            </Button>
          </Input>
        </div>
        <small className="text-xs text-lightFg-tertiary dark:text-darkFg-tertiary">
          Sua chave é salva localmente no seu navegador e nunca será salva em nossos servidores.
        </small>
        <label htmlFor="model-select" className="text-lightFg-secondary dark:text-darkFg-secondary">
          Modelo
        </label>
        <div className="flex items-end gap-2">
          <Button
            variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"}
            size="icon"
            $rounded
            onClick={aiProviderToggle}
            title={aiProvider === "groq" ? "Groq" : "OpenRouter"}>
            <Brain size={16} />
          </Button>
          <AIModelSelect
            aiProvider={aiProvider}
            setAIProvider={setAIProvider}
            model={model}
            setModel={setModel}
            loading={loading}
            freeModels={freeModels}
            payModels={payModels}
            groqModels={groqModels}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-lightFg-secondary dark:text-darkFg-secondary">Agentes de AI</label>
          <div className="flex flex-wrap gap-2">
            <Button variant={!selectedPrompt ? "primary" : "secondary"} size="xs" $rounded onClick={() => onSelectPrompt("")} disabled={loading}>
              Padrão
            </Button>
            {prompts.slice(1).map((prompt) => {
              const modeName = getModeName(prompt.content)
              const selectedColor = modeColorMap.get(modeName) || "gradient-blue"
              return (
                <Button
                  key={modeName}
                  variant={selectedPrompt === prompt.content ? selectedColor : "secondary"}
                  size="xs"
                  $rounded
                  onClick={() => onSelectPrompt(prompt.content)}
                  disabled={loading}>
                  {modeName}
                </Button>
              )
            })}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="custom-prompt" className="text-lightFg-secondary dark:text-darkFg-secondary">
            Como Denkitsu deve se comportar?
          </label>
          <textarea
            id="custom-prompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            maxLength="7000"
            rows={10}
            className="resize-none w-full p-2 rounded-md bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary text-xs focus:outline-none focus:ring-2 focus:ring-primary-base"
            placeholder="Digite seu prompt de sistema aqui..."
          />
          <small className="text-right text-xs text-lightFg-tertiary dark:text-darkFg-tertiary self-end">{customPrompt.length} / 7000 caracteres.</small>
        </div>
      </div>
    </div>
  )
}

export default AISettings
