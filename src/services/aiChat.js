import api from "./"

const sendMessageStream = async (aiKey, aiProvider, model, messages, web, mode, onDelta) => {
  const permission = aiProvider === "groq" ? false : web
  const plugins = permission ? [{ id: "web" }] : undefined
  const payload = {
    aiProvider,
    aiKey,
    model,
    messages,
    plugins,
    stream: true,
    mode
  }

  const response = await fetch(`${api.defaults.baseURL}/ai/chat/completions`, {
    method: "POST",
    headers: {
      ...api.defaults.headers.common,
      "Content-Type": "application/json",
    },
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

const sendMessage = async (aiKey, aiProvider, model, models, messages, mode = "Padrão", web = false, tools = {}) => {
  const permission = aiProvider === "groq" ? false : web
  const plugins = permission ? [{ id: "web" }] : undefined
  const fullModel = models.find((item) => item.id === model)
  const activeTools = Object.keys(tools).filter((key) => tools[key] === true)
  const use_tools = (fullModel?.supports_tools && activeTools.length > 0) ? activeTools : undefined
  const payload = { aiKey, aiProvider, model, plugins, use_tools, messages: [...messages], mode }
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
