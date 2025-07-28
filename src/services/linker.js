import api from "."

const createLinker = async (label, link) => {
  try {
    const response = await api.post("/linkers", { label, link })
    return response.data
  } catch (error) {
    console.error("Error on createLinker:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getLinkersByUser = async () => {
  try {
    const response = await api.get("/linkers")
    return response.data
  } catch (error) {
    console.error("Error on getLinkersByUser:", error.response?.data?.error?.message || error.message)
    if (error.response?.status === 404) {
      return []
    }
    throw error
  }
}

const updateLinker = async (oldLabel, newLabel, newLink) => {
  try {
    const response = await api.put(`/linkers/${oldLabel}`, { newLabel, newLink })
    return response.data
  } catch (error) {
    console.error(`Error on updateLinker ${oldLabel}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const deleteLinker = async (label) => {
  try {
    await api.delete(`/linkers/${label}`)
  } catch (error) {
    console.error(`Error on deleteLinker ${label}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getLinkByLabel = async (label) => {
  try {
    const response = await api.get(`/access/${label}`)
    return response.data
  } catch (error) {
    console.error(`Error on getLinkByLabel ${label}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

export {
  createLinker,
  getLinkersByUser,
  updateLinker,
  deleteLinker,
  getLinkByLabel
}
