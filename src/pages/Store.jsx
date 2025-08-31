import { useState, useEffect, useCallback } from "react"
import { Store as StoreIcon } from "lucide-react"

import { useAuth } from "../contexts/AuthContext"
import { useNotification } from "../contexts/NotificationContext"
import { useAgents } from "../contexts/AgentContext"
import { useTools } from "../contexts/ToolContext"
import { getPublishedAgents, acquireAgent, unacquireAgent } from "../services/agent"
import { getPublishedTools, acquireTool, unacquireTool } from "../services/tool"

import SideMenu from "../components/SideMenu"
import Button from "../components/Button"
import StoreItemCard from "../components/Store/ItemCard"
import StoreBar from "../components/Store/Bar"

const ContentView = ({ children }) => <main className="flex flex-col flex-1 h-dvh mx-auto">{children}</main>

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
    if (loading) return <div className="flex-1 flex items-center justify-center"><Button variant="outline" $rounded loading disabled /></div>

    const items = activeTab === "agents" ? storeAgents : storeTools
    const type = activeTab === "agents" ? "agent" : "tool"

    if (items.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <StoreIcon size={64} className="mx-auto text-lightFg-tertiary dark:text-darkFg-tertiary" />
          <p className="mt-4 text-lightFg-secondary dark:text-darkFg-secondary">
            Nenhum(a) {activeTab === "agents" ? "agente" : "ferramenta"} disponível na loja no momento.
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
    <SideMenu ContentView={ContentView} className="bg-brand-purple bg-cover bg-center">
      <div className="flex flex-col h-full w-full gap-2">
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
        <StoreBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </SideMenu>
  )
}

export default Store
