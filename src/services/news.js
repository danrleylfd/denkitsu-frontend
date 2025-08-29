import api from "./"

const publishNews = async (content, source) => {
  try {
    const response = await api.post("/news", { content, source })
    return response.data
  } catch (error) {
    console.log("Error on publishNews:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getAllNews = async () => {
  try {
    const response = await api.get(`/news/`)
    return response.data
  } catch (error) {
    console.log("Error on getNews:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getNewsByPage = async (page) => {
  try {
    const response = await api.get(`/news/pages?page=${page}`)
    return response.data
  } catch (error) {
    console.log("Error on getNewsPaginate:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getNewsByCursor = async (cursor = null, limit = 10) => {
  try {
    const params = new URLSearchParams({ limit })
    if (cursor) params.append("cursor", cursor)
    const response = await api.get(`/news/cursor?${params.toString()}`)
    return response.data
  } catch (error) {
    console.log("Error on getNewsByCursor:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

export { publishNews, getAllNews, getNewsByPage, getNewsByCursor }
