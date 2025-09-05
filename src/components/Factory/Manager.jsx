import { useState } from "react"
import { Speech, Wrench, Factory, X } from "lucide-react"

import { useAgents } from "../../contexts/AgentContext"
import { useTools } from "../../contexts/ToolContext"
import { useNotification } from "../../contexts/NotificationContext"

import Paper from "../Paper"
import Button from "../Button"

import FactoryList from "./List"
import AgentForm from "./AgentForm"
import ToolForm from "./ToolForm"

const FactoryManager = ({ factoryManagerDoor, toggleFactoryManagerDoor }) => {
  if (!factoryManagerDoor) return null
  const [activeTab, setActiveTab] = useState("agents")
  const { notifyError, notifyInfo } = useNotification()
  const { agents, loadingAgents, addAgent, editAgent, removeAgent } = useAgents()
  const [agentView, setAgentView] = useState("list")
  const [currentAgent, setCurrentAgent] = useState(null)
  const [agentFormLoading, setAgentFormLoading] = useState(false)
  const { tools, loadingTools, addTool, editTool, removeTool } = useTools()
  const [toolView, setToolView] = useState("list")
  const [currentTool, setCurrentTool] = useState(null)
  const [toolFormLoading, setToolFormLoading] = useState(false)

  const handleAgentSave = async (agentData) => {
    setAgentFormLoading(true)
    try {
      if (currentAgent._id) {
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
    setCurrentAgent({})
    setAgentView("form")
  }

  const handleAgentBack = () => {
    setCurrentAgent(null)
    setAgentView("list")
  }

  const handleToolSave = async (toolData) => {
    setToolFormLoading(true)
    try {
      if (currentTool._id) {
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
    if (window.confirm(`Tem certeza que deseja excluir a ferramenta "${tool.title || tool.name}"?`)) {
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
    setCurrentTool({})
    setToolView("form")
  }

  const handleToolBack = () => {
    setCurrentTool(null)
    setToolView("list")
  }

  const renderAgentContent = () => {
    if (loadingAgents) return <div className="flex h-full items-center justify-center"><Button variant="outline" loading disabled /></div>
    if (agentView === "form") return <AgentForm agent={currentAgent} onSave={handleAgentSave} onBack={handleAgentBack} loading={agentFormLoading} />
    return <FactoryList
      items={agents.customAgents}
      itemType="agent"
      onCreate={handleAgentCreate}
      onEdit={handleAgentEdit}
      onDelete={handleAgentDelete}
    />
  }

  const renderToolContent = () => {
    if (loadingTools) return <div className="flex h-full items-center justify-center"><Button variant="outline" loading disabled /></div>
    if (toolView === "form") return <ToolForm tool={currentTool} onSave={handleToolSave} onBack={handleToolBack} loading={toolFormLoading} />
    return <FactoryList
      items={tools.customTools}
      itemType="tool"
      onCreate={handleToolCreate}
      onEdit={handleToolEdit}
      onDelete={handleToolDelete}
    />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Paper className="relative h-full max-h-[95%] flex flex-col gap-2 p-2 border border-solid border-brand-purple" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lightFg-primary dark:text-darkFg-primary">Fábrica</h3>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("agents")}
              className={`px-2 py-2 text-sm font-bold flex items-center gap-2 ${activeTab === "agents" ? "border-b-2 border-primary-base text-primary-base" : "text-lightFg-secondary"}`}>
              <Speech size={16} /> Agentes
            </button>
            <button
              onClick={() => setActiveTab("tools")}
              className={`px-2 py-2 text-sm font-bold flex items-center gap-2 ${activeTab === "tools" ? "border-b-2 border-primary-base text-primary-base" : "text-lightFg-secondary"}`}>
              <Wrench size={16} /> Ferramentas
            </button>
          </div>
          <Button variant="danger" size="icon" $rounded onClick={toggleFactoryManagerDoor}>
            <X size={16} />
          </Button>
        </div>
        <div className="flex-grow overflow-hidden">{activeTab === "agents" ? renderAgentContent() : renderToolContent()}</div>
      </Paper>
    </div>
  )
}

export default FactoryManager
