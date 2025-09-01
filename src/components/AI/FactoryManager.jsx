import { useState } from "react"
import { Bot, PocketKnife, Factory, X } from "lucide-react"

import { useAgents } from "../../contexts/AgentContext"
import { useTools } from "../../contexts/ToolContext"
import { useNotification } from "../../contexts/NotificationContext"

import Button from "../Button"
import AgentForm from "../Factory/AgentForm"
import AgentList from "../Factory/AgentList"
import ToolForm from "../Factory/ToolForm"
import ToolList from "../Factory/ToolList"

const AIFactoryManager = ({ factoryManagerDoor, toggleFactoryManagerDoor }) => {
  if (!factoryManagerDoor) return null

  const [activeTab, setActiveTab] = useState("agents")
  const { notifyError, notifyInfo } = useNotification()

  const { agents, loadingAgents, addAgent, editAgent, removeAgent } = useAgents()
  const canCreateAgent = agents.customAgents.length < 7
  const [agentView, setAgentView] = useState("list")
  const [currentAgent, setCurrentAgent] = useState(null)
  const [agentFormLoading, setAgentFormLoading] = useState(false)

  const { tools, loadingTools, addTool, editTool, removeTool } = useTools()
  const canCreateTool = tools.customTools.length < 6
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
    setCurrentTool(null)
    setToolView("form")
  }

  const handleToolBack = () => {
    setCurrentTool(null)
    setToolView("list")
  }

  const renderAgentContent = () => {
    if (loadingAgents) return <Button variant="outline" loading disabled />
    return agentView === "list" ? (
      <AgentList agents={agents.customAgents} onCreate={handleAgentCreate} onEdit={handleAgentEdit} onDelete={handleAgentDelete} canCreate={canCreateAgent} />
    ) : (
      <AgentForm agent={currentAgent} onSave={handleAgentSave} onBack={handleAgentBack} loading={agentFormLoading} />
    )
  }

  const renderToolContent = () => {
    if (loadingTools) return <Button variant="outline" loading disabled />
    return toolView === "list" ? (
      <ToolList tools={tools.customTools} onCreate={handleToolCreate} onEdit={handleToolEdit} onDelete={handleToolDelete} canCreate={canCreateTool} />
    ) : (
      <ToolForm tool={currentTool} onSave={handleToolSave} onBack={handleToolBack} loading={toolFormLoading} />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="relative flex w-full max-w-lg h-[95vh] flex-col gap-2 rounded-lg bg-lightBg-primary p-4 shadow-2xl dark:bg-darkBg-primary border border-solid border-brand-purple"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-2 border-b border-bLight dark:border-bDark">
          <div className="flex items-center gap-2">
            <Factory size={24} className="text-primary-base" />
            <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary">Fábrica</h3>
          </div>
          <Button variant="danger" size="icon" $rounded onClick={toggleFactoryManagerDoor}>
            <X size={16} />
          </Button>
        </div>

        <div className="flex border-b border-bLight dark:border-bDark mb-2">
          <button
            onClick={() => setActiveTab("agents")}
            className={`px-4 py-2 text-sm font-bold flex items-center gap-2 ${activeTab === "agents" ? "border-b-2 border-primary-base text-primary-base" : "text-lightFg-secondary"}`}>
            <Bot size={16} /> Agentes
          </button>
          <button
            onClick={() => setActiveTab("tools")}
            className={`px-4 py-2 text-sm font-bold flex items-center gap-2 ${activeTab === "tools" ? "border-b-2 border-primary-base text-primary-base" : "text-lightFg-secondary"}`}>
            <PocketKnife size={16} /> Ferramentas
          </button>
        </div>

        <div className="flex-grow overflow-hidden">{activeTab === "agents" ? renderAgentContent() : renderToolContent()}</div>
      </div>
    </div>
  )
}

export default AIFactoryManager
