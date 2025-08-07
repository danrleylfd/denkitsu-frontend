import api from "."

const searchMedia = async (query) => {
  try {
    const response = await api.get("/media/search", { params: { query } })
    return response.data
  } catch (error) {
    console.error("Error on searchMedia:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getMediaDetails = async (type, id) => {
  try {
    const response = await api.get(`/media/details/${type}/${id}`)
    return response.data
  } catch (error) {
    console.error("Error on getMediaDetails:", error.response?.data?.error?.message || error.message)
    throw error
  }
}


export { searchMedia, getMediaDetails }
