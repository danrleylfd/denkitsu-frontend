import { LuX, LuBrain } from "react-icons/lu"
import { MdClearAll } from "react-icons/md"
import { useAI } from "../contexts/AIContext"
import Button from "./Button"
import Input from "./Input"
import ModelSelect from "./ModelSelect"

const AISettings = ({ isOpen, onClose, freeModels, payModels, groqModels, clearHistory }) => {
  const { aiKey, setAIKey, model, setModel, aiProvider, setAIProvider, aiProviderToggle, loading, customPrompt, setCustomPrompt } = useAI()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" data-oid="hc8qu.n">
      <div
        className="relative flex w-full max-w-md flex-col gap-2 rounded-lg bg-lightBg-primary dark:bg-darkBg-primary p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-oid="-1iwsy:">
        <div className="flex items-center justify-between" data-oid="ql:ia9a">
          <h3 className="font-bold text-lightFg-primary dark:text-darkFg-primary" data-oid="54a6bp3">
            Configurações do Denkitsu
          </h3>
          <Button variant="danger" size="icon" $rounded onClick={onClose} data-oid="mt_5vwf">
            <LuX size={16} data-oid="fvo9d1-" />
          </Button>
        </div>

        <div className="flex flex-col gap-2" data-oid="8vyqwus">
          <label htmlFor="custom-prompt" className="text-lightFg-secondary dark:text-darkFg-secondary" data-oid="ih:pcsz">
            Como Denkitsu deve se comportar?
          </label>
          <textarea
            id="custom-prompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            maxLength="7000"
            rows={15}
            className="w-full p-2 rounded-md bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary text-xs resize-y focus:outline-none focus:ring-2 focus:ring-primary-base"
            placeholder="Digite seu prompt de sistema aqui..."
            data-oid="ql.0lbb"
          />

          <small className="text-right text-xs text-lightFg-tertiary dark:text-darkFg-tertiary self-end" data-oid="-lc3u.6">
            {customPrompt.length} / 7000 caracteres.
          </small>
        </div>

        <div className="flex flex-col gap-2" data-oid=":e-g_h3">
          <label htmlFor="api-key" className="text-lightFg-secondary dark:text-darkFg-secondary" data-oid="0eq:w7s">
            Chave da API ({aiProvider})
          </label>
          <Input id="api-key" type="password" placeholder="Sua chave de API" value={aiKey} onChange={(e) => setAIKey(e.target.value)} data-oid="yhxmm0u" />
          <small className="text-xs text-lightFg-tertiary dark:text-darkFg-tertiary" data-oid="yfv-hj1">
            Sua chave é salva localmente no seu navegador e nunca é enviada para nossos servidores.
          </small>
        </div>

        <div className="flex items-end gap-2" data-oid="t:_ynjj">
          <div className="flex flex-col gap-2 w-full" data-oid="k4x-d.k">
            <label htmlFor="model-select" className="text-lightFg-secondary dark:text-darkFg-secondary" data-oid="h7e-9is">
              Modelo
            </label>
            <ModelSelect
              aiProvider={aiProvider}
              setAIProvider={setAIProvider}
              model={model}
              setModel={setModel}
              loading={loading}
              freeModels={freeModels}
              payModels={payModels}
              groqModels={groqModels}
              data-oid="dhnn.52"
            />
          </div>
          <Button
            variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"}
            size="icon"
            $rounded
            onClick={aiProviderToggle}
            title={aiProvider === "groq" ? "Groq" : "OpenRouter"}
            data-oid="r5jrt-n">
            <LuBrain size={16} data-oid="1fu4vfy" />
          </Button>
          <Button variant="danger" size="icon" $rounded title="Apagar Conversa" onClick={clearHistory} disabled={loading} data-oid="9j7c9xg">
            <MdClearAll size={16} data-oid="ov-vunv" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AISettings
