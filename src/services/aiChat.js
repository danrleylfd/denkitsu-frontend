import axios from "axios"
import api from "./"

const sendMessageStream = async (aiKey, aiProvider, model, messages, web, onDelta) => {
  const permission = aiProvider === "groq" ? false : web
  const plugins = permission ? [{ id: "web" }] : undefined
  const payload = {
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
    const errorData = await response.json()
    if (errorData.error.code === 401) throw new Error(JSON.stringify({ code: errorData.error.code, message: "Chave de API inválida. Verifique suas credenciais." }))
    if (errorData.error.code === 429) throw new Error(JSON.stringify({ code: errorData.error.code, message: "Limite de requisições excedido. Tente novamente mais tarde." }))
    if (errorData.error.code === 502) throw new Error(JSON.stringify({ code: errorData.error.code, message: "Falha na comunicação com o serviço de IA. Tente novamente." }))
    throw new Error(JSON.stringify({ code: errorData.error.code || "UNKNOWN_ERROR", message: errorData.error.message || "Falha ao conectar com o serviço. Tente novamente." }))
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

const sendMessage = async (aiKey, aiProvider, model, messages, web, newsTool, weatherTool) => {
  const permission = aiProvider === "groq" ? false : web
  const plugins = permission ? [{ id: "web" }] : undefined
  const use_tools = newsTool && weatherTool ? ["searchNews", "getWeather"] : newsTool ? ["searchNews"] : weatherTool ? ["getWeather"] : undefined
  const payload = {
    aiKey,
    aiProvider,
    model,
    plugins,
    use_tools,
    messages: [...messages]
  }
  try {
    const { data } = await api.post("/ai/chat/completions", payload)
    return data
  } catch (error) {
    const errorData = error.response?.data || { code: "UNKNOWN_ERROR", message: "Falha ao conectar com o serviço. Tente novamente." }
    throw new Error(JSON.stringify(errorData))
  }
}

const getPrompt = async () => {
  try {
    const { data } = await api.get("/ai/prompt")
    return data
  } catch (error) {
    console.error(error.response?.data?.message || error.message)
    throw new Error(error.response?.data?.message || "Falha ao obter prompts.")
  }
}

const getModels = async () => {
  try {
    const { data } = await api.get("/ai/models")
    if (!data) throw new Error("Falha ao obter modelos.")
    if (data.error) throw new Error(data.error?.message || "Erro ao consultar modelos.")
    const freeModels = data.models
      .filter((item) => item.id && item.id.includes(":free"))
      .map((item) => ({ id: item.id, aiProvider: item.aiProvider }))
      .sort((a, b) => a.id.localeCompare(b.id))
    const payModels = data.models
      .filter((item) => item.id && !item.id.includes(":free") && item.aiProvider !== "groq")
      .map((item) => ({ id: item.id, aiProvider: item.aiProvider }))
      .sort((a, b) => a.id.localeCompare(b.id))
    const groqModels = data.models.filter((item) => item.aiProvider === "groq")
    return { freeModels, payModels, groqModels }
  } catch (error) {
    console.error(error.message)
    throw new Error(error.message || "Falha ao obter modelos.")
  }
}

const generateNews = async (searchTerm, aiProvider) => {
  try {
    const { data } = await api.post("/news/generate", { searchTerm, aiProvider })
    return data
  } catch (error) {
    console.error(error.response?.data?.message || error.message)
    throw new Error(error.response?.data?.message || "Falha ao gerar notícias.")
  }
}

export { sendMessageStream, sendMessage, getModels, getPrompt, generateNews }
