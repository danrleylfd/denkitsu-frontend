import { useState, memo } from "react"
import { Plus, Trash2, Pencil, Save, X, ArrowLeft, Bot, Shapes, Code } from "lucide-react" // Ícone 'Code' adicionado

import { useAgents } from "../../contexts/AgentContext"

import Button from "../Button"
import Input from "../Input"
import DynamicIcon from "../DynamicIcon"
import IconPickerInput from "../IconPickerInput"

const AgentForm = memo(({ agent, onSave, onBack, loading }) => {
  const [formData, setFormData] = useState({
    name: agent?.name || "",
    icon: agent?.icon || "Bot",
    description: agent?.description || "",
    prompt: {
      goal: agent?.prompt?.goal || "",
      returnFormat: agent?.prompt?.returnFormat || "",
      warning: agent?.prompt?.warning || "",
      contextDump: agent?.prompt?.contextDump || "",
    }
  })

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const handlePromptChange = (field, value) => setFormData(prev => ({ ...prev, prompt: { ...prev.prompt, [field]: value } }))

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
        <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary truncate">
          {agent ? `Editando: ${agent.name}` : "Criar Novo Agente"}
        </h3>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-2">
        <Input placeholder="Nome do Agente (ex: Mestre Cuca)" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} disabled={loading} maxLength="30" />
        <small className="text-right text-xs text-lightFg-tertiary dark:text-darkFg-tertiary self-end pr-2 -mt-2">{formData.name.length} / 30</small>

        <IconPickerInput
          value={formData.icon}
          onChange={(value) => handleChange("icon", value)}
          disabled={loading}
        />

        <Input placeholder="Descrição curta (ex: Ajuda com receitas)" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} disabled={loading} maxLength="100" />
        <small className="text-right text-xs text-lightFg-tertiary dark:text-darkFg-tertiary self-end pr-2 -mt-2">{formData.description.length} / 100</small>

        {/* Campos do Prompt Agrupados */}
        <details className="bg-lightBg-secondary/50 dark:bg-darkBg-secondary/50 p-3 rounded-md">
          <summary className="cursor-pointer font-bold text-sm text-lightFg-secondary dark:text-darkFg-secondary">
            <Code size={16} className="inline mr-2" />
            Estrutura do Prompt (Modelo GRWC)
          </summary>
          <div className="flex flex-col gap-4 mt-2">
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Goal (Objetivo)</label>
              <textarea placeholder="O objetivo principal do agente..." value={formData.prompt.goal} onChange={(e) => handlePromptChange("goal", e.target.value)} className="w-full h-24 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" disabled={loading} />
            </div>
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Return Format (Formato de Retorno)</label>
              <textarea placeholder="O formato de saída esperado..." value={formData.prompt.returnFormat} onChange={(e) => handlePromptChange("returnFormat", e.target.value)} className="w-full h-24 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" disabled={loading} />
            </div>
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Warning (Aviso)</label>
              <textarea placeholder="Restrições críticas ou advertências..." value={formData.prompt.warning} onChange={(e) => handlePromptChange("warning", e.target.value)} className="w-full h-24 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" disabled={loading} />
            </div>
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Context Dump (Contexto)</label>
              <textarea placeholder="Dados contextuais relevantes..." value={formData.prompt.contextDump} onChange={(e) => handlePromptChange("contextDump", e.target.value)} className="w-full h-24 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" disabled={loading} />
            </div>
          </div>
        </details>
      </div>
      <div className="flex justify-end pt-2 border-t border-bLight dark:border-bDark">
        <Button type="submit" variant="primary" $rounded loading={loading} disabled={loading || !formData.name || !formData.description}>
          {!loading && <Save size={16} className="mr-2" />} Salvar Agente
        </Button>
      </div>
    </form>
  )
})

