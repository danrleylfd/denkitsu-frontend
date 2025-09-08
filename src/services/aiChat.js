// Arquivo: Frontend/src/services/aiChat.js

import api from "./"
import { storage } from "../utils/storage"

// MODIFICADO: Lógica de stream completamente refeita para consumir SSE
async function* sendMessageStream(aiKey, aiProvider, model, models, messages, activeTools, mode, customProviderUrl) {
  const payload = {
    aiProvider,
    aiKey: aiKey.length > 0 ? aiKey : undefined,
    model,
    messages,
    use_tools: Array.from(activeTools),
    stream: true,
    mode,
    customApiUrl: aiProvider === "custom" ? customProviderUrl : undefined
  }
  const token = await storage.session.getItem("@Denkitsu:token")

  try {
    const response = await fetch(`${api.defaults.baseURL}/ai/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok || !response.body) {
      const errorData = await response.json()
      throw { response: { data: errorData } }
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder("utf-8")
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      let boundary = buffer.indexOf("\n\n")

      while (boundary !== -1) {
        const chunkString = buffer.substring(0, boundary).replace(/^data: /, "")
        buffer = buffer.substring(boundary + 2)

        try {
          const data = JSON.parse(chunkString)
          yield data // Emite o evento completo (seja DELTA, ERROR, etc.)
        } catch (error) {
          // Ignora chunks malformados, pode acontecer no final do stream
          // console.warn("Could not parse stream chunk:", chunkString)
        }
        boundary = buffer.indexOf("\n\n")
      }
    }
  } catch (err) {
    console.error("Error in sendMessageStream service:", err)
    yield { type: "ERROR", error: err }
  }
}

// MANTIDO: Sem grandes alterações, mas agora se beneficia do backend unificado
const sendMessage = async (aiKey, aiProvider, model, models, messages, mode = "Padrão", activeTools = new Set(), customProviderUrl) => {
  const payload = {
    aiProvider,
    aiKey: aiKey.length > 0 ? aiKey : undefined,
    model,
    messages: [...messages],
    use_tools: Array.from(activeTools),
    stream: false,
    mode,
    customApiUrl: aiProvider === "custom" ? customProviderUrl : undefined
  }
  try {
    return await api.post("/ai/chat/completions", payload)
  } catch (error) {
    console.error(`Error on sendMessage: ${error.response?.data?.error?.message || error.message}`)
    throw error
  }
}


// ... resto do arquivo (getModels, listAgents, etc.) sem alterações ...
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

const getModels = async (aiProvider, customApiUrl, customApiKey) => {
  try {
    const params = new URLSearchParams()
    if (aiProvider) params.append("aiProvider", aiProvider)
    if (customApiUrl) params.append("customApiUrl", customApiUrl)
    if (customApiKey) params.append("customApiKey", customApiKey)
    const { data } = await api.get(`/ai/models?${params.toString()}`)
    if (!data) throw new Error("Falha ao obter modelos.")
    if (data.error) throw new Error(data.error?.message || "Erro ao consultar modelos.")
    return data.models
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

export { sendMessageStream, sendMessage, getModels, listAgents, listTools, generateNews }
