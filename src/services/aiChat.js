import axios from "axios"
import api from "./"

const sendMessage = async (model, messages, aiKey = undefined) => {
  try {
    const sysMsg = [{ role: "system", content: `Deve sempre pensar e responder em ${window.language || navigator.language}.` }]
    const payload = {
      model: model || "deepseek/deepseek-r1:free",
      messages: [...sysMsg, ...messages],
      aiKey
    }
    const { data } = await api.post("/chat/completions", payload)
    if (!data) throw new Error("Falha ao obter resposta da API")
    return data
  } catch (error) {
    console.error(error.response?.data?.error?.message || error.message)
  }
}

const getModels = async () => {
  try {
    const { data } = await axios.get("https://openrouter.ai/api/v1/models")
    if (!data) throw new Error("Falha ao obter resposta da API")
    const freeModels = data.data
      .filter(item => item.id && item.id.includes(":free"))
      .map((item, index) => {
        if (!item.id || !item.name) {
          console.error(`Erro no item ${index}: id ou name ausente`, item)
          return null
        }
        return { id: item.id, name: item.name }
      })
      .filter(item => item !== null)
      .sort((a, b) => a.id.localeCompare(b.id))
    const payModels = data.data
      .filter(item => item.id && !item.id.includes(":free"))
      .map((item, index) => {
        if (!item.id || !item.name) {
          console.error(`Erro no item ${index}: id ou name ausente`, item)
          return null
        }
        return { id: item.id, name: item.name }
      })
      .filter(item => item !== null)
      .sort((a, b) => a.id.localeCompare(b.id))
    return { freeModels, payModels }
  } catch (error) {
    console.error(error.response?.data?.error?.message || error.message)
  }
}

export { sendMessage, getModels }
