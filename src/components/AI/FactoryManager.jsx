import { useState, memo, useEffect } from "react"
import { Plus, Trash2, Pencil, Save, X, ArrowLeft, Bot, Code, PocketKnife, Factory } from "lucide-react"

import { useAgents } from "../../contexts/AgentContext"
import { useTools } from "../../contexts/ToolContext"
import { useNotification } from "../../contexts/NotificationContext"

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
        <div className="flex flex-col">
          <Input placeholder="Nome do Agente (ex: Mestre Cuca)" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} disabled={loading} maxLength="30" />
          <small className="text-right text-xs text-lightFg-tertiary dark:text-darkFg-tertiary self-end pr-2">{formData.name.length} / 30</small>
        </div>

        <IconPickerInput
          value={formData.icon}
          onChange={(value) => handleChange("icon", value)}
          disabled={loading}
        />

        <div className="flex flex-col">
          <Input placeholder="Descrição curta (ex: Ajuda com receitas)" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} disabled={loading} maxLength="100" />
          <small className="text-right text-xs text-lightFg-tertiary dark:text-darkFg-tertiary self-end pr-2">{formData.description.length} / 100</small>
        </div>

        <details className="bg-lightBg-primary dark:bg-darkBg-primary p-3 rounded-md">
          <summary className="cursor-pointer font-bold text-sm text-lightFg-secondary dark:text-darkFg-secondary">
            <Code size={16} className="inline mr-2" />
            Estrutura do Prompt (Modelo GRWC)
          </summary>
          <div className="flex flex-col gap-2 mt-2">
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

