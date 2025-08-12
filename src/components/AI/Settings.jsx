import { useState } from "react"
import { X, Brain, Eye, EyeOff } from "lucide-react"

import { useAI } from "../../contexts/AIContext"

// Componentes que serão utilizados
import AIModelSelect from "./ModelSelect"
import Input from "../Input"
import Button from "../Button"
// Novo componente que criamos para gerenciar os prompts
import AIPromptManager from "./PromptManager"

const AISettings = ({ settingsDoor, toggleSettingsDoor }) => {
  const [showAIKey, setShowAIKey] = useState(false)
  // Novo estado para controlar a visibilidade do modal de gerenciamento
  const [showPromptManager, setShowPromptManager] = useState(false)

  // Desestruturando os valores do nosso AIContext
  // Note que agora pegamos 'userPrompts', 'setUserPrompts', 'selectedPrompt' e 'setSelectedPrompt'
  const {
    aiKey,
    aiProvider,
    loading,
    setAIKey,
    aiProviderToggle,
    userPrompts,
    setUserPrompts,
    selectedPrompt,
    setSelectedPrompt
  } = useAI()

  if (!settingsDoor) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="relative flex w-full max-w-md flex-col gap-4 rounded-lg bg-lightBg-primary p-4 shadow-2xl dark:bg-darkBg-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lightFg-primary dark:text-darkFg-primary">Configurações do Denkitsu</h3>
          <Button variant="danger" size="icon" $rounded onClick={toggleSettingsDoor}>
            <X size={16} />
          </Button>
        </div>

        {/* Seção da Chave de API (sem alterações) */}
        <label htmlFor="api-key" className="text-lightFg-secondary dark:text-darkFg-secondary">
          Chave da API ({aiProvider})
        </label>
        <div className="flex gap-2 -mt-2">
          <Button
            variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"}
            size="icon"
            $rounded
            onClick={aiProviderToggle}
            title={aiProvider === "groq" ? "Groq" : "OpenRouter"}
          >
            <Brain size={16} />
          </Button>
          <Input
            id="api-key"
            type={showAIKey ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Sua chave de API"
            value={aiKey}
            onChange={(e) => setAIKey(e.target.value)}
          >
            <Button type="button" variant="outline" size="icon" $rounded onClick={() => setShowAIKey(!showAIKey)} disabled={loading}>
              {showAIKey ? <Eye size={16} /> : <EyeOff size={16} />}
            </Button>
          </Input>
        </div>
        <small className="text-xs -mt-2 text-lightFg-tertiary dark:text-darkFg-tertiary">
          Sua chave é salva localmente no seu navegador e nunca será salva em nossos servidores.
        </small>

        {/* Seção de Seleção de Modelo (sem alterações) */}
        <label htmlFor="model-select" className="text-lightFg-secondary dark:text-darkFg-secondary">
          Modelo
        </label>
        <div className="flex items-end gap-2 -mt-2">
          <Button
            variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"}
            size="icon"
            $rounded
            onClick={aiProviderToggle}
            title={aiProvider === "groq" ? "Groq" : "OpenRouter"}
          >
            <Brain size={16} />
          </Button>
          <AIModelSelect loading={loading} />
        </div>

        {/* Seção de Agentes de IA (MODIFICADA) */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label htmlFor="prompt-select" className="text-lightFg-secondary dark:text-darkFg-secondary">
              Agente de IA (Prompt de Sistema)
            </label>
            <Button variant="outline" $rounded size="sm" onClick={() => setShowPromptManager(true)}>
              Gerenciar
            </Button>
          </div>
          <select
            id="prompt-select"
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
            disabled={loading}
            className="bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary text-sm py-2 w-full rounded-full"
          >
            <option value="Padrão">Padrão (Recomendado)</option>
            {/* Adiciona um grupo para os prompts do usuário */}
            <optgroup label="Seus Prompts Salvos">
              {(userPrompts || []).map(p => (
                <option key={p._id} value={p.content}>{p.title}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* O campo de texto para o prompt customizado foi removido, pois agora é gerenciado pelo PromptManager */}

      </div>

      {/* Renderização condicional do nosso novo modal de gerenciamento */}
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
