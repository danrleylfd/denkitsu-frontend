import api from "./"

const publishNews = async (content, source) => {
  const response = await api.post("/news", { content, source })
  return response.data
}

const getNews = async () => {
  const response = await api.get(`/news/`)
  return response.data
}

const getNewsPaginate = async (page) => {
  const response = await api.get(`/news/pages?page=${page}`)
  return response.data
}

export { publishNews, getNews, getNewsPaginate }
