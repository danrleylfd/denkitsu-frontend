import axios from "axios"
import api from "./"

const sendMessageStream = async (aiKey, model, messages, onDelta) => {
  try {
    const payload = {
      aiKey,
      model,
      messages,
      stream: true
    }
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(aiKey && { Authorization: `Bearer ${aiKey}` })
      },
      body: JSON.stringify(payload)
    })
    if (!response.ok) throw new Error("Falha ao obter resposta da API")
    const reader = response.body.getReader()
    const decoder = new TextDecoder("utf-8")
    let done = false
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunk = decoder.decode(value)
      chunk.split("\n").forEach((line) => {
        if (line.startsWith("data: ")) {
          const payload = line.replace("data: ", "")
          if (payload === "[DONE]") return
          try {
            const json = JSON.parse(payload)
            const delta = json.choices?.[0]?.delta
            if (delta?.content || delta?.reasoning || delta?.tool_calls) {
              onDelta(delta)
            }
          } catch (err) {
            console.error("Erro ao parsear chunk:", err)
          }
        }
      })
    }
  } catch (error) {
    console.error(error.message)
  }
}

const sendMessage = async (aiKey, model, messages) => {
  try {
    const sysMsg = [{ role: "system", content: `Deve sempre pensar e responder em ${window.language || navigator.language}.` }]
    const payload = {
      aiKey,
      model,
      messages: [...sysMsg, ...messages],
    }
    const { data } = await api.post("/ai/chat/completions", payload)
    if (!data) throw new Error("Falha ao obter resposta da API")
    return data
  } catch (error) {
    console.error(error.response?.data?.error?.message || error.message)
  }
}

const getPrompt = async () => {
  try {
    const { data } = await api.get("/ai/prompt")
    return data
  } catch (error) {
    console.error(error.message)
  }
}

const getModels = async () => {
  try {
    // const { data } = await axios.get("https://openrouter.ai/api/v1/models")
    const { data } = await api.get("/ai/models")
    if (!data) throw new Error("Falha ao obter resposta da API")
    if (data.error) throw new Error(data.error?.message)
    const freeModels = data.data
      .filter((item) => item.id && item.id.includes(":free"))
      .map((item, index) => {
        if (!item.id) {
          console.error(`Erro no item ${index}: id ou name ausente`, item)
          return null
        }
        return { id: item.id }
      })
      .filter((item) => item !== null)
      .sort((a, b) => a.id.localeCompare(b.id))
    const payModels = data.data
      .filter((item) => item.id && !item.id.includes(":free"))
      .map((item, index) => {
        if (!item.id) {
          console.error(`Erro no item ${index}: id ou name ausente`, item)
          return null
        }
        return { id: item.id }
      })
      .filter((item) => item !== null)
      .sort((a, b) => a.id.localeCompare(b.id))
    return { freeModels, payModels }
  } catch (error) {
    console.error(error.response?.data?.error?.message || error.message)
  }
}

const generateNews = async (searchTerm) => {
  const { data } = await api.post("/news/generate", { searchTerm })
  return data
}

export { sendMessageStream, sendMessage, getModels, getPrompt, generateNews }
