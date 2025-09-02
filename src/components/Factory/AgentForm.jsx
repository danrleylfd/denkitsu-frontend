import { useState, memo, useEffect } from "react"
import { Save, ArrowLeft, Share2 } from "lucide-react"

import Button from "../Button"
import Input from "../Input"
import IconPickerInput from "../IconPickerInput"
import TextArea from "../TextArea"

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
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="secondary" size="icon" $rounded onClick={onBack} title="Voltar">
          <ArrowLeft size={16} />
        </Button>
        <h5 className="text-lightFg-primary dark:text-darkFg-primary">
          {agent._id ? "Editar Agente" : "Fabricar Agente"}
        </h5>
      </div>
      <div className="overflow-y-auto flex flex-col">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Agent Name (Nome do Agente)</label>
          <Input placeholder="NomeDoAgente" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} disabled={loading} maxLength="32">
            <IconPickerInput value={formData.Icon} onChange={(value) => handleChange("Icon", value)} disabled={loading} />
          </Input>
          <small className="text-right text-xs text-lightFg-tertiary dark:text-darkFg-tertiary self-end pr-2">{formData.name.length} / {32}</small>
          <div className="flex items-start gap-2">
            <TextArea
              label="Description (Descrição)"
              placeholder="Descrição curta sobre a função do agente..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              disabled={loading}
              maxLength={256}
              rows={3}
            />
          </div>
          <div className="flex items-start gap-2">
            <TextArea
              label="Goal (Objetivo)"
              placeholder="O objetivo principal do agente..."
              value={formData.prompt.goal}
              onChange={(e) => handlePromptChange("goal", e.target.value)}
              disabled={loading}
              maxLength={512}
              rows={4}
            />
          </div>
          <div className="flex items-start gap-2">
            <TextArea
              label="Return Format (Formato de Retorno)"
              placeholder="O formato de saída esperado..."
              value={formData.prompt.returnFormat}
              onChange={(e) => handlePromptChange("returnFormat", e.target.value)}
              disabled={loading}
              maxLength={512}
              rows={4}
            />
          </div>
          <div className="flex items-start gap-2">
            <TextArea
              label="Warning (Aviso)"
              placeholder="Restrições críticas ou advertências..."
              value={formData.prompt.warning}
              onChange={(e) => handlePromptChange("warning", e.target.value)}
              disabled={loading}
              maxLength={512}
              rows={4}
            />
          </div>
          <div className="flex items-start gap-2">
            <TextArea
              label="Context Dump (Contexto)"
              placeholder="Dados contextuais relevantes..."
              value={formData.prompt.contextDump}
              onChange={(e) => handlePromptChange("contextDump", e.target.value)}
              disabled={loading}
              maxLength={512}
              rows={4}
            />
          </div>
        </div>
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
