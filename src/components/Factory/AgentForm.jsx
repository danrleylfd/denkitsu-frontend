import { useState, memo } from "react"
import { Save, X, ArrowLeft, Code, Share2 } from "lucide-react"

import Button from "../Button"
import Input from "../Input"
import IconPickerInput from "../IconPickerInput"

const AgentForm = memo(({ agent, onSave, onBack, loading }) => {
  const [formData, setFormData] = useState({
    name: agent?.name || "",
    Icon: agent?.Icon || "Bot",
    description: agent?.description || "",
    published: agent?.published || false,
    prompt: {
      goal: agent?.prompt?.goal || "",
      returnFormat: agent?.prompt?.returnFormat || "",
      warning: agent?.prompt?.warning || "",
      contextDump: agent?.prompt?.contextDump || ""
    }
  })

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }))

  const handlePromptChange = (field, value) => setFormData((prev) => ({ ...prev, prompt: { ...prev.prompt, [field]: value } }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 h-full">
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="icon" $rounded onClick={onBack} title="Voltar">
          <ArrowLeft size={16} />
        </Button>
        <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary truncate">{agent ? `Editando: ${agent.name}` : "Criar Novo Agente"}</h3>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-2">
        <div className="flex flex-col gap-2 p-3 rounded-md bg-lightBg-tertiary dark:bg-darkBg-tertiary">
          <div className="flex flex-col">
            <Input
              placeholder="Nome do Agente (ex: Mestre Cuca)"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={loading}
              maxLength="32"
            />
            <small className="text-right text-xs text-lightFg-tertiary dark:text-darkFg-tertiary self-end pr-2">{formData.name.length} / 32</small>
          </div>

          <IconPickerInput value={formData.Icon} onChange={(value) => handleChange("Icon", value)} disabled={loading} />

          <div className="flex flex-col">
            <Input
              placeholder="Descrição curta (ex: Ajuda com receitas)"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              disabled={loading}
              maxLength="256"
            />
            <small className="text-right text-xs text-lightFg-tertiary dark:text-darkFg-tertiary self-end pr-2">{formData.description.length} / 256</small>
          </div>
        </div>

        <details className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-3 rounded-md">
          <summary className="cursor-pointer font-bold text-sm text-lightFg-secondary dark:text-darkFg-secondary">
            <Code size={16} className="inline mr-2" />
            Estrutura do Prompt (Modelo GRWC)
          </summary>
          <div className="flex flex-col gap-2 mt-2">
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Goal (Objetivo)</label>
              <textarea
                placeholder="O objetivo principal do agente..."
                value={formData.prompt.goal}
                onChange={(e) => handlePromptChange("goal", e.target.value)}
                className="w-full h-24 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Return Format (Formato de Retorno)</label>
              <textarea
                placeholder="O formato de saída esperado..."
                value={formData.prompt.returnFormat}
                onChange={(e) => handlePromptChange("returnFormat", e.target.value)}
                className="w-full h-24 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Warning (Aviso)</label>
              <textarea
                placeholder="Restrições críticas ou advertências..."
                value={formData.prompt.warning}
                onChange={(e) => handlePromptChange("warning", e.target.value)}
                className="w-full h-24 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Context Dump (Contexto)</label>
              <textarea
                placeholder="Dados contextuais relevantes..."
                value={formData.prompt.contextDump}
                onChange={(e) => handlePromptChange("contextDump", e.target.value)}
                className="w-full h-24 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary"
                disabled={loading}
              />
            </div>
          </div>
        </details>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-bLight dark:border-bDark">
        <label htmlFor="agent-published" className="flex items-center gap-2 cursor-pointer text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">
          <Share2 size={16} />
          Publicar na Loja
          <input
            id="agent-published"
            type="checkbox"
            checked={formData.published}
            onChange={(e) => handleChange("published", e.target.checked)}
            disabled={loading}
            className="w-4 h-4 rounded text-primary-base bg-lightBg-tertiary border-gray-300 focus:ring-primary-base dark:focus:ring-primary-base dark:ring-offset-darkBg-primary dark:bg-darkBg-tertiary dark:border-gray-600"
          />
        </label>
        <Button type="submit" variant="primary" $rounded loading={loading} disabled={loading || !formData.name || !formData.description}>
          {!loading && <Save size={16} className="mr-2" />} Salvar Agente
        </Button>
      </div>
    </form>
  )
})

export default AgentForm
