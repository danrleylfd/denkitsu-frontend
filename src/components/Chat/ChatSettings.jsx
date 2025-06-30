import { LuX, LuBrain } from "react-icons/lu"
import { MdClearAll } from "react-icons/md"
import { useAI } from "../../contexts/AIContext"
import Button from "../Button"
import Input from "../Input"
import ModelSelect from "./ModelSelect"

const AISettings = ({ isOpen, onClose, freeModels, payModels, groqModels, clearHistory, prompts, selectedPrompt, onSelectPrompt }) => {
  const { aiKey, setAIKey, model, setModel, aiProvider, setAIProvider, aiProviderToggle, loading, customPrompt, setCustomPrompt } = useAI()
  if (!isOpen) return null
  const getModeName = (content) => {
    if (!content) return "Padrão"
    const firstLine = content.trim().split("\n")[0]
    return firstLine.replace("## Modo ", "").trim()
  }

  const gradientColors = [
    "gradient-green",
    "gradient-yellow",
    "gradient-blue",
    "gradient-red",
    "gradient-pink",
    "gradient-orange",
    "gradient-purple"
  ]

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
          <h3 className="font-bold text-lightFg-primary dark:text-darkFg-primary">
            Configurações do Denkitsu
          </h3>
          <Button variant="danger" size="icon" $rounded onClick={onClose}>
            <LuX size={16} />
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-lightFg-secondary dark:text-darkFg-secondary">Modo de Operação</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!selectedPrompt ? "primary" : "secondary"}
              size="xs"
              $rounded
              onClick={() => onSelectPrompt("")}
              disabled={loading}
            >
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
                  disabled={loading}
                >
                  {modeName}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="custom-prompt" className="text-lightFg-secondary dark:text-darkFg-secondary">
            Como Denkitsu deve se comportar? (Modo personalizado pelo usuário)
          </label>
          <textarea
            id="custom-prompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            maxLength="7000"
            rows={10}
            className="w-full p-2 rounded-md bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary text-xs resize-y focus:outline-none focus:ring-2 focus:ring-primary-base"
            placeholder="Digite seu prompt de sistema aqui..." />

          <small className="text-right text-xs text-lightFg-tertiary dark:text-darkFg-tertiary self-end">
            {customPrompt.length} / 7000 caracteres.
          </small>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="api-key" className="text-lightFg-secondary dark:text-darkFg-secondary">
            Chave da API ({aiProvider})
          </label>
          <Input id="api-key" type="password" placeholder="Sua chave de API" value={aiKey} onChange={(e) => setAIKey(e.target.value)} />
          <small className="text-xs text-lightFg-tertiary dark:text-darkFg-tertiary">
            Sua chave é salva localmente no seu navegador e nunca é enviada para nossos servidores.
          </small>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-2 w-full">
            <ModelSelect
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
          <Button
            variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"}
            size="icon"
            $rounded
            onClick={aiProviderToggle}
            title={aiProvider === "groq" ? "Groq" : "OpenRouter"}>
            <LuBrain size={16} />
          </Button>
          <Button variant="danger" size="icon" $rounded title="Apagar Conversa" onClick={clearHistory} disabled={loading}>
            <MdClearAll size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AISettings
