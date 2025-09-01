import { useState, memo, useEffect } from "react"
import { Save, ArrowLeft, Code, Share2 } from "lucide-react"

import Button from "../Button"
import Input from "../Input"
import IconPickerInput from "../IconPickerInput"

const AgentForm = memo(({ agent, onSave, onBack, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    Icon: "Bot",
    description: "",
    published: false,
    prompt: { goal: "", returnFormat: "", warning: "", contextDump: "" }
  })

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || "",
        Icon: agent.Icon || "Bot",
        description: agent.description || "",
        published: agent.published || false,
        prompt: {
          goal: agent.prompt?.goal || "",
          returnFormat: agent.prompt?.returnFormat || "",
          warning: agent.prompt?.warning || "",
          contextDump: agent.prompt?.contextDump || ""
        }
      })
    }
  }, [agent])

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }))
  const handlePromptChange = (field, value) => setFormData((prev) => ({ ...prev, prompt: { ...prev.prompt, [field]: value } }))
  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex items-center gap-2 flex-shrink-0 mb-2">
        <Button variant="secondary" size="icon" $rounded onClick={onBack} title="Voltar">
          <ArrowLeft size={16} />
        </Button>
        <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary truncate">{agent._id ? `Editando: ${agent.name}` : "Criar Novo Agente"}</h3>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-4">
        <div className="flex flex-col gap-2 p-3 rounded-md bg-lightBg-tertiary dark:bg-darkBg-tertiary font-mono text-sm">
          <div className="flex items-center gap-2">
            <label className="text-lightFg-tertiary dark:text-darkFg-tertiary">name:</label>
            <Input
              containerClassName="my-0"
              className="font-mono text-sm"
              placeholder="NomeDoAgente"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={loading}
              maxLength="32"
            />
          </div>
          <IconPickerInput value={formData.Icon} onChange={(value) => handleChange("Icon", value)} disabled={loading} />
          <div className="flex items-start gap-2">
            <label className="text-lightFg-tertiary dark:text-darkFg-tertiary pt-2">description:</label>
            <textarea
              placeholder="Descrição curta sobre a função do agente..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full flex-1 h-20 p-2 rounded-md resize-y font-mono text-sm bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary focus:outline-primary-base"
              disabled={loading}
              maxLength="256"
            />
          </div>
        </div>

        <details className="p-3 rounded-md bg-lightBg-tertiary dark:bg-darkBg-tertiary" open>
          <summary className="cursor-pointer font-bold text-sm text-lightFg-secondary dark:text-darkFg-secondary font-mono">
            <Code size={16} className="inline mr-2" />
            prompt:
          </summary>
          <div className="flex flex-col gap-2 mt-2 pl-4 border-l border-bLight dark:border-bDark">
            <textarea
              placeholder="Goal: O objetivo principal do agente..."
              value={formData.prompt.goal}
              onChange={(e) => handlePromptChange("goal", e.target.value)}
              className="w-full h-24 p-2 rounded-md resize-y font-mono text-sm bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary focus:outline-primary-base"
              disabled={loading}
            />
            <textarea
              placeholder="Return Format: O formato de saída esperado..."
              value={formData.prompt.returnFormat}
              onChange={(e) => handlePromptChange("returnFormat", e.target.value)}
              className="w-full h-24 p-2 rounded-md resize-y font-mono text-sm bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary focus:outline-primary-base"
              disabled={loading}
            />
            <textarea
              placeholder="Warning: Restrições críticas ou advertências..."
              value={formData.prompt.warning}
              onChange={(e) => handlePromptChange("warning", e.target.value)}
              className="w-full h-24 p-2 rounded-md resize-y font-mono text-sm bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary focus:outline-primary-base"
              disabled={loading}
            />
            <textarea
              placeholder="Context Dump: Dados contextuais relevantes..."
              value={formData.prompt.contextDump}
              onChange={(e) => handlePromptChange("contextDump", e.target.value)}
              className="w-full h-24 p-2 rounded-md resize-y font-mono text-sm bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary focus:outline-primary-base"
              disabled={loading}
            />
          </div>
        </details>
      </div>
      <div className="flex justify-between items-center pt-2 mt-2 border-t border-bLight dark:border-bDark flex-shrink-0">
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
          {!loading && <Save size={16} className="mr-2" />} Salvar
        </Button>
      </div>
    </form>
  )
})

export default AgentForm
