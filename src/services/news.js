import api from "./"

const getNews = async () => {
  const response = await api.get(`/news/`)
  return response.data
}

const getNewsPaginate = async (page) => {
  const response = await api.get(`/news/pages?page=${page}`)
  return response.data
}

export { getNews, getNewsPaginate }
