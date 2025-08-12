import { useState } from "react"
import { X, Brain, Eye, EyeOff } from "lucide-react"
import { useAI } from "../../contexts/AIContext"
import AIModelSelect from "./ModelSelect"
import Input from "../Input"
import Button from "../Button"
import AIPromptManager from "./PromptManager"

const getModeName = (content) => {
  if (!content || typeof content !== 'string') return "Prompt"
  const trimmedContent = content.trim()
  if (trimmedContent.startsWith("Modo ")) {
    const firstLine = trimmedContent.split('\n')[0]
    return firstLine.substring(5).trim()
  }
  return "Prompt"
}

const AISettings = ({ settingsDoor, toggleSettingsDoor }) => {
  const [showAIKey, setShowAIKey] = useState(false)
  const [showPromptManager, setShowPromptManager] = useState(false)
  const {
    aiKey, aiProvider, loading, setAIKey, aiProviderToggle,
    userPrompts, setUserPrompts, systemPrompts, selectedPrompt, setSelectedPrompt
  } = useAI()
  console.log(systemPrompts.length)

  if (!settingsDoor) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="relative flex w-full max-w-md flex-col gap-4 rounded-lg bg-lightBg-primary p-4 shadow-2xl dark:bg-darkBg-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lightFg-primary dark:text-darkFg-primary">Configurações do Denkitsu</h3>
          <Button variant="danger" size="icon" $rounded onClick={toggleSettingsDoor}><X size={16} /></Button>
        </div>

        <label htmlFor="api-key" className="text-lightFg-secondary dark:text-darkFg-secondary">Chave da API ({aiProvider})</label>
        <div className="flex gap-2 -mt-2">
          <Button variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Groq" : "OpenRouter"}><Brain size={16} /></Button>
          <Input id="api-key" type={showAIKey ? "text" : "password"} autoComplete="new-password" placeholder="Sua chave de API" value={aiKey} onChange={(e) => setAIKey(e.target.value)}>
            <Button type="button" variant="outline" size="icon" $rounded onClick={() => setShowAIKey(!showAIKey)} disabled={loading}>
              {showAIKey ? <Eye size={16} /> : <EyeOff size={16} />}
            </Button>
          </Input>
        </div>
        <small className="text-xs -mt-2 text-lightFg-tertiary dark:text-darkFg-tertiary">Sua chave é salva localmente no seu navegador e nunca será salva em nossos servidores.</small>

        <label htmlFor="model-select" className="text-lightFg-secondary dark:text-darkFg-secondary">Modelo</label>
        <div className="flex items-end gap-2 -mt-2">
          <Button variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Groq" : "OpenRouter"}><Brain size={16} /></Button>
          <AIModelSelect loading={loading} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label htmlFor="prompt-select" className="text-lightFg-secondary dark:text-darkFg-secondary">Agente de IA (Prompt de Sistema)</label>
            <Button variant="outline" $rounded size="sm" onClick={() => setShowPromptManager(true)}>Gerenciar</Button>
          </div>
          <select
            id="prompt-select"
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
            disabled={loading}
            className="bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary text-sm py-2 w-full rounded-full"
          >
            <option value="Padrão">Padrão (Recomendado)</option>

            <optgroup label="Prompts Predefinidos">
              {(systemPrompts || [])
                .filter(p => p && p.role === 'system' && getModeName(p.content) !== 'Padrão')
                .map((p, index) => (
                  <option key={`system-${index}`} value={p.content}>
                    {getModeName(p.content)}
                  </option>
                ))}
            </optgroup>

            <optgroup label="Meus Prompts Salvos">
              {(userPrompts || [])
                .filter(p => p && p._id)
                .map(p => (
                  <option key={p._id} value={p.content}>{p.title}</option>
                ))}
            </optgroup>
          </select>
        </div>
      </div>

      {showPromptManager && (
        <AIPromptManager
          prompts={userPrompts}
          setPrompts={setUserPrompts}
          onClose={() => setShowPromptManager(false)}
        />
      )}
    </div>
  )
}

export default AISettings