const ToolList = memo(({ tools, onCreate, onEdit, onDelete, toggleToolBuilderDoor, canCreate }) => (
  <div className="flex flex-col h-full">
    <div className="flex justify-between items-center pb-4 border-b border-bLight dark:border-bDark">
      <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary">Fábrica de Ferramentas ({tools.length}/6)</h3>
      <Button variant="danger" size="icon" $rounded onClick={toggleToolBuilderDoor}><X size={16} /></Button>
    </div>
    <div className="flex-1 overflow-y-auto py-4 pr-2">
      {tools.length === 0 ? (
        <div className="text-center py-10">
          <PocketKnife size={48} className="mx-auto text-lightFg-tertiary dark:text-darkFg-tertiary" />
          <p className="mt-4 text-sm text-lightFg-primary dark:text-darkFg-primary">Você ainda não criou nenhuma ferramenta.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tools.map(tool => {
            return (
              <li key={tool._id}>
                <button
                  onClick={() => onEdit(tool)}
                  className="w-full text-left p-3 rounded-md transition-colors flex justify-between items-center group hover:bg-lightBg-tertiary dark:hover:bg-darkBg-secondary"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <DynamicIcon name={tool.icon || "PocketKnife"} className="text-primary-base flex-shrink-0" size={20} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lightFg-primary dark:text-darkFg-primary truncate">{tool.alias || tool.name}</p>
                      {tool.alias && <p className="text-xs font-mono text-lightFg-tertiary dark:text-darkFg-tertiary truncate">{tool.description}</p>}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pl-2">
                    <Button variant="warning" size="icon" $rounded title="Editar" onClick={(e) => { e.stopPropagation(); onEdit(tool) }}><Pencil size={14} /></Button>
                    <Button variant="danger" size="icon" $rounded title="Excluir" onClick={(e) => { e.stopPropagation(); onDelete(tool) }}><Trash2 size={14} /></Button>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
    <div className="pt-4 border-t border-bLight dark:border-bDark">
      <Button variant="primary" $rounded onClick={onCreate} className="w-full justify-center" disabled={!canCreate} title={canCreate ? "Criar Nova Ferramenta" : "Limite de 6 ferramentas atingido"}>
        <Plus size={16} className="mr-2" /> Criar Nova Ferramenta
      </Button>
    </div>
  </div>
))

const AIToolBuilder = ({ toolBuilderDoor, toggleToolBuilderDoor }) => {
  if (!toolBuilderDoor) return null
  const { tools, loading, addTool, editTool, removeTool } = useTools()
  const canCreateTool = tools.length < 6
  const { notifyError, notifyInfo } = useNotification()
  const [view, setView] = useState("list")
  const [currentTool, setCurrentTool] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleSave = async (toolData) => {
    setFormLoading(true)
    try {
      if (currentTool) {
        await editTool(currentTool._id, toolData)
        notifyInfo("Ferramenta atualizada com sucesso!")
      } else {
        await addTool(toolData)
        notifyInfo("Ferramenta criada com sucesso!")
      }
      setView("list")
      setCurrentTool(null)
    } catch (error) {
      notifyError(error.response?.data?.error?.message || "Falha ao salvar ferramenta.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (tool) => {
    if (window.confirm(`Tem certeza que deseja excluir a ferramenta "${tool.name}"?`)) {
      try {
        await removeTool(tool._id)
        notifyInfo("Ferramenta excluída com sucesso!")
      } catch (error) {
        notifyError(error.response?.data?.error?.message || "Falha ao excluir ferramenta.")
      }
    }
  }

  const handleEdit = (tool) => {
    setCurrentTool(tool)
    setView("form")
  }

  const handleCreate = () => {
    setCurrentTool(null)
    setView("form")
  }

  const handleBack = () => {
    setCurrentTool(null)
    setView("list")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={toggleToolBuilderDoor}>
      <div
        className="relative flex w-full max-w-xl h-[90vh] flex-col gap-2 rounded-lg bg-lightBg-primary p-4 shadow-2xl dark:bg-darkBg-primary"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? <Button variant="outline" loading disabled /> : (
          view === 'list'
            ? <ToolList tools={tools} onCreate={handleCreate} onEdit={handleEdit} onDelete={handleDelete} toggleToolBuilderDoor={toggleToolBuilderDoor} canCreate={canCreateTool} />
            : <ToolForm tool={currentTool} onSave={handleSave} onBack={handleBack} loading={formLoading} />
        )}
      </div>
    </div>
  )
}

export default AIToolBuilder
