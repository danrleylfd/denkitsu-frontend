import { createContext, useState, useEffect, useContext, useCallback } from "react"
import { useAuth } from "./AuthContext"
import { getAgents } from "../services/agent"
import { listAgents } from "../services/aiChat"

const AgentContext = createContext({})

const AgentProvider = ({ children }) => {
  const [agents, setAgents] = useState({ backendAgents: [], customAgents: [] })
  const [loading, setLoading] = useState(true)
  const { signed } = useAuth()

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true)
      const { data: backendData } = await listAgents()
      let customData = []
      if (signed) {
        customData = await getAgents()
      }
      setAgents({
        backendAgents: backendData?.backendAgents || [],
        customAgents: customData || []
      })
    } catch (error) {
      console.error("Failed to fetch agents:", error)
      setAgents({ backendAgents: [], customAgents: [] })
    } finally {
      setLoading(false)
    }
  }, [signed])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

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

  const value = { agents, loading, fetchAgents, addAgent, editAgent, removeAgent }

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