const AgentList = memo(({ agents, onCreate, onEdit, onDelete, canCreate }) => (
  <div className="flex flex-col h-full">
    <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary mb-2">Gerenciador de Agentes ({agents.length}/7)</h3>
    <div className="flex-1 overflow-y-auto py-2 pr-2">
      {agents.length === 0 ? (
        <div className="text-center py-10">
          <Bot size={48} className="mx-auto text-lightFg-tertiary dark:text-darkFg-tertiary" />
          <p className="mt-4 text-sm text-lightFg-primary dark:text-darkFg-primary">Você ainda não criou nenhum agente.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {agents.map((agent) => (
            <li key={agent._id}>
              <button
                onClick={() => onEdit(agent)}
                className="w-full text-left p-3 rounded-md transition-colors flex justify-between items-center group hover:bg-lightBg-tertiary dark:hover:bg-darkBg-secondary"
              >
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
              </button>
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

const ToolForm = memo(({ tool, onSave, onBack, loading }) => {
  const [formData, setFormData] = useState({})
  const { notifyError } = useNotification()

  useEffect(() => {
    setFormData({
      name: tool?.name || "",
      alias: tool?.alias || "",
      description: tool?.description || "",
      icon: tool?.icon || "PocketKnife",
      method: tool?.httpConfig?.method || "GET",
      url: tool?.httpConfig?.url || "",
      parameters: JSON.stringify(tool?.parameters || { type: "object", properties: {}, required: [] }, null, 2),
      queryParams: JSON.stringify(tool?.httpConfig?.queryParams || {}, null, 2),
      headers: JSON.stringify(tool?.httpConfig?.headers || {}, null, 2),
      body: JSON.stringify(tool?.httpConfig?.body || {}, null, 2)
    })
  }, [tool])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      const toolData = {
        name: formData.name,
        description: formData.description,
        alias: formData.alias,
        icon: formData.icon,
        parameters: JSON.parse(formData.parameters),
        httpConfig: {
          method: formData.method,
          url: formData.url,
          queryParams: JSON.parse(formData.queryParams),
          headers: JSON.parse(formData.headers),
          body: JSON.parse(formData.body),
        }
      }
      onSave(toolData)
    } catch (error) {
      notifyError("JSON inválido em um dos campos avançados. Por favor, verifique.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="icon" $rounded onClick={onBack} title="Voltar para a lista">
          <ArrowLeft size={16} />
        </Button>
        <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary truncate">{tool ? `Editando: ${tool.name}` : "Criar Nova Ferramenta"}</h3>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-4">
        <div>
          <Input placeholder="Apelido da Ferramenta (ex: Buscar CEP)" value={formData.alias} onChange={(e) => handleChange("alias", e.target.value)} disabled={loading} />
          <Input placeholder="Nome Técnico (ex: cepTool)" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} disabled={loading} />
          <IconPickerInput
            value={formData.icon}
            onChange={(value) => handleChange("icon", value)}
            disabled={loading}
          />
        </div>
        <div>
          <label className="text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">Descrição para a IA</label>
          <textarea placeholder="Como e quando usar esta ferramenta..." value={formData.description} onChange={(e) => handleChange("description", e.target.value)} className="w-full mt-1 h-24 p-2 rounded-md resize-y bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" disabled={loading} />
        </div>
        <div>
          <label className="text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">Configuração HTTP</label>
          <div className="flex gap-2 mt-1">
            <select value={formData.method} onChange={(e) => handleChange("method", e.target.value)} className="rounded-full bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary p-2" disabled={loading}>
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <Input placeholder="URL Base da API (sem query params)" value={formData.url} onChange={(e) => handleChange("url", e.target.value)} disabled={loading} />
          </div>
        </div>
        <details className="bg-lightBg-primary dark:bg-darkBg-primary p-3 rounded-md">
          <summary className="cursor-pointer font-bold text-sm text-lightFg-secondary dark:text-darkFg-secondary">
            <Code size={16} className="inline mr-2" />
            Configurações Avançadas (JSON)
          </summary>
          <div className="flex flex-col gap-2 mt-2">
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Definição do Esquema da Ferramenta</label>
              <textarea  placeholder={`{ "type": "object", "properties": {}, "required": [] }`} value={formData.parameters} onChange={(e) => handleChange("parameters", e.target.value)} className="w-full h-40 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Parâmetros de Query (JSON)</label>
              <textarea placeholder={`{ "static": "valor_fixo", "dynamic": "{{variable}}" }`} value={formData.queryParams} onChange={(e) => handleChange("queryParams", e.target.value)} className="w-full h-24 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Cabeçalho</label>
              <textarea placeholder={`{ "Content-Type": "application/json" }`} value={formData.headers} onChange={(e) => handleChange("headers", e.target.value)} className="w-full h-40 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Corpo</label>
              <textarea placeholder={`{ "text": "Hello World" }`} value={formData.body} onChange={(e) => handleChange("body", e.target.value)} className="w-full h-40 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" />
            </div>
          </div>
        </details>
      </div>
      <div className="flex justify-end pt-4 border-t border-bLight dark:border-bDark">
        <Button type="submit" variant="primary" $rounded loading={loading} disabled={loading || !formData.name || !formData.url}>
          {!loading && <Save size={16} className="mr-2" />} Salvar Ferramenta
        </Button>
      </div>
    </form>
  )
})

const ToolList = memo(({ tools, onCreate, onEdit, onDelete, canCreate }) => (
  <div className="flex flex-col h-full">
    <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary mb-2">Fábrica de Ferramentas ({tools.length}/6)</h3>
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

const AIFactoryManager = ({ factoryManagerDoor, toggleFactoryManagerDoor }) => {
  if (!factoryManagerDoor) return null

  const [activeTab, setActiveTab] = useState("agents")
  const { notifyError, notifyInfo } = useNotification()

  const { agents, loading: agentsLoading, addAgent, editAgent, removeAgent } = useAgents()
  const canCreateAgent = agents.length < 7
  const [agentView, setAgentView] = useState("list")
  const [currentAgent, setCurrentAgent] = useState(null)
  const [agentFormLoading, setAgentFormLoading] = useState(false)

  const { tools, loading: toolsLoading, addTool, editTool, removeTool } = useTools()
  const canCreateTool = tools.length < 6
  const [toolView, setToolView] = useState("list")
  const [currentTool, setCurrentTool] = useState(null)
  const [toolFormLoading, setToolFormLoading] = useState(false)

  const handleAgentSave = async (agentData) => {
    setAgentFormLoading(true)
    try {
      if (currentAgent) {
        await editAgent(currentAgent._id, agentData)
        notifyInfo("Agente atualizado com sucesso!")
      } else {
        await addAgent(agentData)
        notifyInfo("Agente criado com sucesso!")
      }
      setAgentView("list")
      setCurrentAgent(null)
    } catch (error) {
      notifyError(error.response?.data?.error?.message || "Falha ao salvar agente.")
    } finally {
      setAgentFormLoading(false)
    }
  }

  const handleAgentDelete = async (agent) => {
    if (window.confirm(`Tem certeza que deseja excluir o agente "${agent.name}"?`)) {
      try {
        await removeAgent(agent._id)
        notifyInfo("Agente excluído com sucesso!")
      } catch (error) {
        notifyError(error.response?.data?.error?.message || "Falha ao excluir agente.")
      }
    }
  }

  const handleAgentEdit = (agent) => {
    setCurrentAgent(agent)
    setAgentView("form")
  }

  const handleAgentCreate = () => {
    setCurrentAgent(null)
    setAgentView("form")
  }

  const handleAgentBack = () => {
    setCurrentAgent(null)
    setAgentView("list")
  }

  const handleToolSave = async (toolData) => {
    setToolFormLoading(true)
    try {
      if (currentTool) {
        await editTool(currentTool._id, toolData)
        notifyInfo("Ferramenta atualizada com sucesso!")
      } else {
        await addTool(toolData)
        notifyInfo("Ferramenta criada com sucesso!")
      }
      setToolView("list")
      setCurrentTool(null)
    } catch (error) {
      notifyError(error.response?.data?.error?.message || "Falha ao salvar ferramenta.")
    } finally {
      setToolFormLoading(false)
    }
  }

  const handleToolDelete = async (tool) => {
    if (window.confirm(`Tem certeza que deseja excluir a ferramenta "${tool.alias || tool.name}"?`)) {
      try {
        await removeTool(tool._id)
        notifyInfo("Ferramenta excluída com sucesso!")
      } catch (error) {
        notifyError(error.response?.data?.error?.message || "Falha ao excluir ferramenta.")
      }
    }
  }

  const handleToolEdit = (tool) => {
    setCurrentTool(tool)
    setToolView("form")
  }

  const handleToolCreate = () => {
    setCurrentTool(null)
    setToolView("form")
  }

  const handleToolBack = () => {
    setCurrentTool(null)
    setToolView("list")
  }

  const renderAgentContent = () => {
    if (agentsLoading) return <Button variant="outline" loading disabled />
    return agentView === "list"
      ? <AgentList agents={agents} onCreate={handleAgentCreate} onEdit={handleAgentEdit} onDelete={handleAgentDelete} canCreate={canCreateAgent} />
      : <AgentForm agent={currentAgent} onSave={handleAgentSave} onBack={handleAgentBack} loading={agentFormLoading} />
  }

  const renderToolContent = () => {
    if (toolsLoading) return <Button variant="outline" loading disabled />
    return toolView === "list"
      ? <ToolList tools={tools} onCreate={handleToolCreate} onEdit={handleToolEdit} onDelete={handleToolDelete} canCreate={canCreateTool} />
      : <ToolForm tool={currentTool} onSave={handleToolSave} onBack={handleToolBack} loading={toolFormLoading} />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="relative flex w-full max-w-lg h-[95vh] flex-col gap-2 rounded-lg bg-lightBg-primary p-4 shadow-2xl dark:bg-darkBg-primary border border-solid border-brand-purple"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-2 border-b border-bLight dark:border-bDark">
          <div className="flex items-center gap-2">
            <Factory size={24} className="text-primary-base" />
            <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary">Fábrica</h3>
          </div>
          <Button variant="danger" size="icon" $rounded onClick={toggleFactoryManagerDoor}><X size={16} /></Button>
        </div>

        <div className="flex border-b border-bLight dark:border-bDark mb-2">
          <button onClick={() => setActiveTab("agents")} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 ${activeTab === "agents" ? "border-b-2 border-primary-base text-primary-base" : "text-lightFg-secondary"}`}>
            <Bot size={16} /> Agentes
          </button>
          <button onClick={() => setActiveTab("tools")} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 ${activeTab === "tools" ? "border-b-2 border-primary-base text-primary-base" : "text-lightFg-secondary"}`}>
            <PocketKnife size={16} /> Ferramentas
          </button>
        </div>

        <div className="flex-grow overflow-hidden">
          {activeTab === "agents" ? renderAgentContent() : renderToolContent()}
        </div>
      </div>
    </div>
  )
}

export default AIFactoryManager
