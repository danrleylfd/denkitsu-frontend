import { useState, useCallback } from "react"
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
  const [currentAgent, setCurrentAgent] = useState(null)
  const [agentFormLoading, setAgentFormLoading] = useState(false)

  const { tools, loadingTools, addTool, editTool, removeTool } = useTools()
  const [currentTool, setCurrentTool] = useState(null)
  const [toolFormLoading, setToolFormLoading] = useState(false)

  const handleSelectAgent = useCallback((agent) => setCurrentAgent(agent), [])
  const handleCreateAgent = useCallback(() => setCurrentAgent({}), [])

  const handleSelectTool = useCallback((tool) => setCurrentTool(tool), [])
  const handleCreateTool = useCallback(() => setCurrentTool({}), [])

  const handleAgentSave = async (agentData) => {
    setAgentFormLoading(true)
    try {
      if (currentAgent._id) {
        const updated = await editAgent(currentAgent._id, agentData)
        setCurrentAgent(updated)
        notifyInfo("Agente atualizado!")
      } else {
        const created = await addAgent(agentData)
        setCurrentAgent(created)
        notifyInfo("Agente criado!")
      }
    } catch (error) {
      notifyError(error.response?.data?.error?.message || "Falha ao salvar agente.")
    } finally {
      setAgentFormLoading(false)
    }
  }

  const handleAgentDelete = async (agent) => {
    if (window.confirm(`Excluir o agente "${agent.name}"?`)) {
      try {
        await removeAgent(agent._id)
        notifyInfo("Agente excluído!")
        if (currentAgent?._id === agent._id) setCurrentAgent(null)
      } catch (error) {
        notifyError(error.response?.data?.error?.message || "Falha ao excluir.")
      }
    }
  }

  const handleToolSave = async (toolData) => {
    setToolFormLoading(true)
    try {
      if (currentTool._id) {
        const updated = await editTool(currentTool._id, toolData)
        setCurrentTool(updated)
        notifyInfo("Ferramenta atualizada!")
      } else {
        const created = await addTool(toolData)
        setCurrentTool(created)
        notifyInfo("Ferramenta criada!")
      }
    } catch (error) {
      notifyError(error.response?.data?.error?.message || "Falha ao salvar.")
    } finally {
      setToolFormLoading(false)
    }
  }

  const handleToolDelete = async (tool) => {
    if (window.confirm(`Excluir a ferramenta "${tool.title || tool.name}"?`)) {
      try {
        await removeTool(tool._id)
        notifyInfo("Ferramenta excluída!")
        if (currentTool?._id === tool._id) setCurrentTool(null)
      } catch (error) {
        notifyError(error.response?.data?.error?.message || "Falha ao excluir.")
      }
    }
  }

  const renderContent = () => {
    if (activeTab === "agents") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-2 h-full">
          <AgentList
            agents={agents.customAgents}
            onSelect={handleSelectAgent}
            onCreate={handleCreateAgent}
            onDelete={handleAgentDelete}
            currentAgentId={currentAgent?._id}
          />
          {currentAgent ? (
            <AgentForm agent={currentAgent} onSave={handleAgentSave} loading={agentFormLoading} />
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center text-center bg-lightBg-secondary dark:bg-darkBg-secondary rounded-lg">
              <p className="text-lightFg-secondary dark:text-darkFg-secondary">Selecione um agente para editar ou crie um novo.</p>
            </div>
          )}
        </div>
      )
    }

    if (activeTab === "tools") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-2 h-full">
          <ToolList tools={tools.customTools} onSelect={handleSelectTool} onCreate={handleCreateTool} onDelete={handleToolDelete} currentToolId={currentTool?._id} />
          {currentTool ? (
            <ToolForm tool={currentTool} onSave={handleToolSave} loading={toolFormLoading} />
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center text-center bg-lightBg-secondary dark:bg-darkBg-secondary rounded-lg">
              <p className="text-lightFg-secondary dark:text-darkFg-secondary">Selecione uma ferramenta para editar ou crie uma nova.</p>
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="relative flex w-full max-w-4xl h-[95vh] flex-col gap-2 rounded-lg bg-lightBg-primary p-2 shadow-2xl dark:bg-darkBg-primary border border-solid border-brand-purple"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-2 border-b border-bLight dark:border-bDark flex-shrink-0">
          <div className="flex items-center gap-2">
            <Factory size={24} className="text-primary-base" />
            <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary">Fábrica</h3>
          </div>
          <Button variant="danger" size="icon" $rounded onClick={toggleFactoryManagerDoor}>
            <X size={16} />
          </Button>
        </div>

        <div className="flex border-b border-bLight dark:border-bDark flex-shrink-0">
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

        <div className="flex-grow overflow-hidden">{loadingAgents || loadingTools ? <Button variant="outline" loading disabled /> : renderContent()}</div>
      </div>
    </div>
  )
}

export default AIFactoryManager
