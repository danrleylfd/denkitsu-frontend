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

const getNews = async () => {
  try {
    const response = await api.get(`/news/`)
    return response.data
  } catch (error) {
    console.log("Error on getNews:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getNewsPaginate = async (page) => {
  try {
    const response = await api.get(`/news/pages?page=${page}`)
    return response.data
  } catch (error) {
    console.log("Error on getNewsPaginate:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

export { publishNews, getNews, getNewsPaginate }
