import { useState } from "react"
import {
  X, Brain, Eye, EyeOff, BarChart2, Rss, Code, Presentation, Shield, GraduationCap, Lightbulb, FileText, ClipboardList, Bot
} from "lucide-react"

import { useAI } from "../../contexts/AIContext"

import AIModelSelect from "./ModelSelect"
import Input from "../Input"
import AIInput from "./Input"
import Button from "../Button"
import MultiToggle from "../MultiToggle"

const AISettings = ({ settingsOpen, toggleSettings, selectedPrompt, onSelectPrompt }) => {
  const [showAIKey, setShowAIKey] = useState(false)
  const { aiKey, model, aiProvider, customPrompt, loading, setAIKey, setModel, setAIProvider, aiProviderToggle, setCustomPrompt } = useAI()

  if (!settingsOpen) return null

  const agentOptions = [
    { value: "Padrão", icon: <Bot size={16} /> },
    { value: "Analista", icon: <BarChart2 size={16} /> },
    { value: "Blogueiro", icon: <Rss size={16} /> },
    { value: "Desenvolvedor", icon: <Code size={16} /> },
    { value: "Lousa", icon: <Presentation size={16} /> },
    { value: "Moderador", icon: <Shield size={16} /> },
    { value: "Professor", icon: <GraduationCap size={16} /> },
    { value: "Prompter", icon: <Lightbulb size={16} /> },
    { value: "Redator", icon: <FileText size={16} /> },
    { value: "Secretário", icon: <ClipboardList size={16} /> },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="relative flex w-full max-w-md flex-col gap-4 rounded-lg bg-lightBg-primary p-4 shadow-2xl dark:bg-darkBg-primary"
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
        <div className="flex gap-2 -mt-2">
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
              {showAIKey ? <Eye size={16} /> : <EyeOff size={16} />}
            </Button>
          </Input>
        </div>
        <small className="text-xs -mt-2 text-lightFg-tertiary dark:text-darkFg-tertiary">
          Sua chave é salva localmente no seu navegador e nunca será salva em nossos servidores.
        </small>
        <label htmlFor="model-select" className="text-lightFg-secondary dark:text-darkFg-secondary">
          Modelo
        </label>
        <div className="flex items-end gap-2 -mt-2">
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
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-lightFg-secondary dark:text-darkFg-secondary">Agentes de AI</label>
          <div className="w-full overflow-x-auto pb-2 flex justify-center">
            <MultiToggle
              options={agentOptions}
              value={selectedPrompt}
              onChange={onSelectPrompt}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="custom-prompt" className="text-lightFg-secondary dark:text-darkFg-secondary">
            Como Denkitsu deve se comportar?
          </label>
          <AIInput
            id="custom-prompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={7}
            maxLength={6144}
            placeholder="Escreva seu prompt de sistema"
            disabled={loading}
          />
          <small className="text-right text-xs text-lightFg-tertiary dark:text-darkFg-tertiary self-end">{customPrompt.length} / 6144 caracteres.</small>
        </div>
      </div>
    </div>
  )
}

export default AISettings
