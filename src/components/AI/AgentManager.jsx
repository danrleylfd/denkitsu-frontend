import { useState, memo } from "react"
import { Plus, Trash2, Pencil, Save, X, ArrowLeft, Bot, Shapes } from "lucide-react"

import { useAgents } from "../../contexts/AgentContext"
import { useNotification } from "../../contexts/NotificationContext"

import Button from "../Button"
import Input from "../Input"
import DynamicIcon from "../DynamicIcon"
import IconInputAutocomplete from "../IconInputAutocomplete"

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
  const { notifyError } = useNotification()

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
        <Input placeholder="Nome do Agente (ex: Mestre Cuca)" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} disabled={loading} />
        <IconInputAutocomplete
          placeholder="Ícone (Nome do Lucide Icon)"
          value={formData.icon}
          onChange={(value) => handleChange("icon", value)}
          disabled={loading}
        />
        <Input placeholder="Descrição curta (ex: Ajuda com receitas)" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} disabled={loading} />
        <textarea placeholder="Goal: Objetivo do prompt..." value={formData.prompt.goal} onChange={(e) => handlePromptChange("goal", e.target.value)} className="w-full h-20 p-2 rounded-md resize-y bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" disabled={loading} />
        <textarea placeholder="Return Format: Formato da resposta..." value={formData.prompt.returnFormat} onChange={(e) => handlePromptChange("returnFormat", e.target.value)} className="w-full h-20 p-2 rounded-md resize-y bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" disabled={loading} />
        <textarea placeholder="Warning: Restrições e avisos..." value={formData.prompt.warning} onChange={(e) => handlePromptChange("warning", e.target.value)} className="w-full h-20 p-2 rounded-md resize-y bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" disabled={loading} />
        <textarea placeholder="Context Dump: Dados de contexto..." value={formData.prompt.contextDump} onChange={(e) => handlePromptChange("contextDump", e.target.value)} className="w-full h-20 p-2 rounded-md resize-y bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" disabled={loading} />
      </div>
      <div className="flex justify-end pt-2 border-t border-bLight dark:border-bDark">
        <Button type="submit" variant="primary" $rounded loading={loading} disabled={loading || !formData.name || !formData.description}>
          {!loading && <Save size={16} className="mr-2" />} Salvar Agente
        </Button>
      </div>
    </form>
  )
})

const AgentList = memo(({ agents, onCreate, onEdit, onDelete, toggleAgentManagerDoor, canCreate }) => (
  <div className="flex flex-col h-full">
    <div className="flex justify-between items-center pb-2 border-b border-bLight dark:border-bDark">
      <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary">Gerenciador de Agentes ({agents.length}/7)</h3>
      <Button variant="danger" size="icon" $rounded onClick={toggleAgentManagerDoor}><X size={16} /></Button>
    </div>
    <div className="flex-1 overflow-y-auto py-2 pr-2">
      {agents.length === 0 ? (
        <div className="text-center py-10">
          <Shapes size={48} className="mx-auto text-lightFg-tertiary dark:text-darkFg-tertiary" />
          <p className="mt-4 text-sm text-lightFg-primary dark:text-darkFg-primary">Você ainda não criou nenhum agente.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {agents.map((agent) => (
            <li key={agent._id}>
              <div className="w-full text-left p-3 rounded-md flex justify-between items-center group bg-lightBg-tertiary/50 dark:bg-darkBg-secondary/50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <DynamicIcon name={agent.icon} className="text-primary-base flex-shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lightFg-primary dark:text-darkFg-primary truncate">{agent.name}</p>
                    <p className="text-xs text-lightFg-tertiary dark:text-darkFg-tertiary truncate">{agent.description}</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pl-2">
                  <Button variant="warning" size="icon" $rounded title="Editar" onClick={(e) => { e.stopPropagation(); onEdit(agent) }}><Pencil size={14} /></Button>
                  <Button variant="danger" size="icon" $rounded title="Excluir" onClick={(e) => { e.stopPropagation(); onDelete(agent) }}><Trash2 size={14} /></Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
    <div className="pt-2 border-t border-bLight dark:border-bDark">
      <Button variant="primary" $rounded onClick={onCreate} className="w-full justify-center" disabled={!canCreate} title={canCreate ? "Criar Novo Agente" : "Limite de 7 agentes atingido"}>
        <Plus size={16} className="mr-2" /> Criar Novo Agente
      </Button>
    </div>
  </div>
))

const AgentManager = ({ agentManagerDoor, toggleAgentManagerDoor }) => {
  if (!agentManagerDoor) return null
  const { agents, loading, addAgent, editAgent, removeAgent } = useAgents()
  const canCreateAgent = agents.length < 7
  const { notifyError, notifyInfo } = useNotification()
  const [view, setView] = useState("list")
  const [currentAgent, setCurrentAgent] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleSave = async (agentData) => {
    setFormLoading(true)
    try {
      if (currentAgent) {
        await editAgent(currentAgent._id, agentData)
        notifyInfo("Agente atualizado com sucesso!")
      } else {
        await addAgent(agentData)
        notifyInfo("Agente criado com sucesso!")
      }
      setView("list")
      setCurrentAgent(null)
    } catch (error) {
      notifyError(error.response?.data?.error?.message || "Falha ao salvar agente.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (agent) => {
    if (window.confirm(`Tem certeza que deseja excluir o agente "${agent.name}"?`)) {
      try {
        await removeAgent(agent._id)
        notifyInfo("Agente excluído com sucesso!")
      } catch (error) {
        notifyError(error.response?.data?.error?.message || "Falha ao excluir agente.")
      }
    }
  }

  const handleEdit = (agent) => {
    setCurrentAgent(agent)
    setView("form")
  }

  const handleCreate = () => {
    setCurrentAgent(null)
    setView("form")
  }

  const handleBack = () => {
    setCurrentAgent(null)
    setView("list")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={toggleAgentManagerDoor}>
      <div
        className="relative flex w-full max-w-xl h-[90vh] flex-col gap-2 rounded-lg bg-lightBg-primary p-4 shadow-2xl dark:bg-darkBg-primary"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? <Button variant="outline" loading disabled /> : (
          view === "list"
            ? <AgentList agents={agents} onCreate={handleCreate} onEdit={handleEdit} onDelete={handleDelete} toggleAgentManagerDoor={toggleAgentManagerDoor} canCreate={canCreateAgent} />
            : <AgentForm agent={currentAgent} onSave={handleSave} onBack={handleBack} loading={formLoading} />
        )}
      </div>
    </div>
  )
}

export default AgentManager
