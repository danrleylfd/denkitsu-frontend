import api from "./"

async function* sendMessageStream(aiKey, aiProvider, model, models, messages, activeTools, mode) {
  const payload = { aiProvider, aiKey: aiKey.length > 0 ? aiKey : undefined, model, messages, use_tools: Array.from(activeTools), stream: true, mode }
  const token = sessionStorage.getItem("@Denkitsu:token")
  try {
    const response = await fetch(`${api.defaults.baseURL}/ai/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw { response: { data: errorData } }
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder("utf-8")
    let buffer = ""
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value)
      let boundary = buffer.indexOf("\n\n")
      while (boundary !== -1) {
        const chunk = buffer.substring(0, boundary)
        buffer = buffer.substring(boundary + 2)
        if (chunk.startsWith("event: SWITCH_AGENT")) {
          const dataLine = chunk.split("\n").find(line => line.startsWith("data: "))
          if (dataLine) {
            const data = JSON.parse(dataLine.substring(6))
            yield { type: "SWITCH_AGENT", agent: data.agent } // Entrega o evento de troca
          }
        } else if (chunk.startsWith("data: ")) {
          const data = chunk.substring(6)
          if (data !== "[DONE]") {
            try {
              const json = JSON.parse(data)
              const delta = json.choices?.[0]?.delta
              if (delta) yield { type: "DELTA", delta }
            } catch (error) {
              console.error("Error parsing stream data chunk:", error)
            }
          }
        }
        boundary = buffer.indexOf("\n\n")
      }
    }
  } catch (err) {
    console.error("Error in sendMessageStream service:", err)
    yield { type: "ERROR", error: err }
  }
}

const sendMessage = async (aiKey, aiProvider, model, models, messages, mode = "Padrão", activeTools = new Set()) => {
  const finalPlugins = []
  if (activeTools.has("web")) finalPlugins.push({ id: "web" })
  const regularTools = Array.from(activeTools).filter(tool => tool !== "web")
  const fullModel = models.find((item) => item.id === model)
  const use_tools = (fullModel?.supports_tools && regularTools.length > 0) ? regularTools : undefined
  const payload = { aiProvider, aiKey: aiKey.length > 0 ? aiKey : undefined, model, messages: [...messages], plugins: finalPlugins.length > 0 ? finalPlugins : undefined, use_tools, mode }
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

const listAgents = async () => {
  try {
    return await api.get("/ai/agents")
  } catch (error) {
    console.error("Error on getAgentDefinitions:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

const listTools = async () => {
  try {
    return await api.get("/ai/tools")
  } catch (error) {
    console.error("Error on getToolDefinitions:", error.response?.data?.error?.message || error.message)
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

export { sendMessageStream, sendMessage, getPrompt, getModels, listAgents, listTools, generateNews }
