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
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [isImproving, setIsImproving] = useState(false)

  const createAssistantMessage = (data, routingInfo = null) => {
    const res = data?.choices?.[0]?.message
    if (!res) return null
    const allToolCalls = (data.tool_calls || []).map((call, idx) => ({
      index: idx, name: call.function.name, arguments: call.function.arguments
    }))
    return {
      id: Date.now(), role: "assistant", content: res.content || "",
      reasoning: res.reasoning || "", toolCalls: allToolCalls, timestamp: new Date().toISOString(),
      routingInfo
    }
  }

  const executeSendMessage = useCallback(async (historyToProcess, agentForCall, attempt = 1, routingInfo = null) => {
    if (attempt > 2) {
      notifyError("Erro de roteamento: Loop de agentes detectado.")
      setLoadingMessages(false)
      return
    }

    setLoadingMessages(true)
    const apiMessages = historyToProcess.map(({ role, content }) =>
      Array.isArray(content)
        ? { role, content: content.map(item => (item.type === "text" ? { type: "text", text: item.content } : item)) }
        : { role, content }
    )

    try {
      const isRouterPass = agentForCall === "Roteador"
      const shouldUseStream = stream && !isRouterPass

      if (shouldUseStream) {
        const placeholderId = Date.now()
        const placeholder = { id: placeholderId, role: "assistant", content: "", reasoning: "", toolCalls: [], timestamp: new Date().toISOString(), routingInfo }
        setMessages(prev => [...prev, placeholder])

        const streamGenerator = sendMessageStream(aiKey, aiProvider, model, [...freeModels, ...payModels, ...groqModels], apiMessages, activeTools, agentForCall)

        for await (const event of streamGenerator) {
          if (event.type === "DELTA") {
            const { delta } = event
            setMessages(prevMessages =>
              prevMessages.map(msg => {
                if (msg.id === placeholderId) {
                  const updatedMsg = { ...msg }
                  if (delta.reasoning) updatedMsg.reasoning += delta.reasoning
                  if (delta.content) updatedMsg.content += delta.content
                  if (delta.tool_calls) {
                    delta.tool_calls.forEach(toolCallChunk => {
                      const index = toolCallChunk.index
                      if (!updatedMsg.toolCalls[index]) {
                        updatedMsg.toolCalls[index] = { name: "", arguments: "" }
                      }
                      if (toolCallChunk.function.name) {
                        updatedMsg.toolCalls[index].name = toolCallChunk.function.name
                      }
                      if (toolCallChunk.function.arguments) {
                        updatedMsg.toolCalls[index].arguments += toolCallChunk.function.arguments
                      }
                    })
                  }
                  return updatedMsg
                }
                return msg
              })
            )
          } else if (event.type === "ERROR") {
            throw event.error
          }
        }
      } else {
        const { data } = await sendMessage(aiKey, aiProvider, model, [...freeModels, ...payModels, ...groqModels], apiMessages, agentForCall, activeTools)

        if (isRouterPass && data.next_action?.type === "SWITCH_AGENT") {
          const newAgent = data.next_action.agent
          setSelectedAgent(newAgent)
          await executeSendMessage(historyToProcess, newAgent, attempt + 1, { routedTo: newAgent })
        } else {
          const assistantMessage = createAssistantMessage(data, routingInfo)
          if (assistantMessage) {
            setMessages(prev => [...prev, assistantMessage])
          }
          setLoadingMessages(false)
        }
      }
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Falha na comunicação com o servidor de IA.")
      setMessages(prev => {
        const lastUserMessageInHistory = historyToProcess.findLast(m => m.role === 'user')
        if (lastUserMessageInHistory && prev.some(m => m.timestamp === lastUserMessageInHistory.timestamp)) {
          return prev.filter(m => m.timestamp !== lastUserMessageInHistory.timestamp)
        }
        return prev
      })
    } finally {
      setLoadingMessages(false)
    }
  }, [
    aiKey, aiProvider, model, freeModels, payModels, groqModels, activeTools, stream, selectedAgent,
    notifyError, notifyInfo, notifyWarning, setMessages, setSelectedAgent
  ])

  const onSendMessage = useCallback(async () => {
    if (loadingMessages || isImproving) return
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
  }, [loadingMessages, isImproving, userPrompt, imageUrls, messages, selectedAgent, executeSendMessage, setMessages, setUserPrompt, setImageUrls, setAudioFile])

  const handleSendAudioMessage = useCallback(async () => {
    if (!audioFile) return
    setLoadingMessages(true)
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
      setLoadingMessages(false)
    }
  }, [audioFile, messages, executeSendMessage, setAudioFile, setMessages, notifyError, selectedAgent])

  const handleRegenerateResponse = useCallback(async () => {
    if (loadingMessages || isImproving) return
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role !== "assistant") {
      notifyWarning("Apenas a última resposta da IA pode ser regenerada.")
      return
    }
    const historyWithoutLastResponse = messages.slice(0, -1)
    setMessages(historyWithoutLastResponse)
    await executeSendMessage(historyWithoutLastResponse, selectedAgent)
  }, [loadingMessages, isImproving, messages, executeSendMessage, notifyWarning, setMessages, selectedAgent])

  const improvePrompt = useCallback(async () => {
    if (!userPrompt.trim() || isImproving || loadingMessages) return
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
  }, [userPrompt, isImproving, loadingMessages, aiKey, aiProvider, model, freeModels, payModels, groqModels, setUserPrompt, notifyInfo, notifySuccess, notifyError])

  return { loadingMessages, isImproving, onSendMessage, handleRegenerateResponse, improvePrompt, handleSendAudioMessage }
}

export default useMessage
