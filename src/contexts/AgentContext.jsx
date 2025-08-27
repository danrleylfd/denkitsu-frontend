import { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react"

import { useAuth } from "./AuthContext"

import { getAgents, createAgent, updateAgent, deleteAgent } from "../services/agent"
import { listAgents } from "../services/aiChat"

const AgentContext = createContext({})

const AgentProvider = ({ children }) => {
  const [agents, setAgents] = useState({ backendAgents: [], customAgents: [] })
  const [loadingAgents, setLoadingAgents] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState("Roteador")
  const { signed } = useAuth()

  const fetchAgents = useCallback(async () => {
    try {
      setLoadingAgents(true)
      const { data: backendData } = await listAgents()
      let customData = []
      if (signed) customData = await getAgents()
      setAgents({
        backendAgents: backendData?.backendAgents || [],
        customAgents: customData || []
      })
    } catch (error) {
      console.error("Failed to fetch agents:", error)
      setAgents({ backendAgents: [], customAgents: [] })
    } finally {
      setLoadingAgents(false)
    }
  }, [signed])

  useEffect(() => {
    if (signed) fetchAgents()
  }, [signed, fetchAgents])

  const addAgent = async (agentData) => {
    const newAgent = await createAgent(agentData)
    setAgents(prev => ({ ...prev, customAgents: [newAgent, ...prev.customAgents] }))
    return newAgent
  }

  const editAgent = async (agentId, agentData) => {
    const updatedAgent = await updateAgent(agentId, agentData)
    setAgents(prev => ({ ...prev, customAgents: prev.customAgents.map(a => a._id === agentId ? updatedAgent : a) }))
    return updatedAgent
  }

  const removeAgent = async (agentId) => {
    await deleteAgent(agentId)
    setAgents(prev => ({ ...prev, customAgents: prev.customAgents.filter(a => a._id !== agentId) }))
  }

  const value = useMemo(() => ({
    agents, loadingAgents, fetchAgents, addAgent, editAgent, removeAgent,
    selectedAgent, setSelectedAgent
  }), [agents, loadingAgents, fetchAgents, addAgent, editAgent, removeAgent, selectedAgent])


  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  )
}

const useAgents = () => {
  const context = useContext(AgentContext)
  if (!context) {
    throw new Error("useAgents must be used within an AgentProvider")
  }
  return context
}

export { useAgents }
export default AgentProvider
