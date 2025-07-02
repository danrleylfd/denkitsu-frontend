import axios from "axios"
import api from "./"

const sendMessageStream = async (aiKey, aiProvider, model, messages, web, onDelta) => {
  const permission = aiProvider === "groq" ? false : web
  const plugins = permission ? [{ id: "web" }] : undefined
  const payload = {
    // aiKey,
    model,
    messages,
    plugins,
    stream: true
  }
  const apiURL = aiProvider === "groq" ? "https://api.groq.com/openai/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions"
  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(aiKey && { Authorization: `Bearer ${aiKey}` })
    },
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error)
  }
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
        if (payload === "[DONE]") {
          return
        }
        const json = JSON.parse(payload)
        const delta = json.choices?.[0]?.delta
        if (delta?.content || delta?.reasoning || delta?.tool_calls) {
          onDelta(delta)
        }
      }
    })
  }
}

const sendMessage = async (aiKey, aiProvider, model, messages, web) => {
  const permission = aiProvider === "groq" ? false : web
  const plugins = permission ? [{ id: "web" }] : undefined
  const payload = {
    aiKey,
    aiProvider,
    model,
    plugins,
    messages: [...messages]
  }
  return await api.post("/ai/chat/completions", payload)
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
    const freeModels = data.models
      .filter((item) => item.id && item.id.includes(":free"))
      .map((item, index) => {
        if (!item.id) {
          console.error(`Erro no item ${index}: id ou name ausente`, item)
          return null
        }
        return { id: item.id, aiProvider: item.aiProvider }
      })
      .filter((item) => item !== null)
      .sort((a, b) => a.id.localeCompare(b.id))
    const payModels = data.models
      .filter((item) => item.id && !item.id.includes(":free") && item.aiProvider !== "groq")
      .map((item, index) => {
        if (!item.id) {
          console.error(`Erro no item ${index}: id ou name ausente`, item)
          return null
        }
        return { id: item.id, aiProvider: item.aiProvider }
      })
      .filter((item) => item !== null)
      .sort((a, b) => a.id.localeCompare(b.id))
    const groqModels = data.models.filter((item) => item.aiProvider === "groq")
    return { freeModels, payModels, groqModels }
  } catch (error) {
    console.error(error.response?.data?.error?.message || error.message)
  }
}

const generateNews = async (searchTerm, aiProvider) => {
  const { data } = await api.post("/news/generate", { searchTerm, aiProvider: aiProvider })
  return data
}

export { sendMessageStream, sendMessage, getModels, getPrompt, generateNews }
