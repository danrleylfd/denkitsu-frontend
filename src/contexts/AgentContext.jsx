import { createContext, useState, useEffect, useContext, useCallback } from "react"
import { useAuth } from "./AuthContext"
import { getAgents, createAgent, updateAgent, deleteAgent } from "../services/agent"

const AgentContext = createContext({})

const AgentProvider = ({ children }) => {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const { signed } = useAuth()

  const fetchAgents = useCallback(async () => {
    if (!signed) {
      setAgents([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const userAgents = await getAgents()
      setAgents(userAgents || [])
    } catch (error) {
      console.error("Failed to fetch user agents:", error)
      setAgents([])
    } finally {
      setLoading(false)
    }
  }, [signed])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const addAgent = async (agentData) => {
    const newAgent = await createAgent(agentData)
    setAgents(prev => [newAgent, ...prev])
    return newAgent
  }

  const editAgent = async (agentId, agentData) => {
    const updatedAgent = await updateAgent(agentId, agentData)
    setAgents(prev => prev.map(a => a._id === agentId ? updatedAgent : a))
    return updatedAgent
  }

  const removeAgent = async (agentId) => {
    await deleteAgent(agentId)
    setAgents(prev => prev.filter(a => a._id !== agentId))
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
