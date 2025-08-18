import api from "./"

const getAgents = async () => {
  try {
    const response = await api.get("/agents")
    return response.data
  } catch (error) {
    console.error("Error on getAgents:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const createAgent = async (agentData) => {
  try {
    const response = await api.post("/agents", agentData)
    return response.data
  } catch (error) {
    console.error("Error on createAgent:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const updateAgent = async (agentId, agentData) => {
  try {
    const response = await api.put(`/agents/${agentId}`, agentData)
    return response.data
  } catch (error) {
    console.error(`Error on updateAgent ${agentId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const deleteAgent = async (agentId) => {
  try {
    await api.delete(`/agents/${agentId}`)
  } catch (error) {
    console.error(`Error on deleteAgent ${agentId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

export {
  getAgents,
  createAgent,
  updateAgent,
  deleteAgent,
}
