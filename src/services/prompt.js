import api from "./"

export const getPrompts = async () => {
  try {
    const response = await api.get("/prompts")
    return response.data
  } catch (error) {
    console.error("Error fetching prompts:", error)
    throw error
  }
}

export const createPrompt = async (promptData) => {
  try {
    const response = await api.post("/prompts", promptData)
    return response.data
  } catch (error) {
    console.error("Error creating prompt:", error)
    throw error
  }
}

export const updatePrompt = async (promptId, promptData) => {
  try {
    const response = await api.put(`/prompts/${promptId}`, promptData)
    return response.data
  } catch (error) {
    console.error("Error updating prompt:", error)
    throw error
  }
}

export const deletePrompt = async (promptId) => {
  try {
    await api.delete(`/prompts/${promptId}`)
  } catch (error) {
    console.error("Error deleting prompt:", error)
    throw error
  }
}
