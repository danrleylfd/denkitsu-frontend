import api from "./"

const getTools = async () => {
  try {
    const response = await api.get("/tools")
    return response.data
  } catch (error) {
    console.error("Error on getTools:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const createTool = async (toolData) => {
  try {
    const response = await api.post("/tools", toolData)
    return response.data
  } catch (error) {
    console.error("Error on createTool:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const updateTool = async (toolId, toolData) => {
  try {
    const response = await api.put(`/tools/${toolId}`, toolData)
    return response.data
  } catch (error) {
    console.error(`Error on updateTool ${toolId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const deleteTool = async (toolId) => {
  try {
    await api.delete(`/tools/${toolId}`)
  } catch (error) {
    console.error(`Error on deleteTool ${toolId}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

export {
  getTools,
  createTool,
  updateTool,
  deleteTool,
}
