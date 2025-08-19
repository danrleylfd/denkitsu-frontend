import api from "./"

const sendMessageStream = async (aiKey, aiProvider, model, models, messages, activeTools, mode, onDelta) => {
  const web = aiProvider !== "groq" && aiKey.length > 0 && activeTools.has("web")
  const plugins = web ? [{ id: "web" }] : undefined
  const regularTools = Array.from(activeTools).filter(tool => tool !== "web")
  const fullModel = models.find((item) => item.id === model)
  const use_tools = (aiKey.length > 0 && fullModel?.supports_tools && regularTools.length > 0) ? regularTools : undefined
  const payload = { aiProvider, aiKey: aiKey.length > 0 ? aiKey : undefined, model, messages, plugins, use_tools, stream: true, mode }
  const token = sessionStorage.getItem("@Denkitsu:token")
  const headers = {
    ...api.defaults.headers.common,
    "Content-Type": "application/json",
    authorization: `Bearer ${token}`
  }
  const response = await fetch(`${api.defaults.baseURL}/ai/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const errorData = await response.json()
    const errorToThrow = new Error("Erro na requisição de streaming da API.")
    errorToThrow.response = { data: errorData }
    throw errorToThrow
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
        if (payload === "[DONE]") return
        try {
          const json = JSON.parse(payload)
          const delta = json.choices?.[0]?.delta
          if (delta?.content || delta?.reasoning || delta?.tool_calls) onDelta(delta)
        } catch (error) {
          console.error("Error on sendMessageStream JSON.parse:", error)
        }
      }
    })
  }
}

const sendMessage = async (aiKey, aiProvider, model, models, messages, mode = "Padrão", activeTools = new Set()) => {
  const web = aiProvider !== "groq" && aiKey.length > 0 && activeTools.has("web")
  const plugins = web ? [{ id: "web" }] : undefined
  const regularTools = Array.from(activeTools).filter(tool => tool !== "web")
  const fullModel = models.find((item) => item.id === model)
  const use_tools = (aiKey.length > 0 && fullModel?.supports_tools && regularTools.length > 0) ? regularTools : undefined
  const payload = { aiProvider, aiKey: aiKey.length > 0 ? aiKey : undefined, model, messages: [...messages], plugins, use_tools, mode }
  try {
    return await api.post("/ai/chat/completions", payload)
  } catch (error) {
    console.error(`Error on sendMessage: ${error.response?.data?.error?.message || error.message}`)
    throw error
  }
}

const getPrompt = async () => {
  try {
    const { data } = await api.get("/ai/prompt")
    return data
  } catch (error) {
    console.error("Error on getPrompt:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getModels = async () => {
  try {
    const { data } = await api.get("/ai/models")
    if (!data) throw new Error("Falha ao obter modelos.")
    if (data.error) throw new Error(data.error?.message || "Erro ao consultar modelos.")
    const freeModels = data.models
      .filter((item) => item.id && item.id.includes(":free"))
      .sort((a, b) => a.id.localeCompare(b.id))
    const payModels = data.models
      .filter((item) => item.id && !item.id.includes(":free") && item.aiProvider !== "groq")
      .sort((a, b) => a.id.localeCompare(b.id))
    const groqModels = data.models
      .filter((item) => item.aiProvider === "groq")
      .sort((a, b) => a.id.localeCompare(b.id))
    return { freeModels, payModels, groqModels }
  } catch (error) {
    console.error("Error on getModels:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const generateNews = async (searchTerm, aiProvider) => {
  try {
    const { data } = await api.post("/news/generate", { searchTerm, aiProvider })
    return data
  } catch (error) {
    console.error("Error on generateNews:", error.response?.data?.message || error.message)
    throw error
  }
}

export { sendMessageStream, sendMessage, getModels, getPrompt, generateNews }
