import { useState, useCallback } from "react"
import { useNotification } from "../contexts/NotificationContext"
import { sendMessageStream, sendMessage } from "../services/aiChat"
import { transcribeAudio } from "../services/audio"

const useMessage = (props) => {
  const {
    aiProvider, aiKey, model, stream, activeTools, userPrompt, imageUrls, audioFile, messages,
    freeModels, payModels, groqModels, selectedAgent,
    setUserPrompt, setImageUrls, setAudioFile, setMessages, setSelectedAgent
  } = props

  const { notifyError, notifyWarning, notifyInfo, notifySuccess } = useNotification()
  const [loading, setLoading] = useState(false)
  const [isImproving, setIsImproving] = useState(false)

  const createAssistantMessage = (data) => {
    const res = data?.choices?.[0]?.message
    if (!res) return null
    const allToolCalls = (data.tool_calls || []).map((call, idx) => ({
      index: idx, name: call.function.name, arguments: call.function.arguments
    }))
    return {
      id: Date.now(), role: "assistant", content: res.content || "",
      reasoning: res.reasoning || "", toolCalls: allToolCalls, timestamp: new Date().toISOString()
    }
  }

  const executeSendMessage = useCallback(async (historyToProcess, agentForCall, attempt = 1) => {
    if (attempt > 2) {
      notifyError("Erro de roteamento: Loop de agentes detectado.")
      setLoading(false)
      return
    }

    setLoading(true)
    const apiMessages = historyToProcess.map(({ role, content }) =>
      Array.isArray(content)
        ? { role, content: content.map(item => (item.type === "text" ? { type: "text", text: item.content } : item)) }
        : { role, content }
    )

    try {
      const isRouterPass = agentForCall === "Roteador"
      if (stream && isRouterPass) {
        notifyWarning("Roteador de Agentes não suporta streaming. Usando modo padrão.")
      }

      const shouldUseStream = stream && !isRouterPass

      if (shouldUseStream) {
        // TODO: Implementar lógica de roteamento para streaming
        notifyError("Roteador + Streaming ainda não implementado.")
        setLoading(false)
      } else {
        const { data } = await sendMessage(aiKey, aiProvider, model, [...freeModels, ...payModels, ...groqModels], apiMessages, agentForCall, activeTools)

        if (isRouterPass && data.next_action?.type === "SWITCH_AGENT") {
          console.log("passei aqui 1")
          const newAgent = data.next_action.agent
          console.log("passei aqui 2")
          notifyInfo(`Roteador direcionou para: ${newAgent}`)
          console.log("passei aqui 3")
          setSelectedAgent(newAgent)
          console.log("passei aqui 4")
          await executeSendMessage(historyToProcess, newAgent, attempt + 1)
          console.log("passei aqui 5")
        } else {
          console.log("passei aqui 6")
          const assistantMessage = createAssistantMessage(data)
          console.log("passei aqui 7")
          if (assistantMessage) {
            console.log("passei aqui 8")
            setMessages([...historyToProcess, assistantMessage])
            console.log("passei aqui 9")
          }
          setLoading(false)
          console.log("passei aqui 10")
        }
      }
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Falha na comunicação com o servidor de IA.")
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        // Remove a mensagem do usuário que falhou, apenas se ela foi a última a ser adicionada
        if (lastMessage && lastMessage.role === 'user' && lastMessage.timestamp === historyToProcess[historyToProcess.length-1].timestamp){
          return prev.slice(0, -1)
        }
        return prev
      })
      setLoading(false)
    }
  }, [
    aiKey, aiProvider, model, freeModels, payModels, groqModels, activeTools, stream, messages,
    notifyError, notifyInfo, notifyWarning, setMessages, setSelectedAgent
  ])

  const onSendMessage = useCallback(async () => {
    if (loading || isImproving) return
    const promptText = userPrompt.trim()
    if (!promptText && imageUrls.length === 0) return

    const content = []
    if (promptText) content.push({ type: "text", content: promptText })
    if (imageUrls.length > 0) content.push(...imageUrls.map(url => ({ type: "image_url", image_url: { url } })))

    const newMessage = { role: "user", content, timestamp: new Date().toISOString() }
    const history = [...messages, newMessage]

    setMessages(history)
    setUserPrompt("")
    setImageUrls([])
    setAudioFile(null)

    await executeSendMessage(history, selectedAgent)
  }, [loading, isImproving, userPrompt, imageUrls, messages, selectedAgent, executeSendMessage, setMessages, setUserPrompt, setImageUrls, setAudioFile])

  const handleSendAudioMessage = useCallback(async () => {
    if (!audioFile) return
    setLoading(true)
    const userMessagePlaceholder = { role: "user", content: `[Áudio: ${audioFile.name || "Gravação"}]`, timestamp: new Date().toISOString() }
    const historyWithPlaceholder = [...messages, userMessagePlaceholder]
    setMessages(historyWithPlaceholder)
    setAudioFile(null)
    try {
      const transcription = await transcribeAudio(audioFile)
      const transcriptionUserMessage = { role: "user", content: `[Áudio: ${audioFile.name || "Gravação"}]\nTranscrição de Áudio:\n${transcription}`, timestamp: userMessagePlaceholder.timestamp }
      const historyWithTranscription = [...messages, transcriptionUserMessage]
      setMessages(historyWithTranscription)
      await executeSendMessage(historyWithTranscription, selectedAgent)
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Falha ao transcrever o áudio.")
      setMessages(prev => prev.filter(m => m.timestamp !== userMessagePlaceholder.timestamp))
      setLoading(false)
    }
  }, [audioFile, messages, executeSendMessage, setAudioFile, setMessages, notifyError, selectedAgent])

  const handleRegenerateResponse = useCallback(async () => {
    if (loading || isImproving) return
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role !== "assistant") {
      notifyWarning("Apenas a última resposta da IA pode ser regenerada.")
      return
    }
    const historyWithoutLastResponse = messages.slice(0, -1)
    setMessages(historyWithoutLastResponse)
    await executeSendMessage(historyWithoutLastResponse, selectedAgent)
  }, [loading, isImproving, messages, executeSendMessage, notifyWarning, setMessages, selectedAgent])

  const improvePrompt = useCallback(async () => {
    if (!userPrompt.trim() || isImproving || loading) return
    setIsImproving(true)
    notifyInfo("Aperfeiçoando seu prompt...")
    const systemMessage = { role: "system", content: `Sempre responda em ${navigator.language}` }
    const userMessage = { role: "user", content: userPrompt }
    try {
      const response = await sendMessage(
        aiKey, aiProvider, model,
        [...freeModels, ...payModels, ...groqModels],
        [systemMessage, userMessage], "Prompter", new Set()
      )
      const improvedPrompt = response.data?.choices?.[0]?.message?.content
      if (improvedPrompt) {
        setUserPrompt(improvedPrompt)
        notifySuccess("Prompt Aperfeiçoado!")
      } else notifyError("Não foi possível aperfeiçoar o prompt.")
    } catch (error) {
      console.error("Error improving prompt:", error)
      if (error.response && error.response.data.error) notifyError(error.response.data.error.message)
      else notifyError("Falha ao aperfeiçoar o prompt.")
    } finally {
      setIsImproving(false)
    }
  }, [userPrompt, isImproving, loading, aiKey, aiProvider, model, freeModels, payModels, groqModels, setUserPrompt, notifyInfo, notifySuccess, notifyError])

  return { loading, isImproving, onSendMessage, handleRegenerateResponse, improvePrompt, handleSendAudioMessage }
}

export default useMessage
