import { useState, useEffect, useCallback } from "react"
import { Store as StoreIcon, Bot, PocketKnife } from "lucide-react"

import { useAuth } from "../contexts/AuthContext"
import { useNotification } from "../contexts/NotificationContext"
import { useAgents } from "../contexts/AgentContext"
import { useTools } from "../contexts/ToolContext"
import { getPublishedAgents, acquireAgent, unacquireAgent } from "../services/agent"
import { getPublishedTools, acquireTool, unacquireTool } from "../services/tool"

import SideMenu from "../components/SideMenu"
import Button from "../components/Button"
import StoreItemCard from "../components/Store/ItemCard"

const ContentView = ({ children }) => (
  <main className="flex flex-col p-2 gap-2 mx-auto min-h-dvh w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[85%] ml-[3.5rem] md:ml-auto">
    {children}
  </main>
)

const Store = () => {
  const { user } = useAuth()
  const { notifySuccess, notifyError } = useNotification()
  const { fetchAgents } = useAgents()
  const { fetchTools } = useTools()
  const [activeTab, setActiveTab] = useState("agents")
  const [storeAgents, setStoreAgents] = useState([])
  const [storeTools, setStoreTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [acquireLoading, setAcquireLoading] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [agentsData, toolsData] = await Promise.all([
        getPublishedAgents(),
        getPublishedTools()
      ])
      setStoreAgents(agentsData || [])
      setStoreTools(toolsData || [])
    } catch (error) {
      notifyError("Falha ao carregar a loja. Tente novamente mais tarde.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAcquire = async (id, type) => {
    setAcquireLoading(id)
    try {
      if (type === "agent") {
        await acquireAgent(id)
        setStoreAgents(prev => prev.map(agent =>
          agent._id === id ? { ...agent, isAcquired: true } : agent
        ))
        notifySuccess("Agente adicionado com sucesso!")
        await fetchAgents()
      } else {
        await acquireTool(id)
        setStoreTools(prev => prev.map(tool =>
          tool._id === id ? { ...tool, isAcquired: true } : tool
        ))
        notifySuccess("Ferramenta adicionada com sucesso!")
        await fetchTools()
      }
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Falha ao adicionar o item.")
    } finally {
      setAcquireLoading(null)
    }
  }

  const handleUnacquire = async (id, type) => {
    setAcquireLoading(id)
    try {
      if (type === "agent") {
        await unacquireAgent(id)
        setStoreAgents(prev => prev.map(agent =>
          agent._id === id ? { ...agent, isAcquired: false } : agent
        ))
        notifySuccess("Agente removido com sucesso!")
        await fetchAgents()
      } else {
        await unacquireTool(id)
        setStoreTools(prev => prev.map(tool =>
          tool._id === id ? { ...tool, isAcquired: false } : tool
        ))
        notifySuccess("Ferramenta removida com sucesso!")
        await fetchTools()
      }
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Falha ao remover o item.")
    } finally {
      setAcquireLoading(null)
    }
  }

  const renderContent = () => {
    if (loading) return <Button variant="outline" $rounded loading disabled />

    const items = activeTab === "agents" ? storeAgents : storeTools
    const type = activeTab === "agents" ? "agent" : "tool"

    if (items.length === 0) {
      return (
        <div className="text-center py-20">
          <StoreIcon size={64} className="mx-auto text-lightFg-tertiary dark:text-darkFg-tertiary" />
          <p className="mt-4 text-lightFg-secondary dark:text-darkFg-secondary">
            Nenhum {activeTab === "agents" ? "agente" : "ferramenta"} disponível na loja no momento.
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map(item => (
          <StoreItemCard
            key={item._id}
            item={item}
            user={user}
            onAcquire={() => handleAcquire(item._id, type)}
            onUnacquire={() => handleUnacquire(item._id, type)}
            isAcquired={item.isAcquired}
            loading={acquireLoading === item._id}
          />
        ))}
      </div>
    )
  }

  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold text-lightFg-primary dark:text-darkFg-primary flex items-center gap-3">
            <StoreIcon size={32} />
            Loja da Comunidade
          </h1>
          <div className="flex items-center gap-2 p-1 bg-lightBg-secondary dark:bg-darkBg-secondary rounded-full">
            <Button
              variant={activeTab === "agents" ? "primary" : "secondary"}
              $rounded
              onClick={() => setActiveTab("agents")}
            >
              <Bot size={16} className="mr-2" /> Agentes
            </Button>
            <Button
              variant={activeTab === "tools" ? "primary" : "secondary"}
              $rounded
              onClick={() => setActiveTab("tools")}
            >
              <PocketKnife size={16} className="mr-2" /> Ferramentas
            </Button>
          </div>
        </div>
        {renderContent()}
      </div>
    </SideMenu>
  )
}

export default Store
