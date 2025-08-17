import { useState, useCallback } from "react"
import { useNotification } from "../contexts/NotificationContext"
import { sendMessageStream, sendMessage } from "../services/aiChat"
import { transcribeAudio } from "../services/audio"

const useMessage = (props) => {
  const {
    aiProvider, aiKey, model, stream, activeTools, userPrompt, imageUrls, audioFile, messages,
    freeModels, payModels, groqModels, selectedAgent,
    setUserPrompt, setImageUrls, setAudioFile, setMessages
  } = props

  const { notifyError, notifyWarning, notifyInfo, notifySuccess } = useNotification()
  const [loading, setLoading] = useState(false)
  const [isImproving, setIsImproving] = useState(false)

  const executeSendMessage = useCallback(async (historyToProcess) => {
    setLoading(true)
    const apiMessages = historyToProcess.map(({ role, content }) =>
      Array.isArray(content)
        ? { role, content: content.map(item => (item.type === "text" ? { type: "text", text: item.content } : item)) }
        : { role, content }
    )
    try {
      if (stream) {
        const placeholder = {
          id: Date.now(),
          role: "assistant",
          content: "",
          reasoning: "",
          _contentBuffer: "",
          _reasoningBuffer: "",
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, placeholder])
        await sendMessageStream(aiKey, aiProvider, model, apiMessages, activeTools, selectedAgent, delta => {
          if (delta.content) placeholder._contentBuffer += delta.content
          if (delta.reasoning) placeholder._reasoningBuffer += delta.reasoning
          if (delta.tool_calls?.[0]?.function?.arguments) placeholder._reasoningBuffer += delta.tool_calls[0].function.arguments
          const cleanContent = raw => {
            let reasoning = ""
            const content = raw.replace(/(<think>.*?<\/think>|<thinking>.*?<\/thinking>|◁think▷.*?◁\/think▷)/gs, (_, r) => {
              reasoning += r
              return ""
            })
            return { content, reasoning }
          }
          const { content, reasoning } = cleanContent(placeholder._contentBuffer)
          placeholder.content = content
          placeholder.reasoning = (placeholder._reasoningBuffer + reasoning).trim()
          setMessages((prev) => prev.map(msg => (msg.id === placeholder.id ? { ...placeholder } : msg)))
        })
      } else {
        const { data } = await sendMessage(aiKey, aiProvider, model, [...freeModels, ...payModels, ...groqModels], apiMessages, selectedAgent, activeTools)
        const res = data?.choices?.[0]?.message
        if (!res) return
        const cleanContent = (raw = "") => {
          let reasoning = ""
          const content = raw.replace(/(<think>.*?<\/think>|<thinking>.*?<\/thinking>|◁think▷.*?◁\/think▷)/gs, (_, r) => {
            reasoning += r
            return ""
          })
          return { content, reasoning }
        }
        const { content, reasoning } = cleanContent(res.content)
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: "assistant",
          content,
          reasoning: (res.reasoning || "") + reasoning,
          timestamp: new Date().toISOString()
        }])
      }
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Falha na comunicação com o servidor de IA.")
      setMessages(prev => prev.filter(msg => msg.content !== "" || msg.id !== err.id))
    } finally {
      setLoading(false)
    }
  }, [
    notifyError, stream, aiKey, aiProvider, model, activeTools, selectedAgent,
    setMessages, freeModels, payModels, groqModels
  ])

  const onSendMessage = useCallback(async () => {
    if (loading || isImproving) return
    const promptText = userPrompt.trim()
    if (!promptText && !audioFile && imageUrls.length === 0) return

    if (audioFile) {
      setLoading(true)
      const userMessagePlaceholder = { role: "user", content: `[Áudio: ${audioFile.name || "Gravação"}]`, timestamp: new Date().toISOString() }
      const historyWithPlaceholder = [...messages, userMessagePlaceholder]
      setMessages(historyWithPlaceholder)
      setAudioFile(null)
      try {
        const transcription = await transcribeAudio(audioFile)
        const transcriptionUserMessage = { role: "user", content: `Transcrição de Áudio:\n${transcription}`, timestamp: new Date().toISOString() }
        const historyWithTranscription = [...historyWithPlaceholder.slice(0, -1), transcriptionUserMessage]
        setMessages(historyWithTranscription)
        await executeSendMessage(historyWithTranscription)
      } catch (err) {
        if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
        else notifyError("Falha ao transcrever o áudio.")
        setMessages(prev => prev.filter(m => m.timestamp !== userMessagePlaceholder.timestamp))
        setLoading(false)
      }
      return
    }

    const newContent = []
    if (promptText) newContent.push({ type: "text", content: promptText })
    if (imageUrls.length > 0) newContent.push(...imageUrls.map(url => ({ type: "image_url", image_url: { url } })))

    const newMessage = { role: "user", content: newContent, timestamp: new Date().toISOString() }
    const history = [...messages, newMessage]
    setMessages(history)
    setUserPrompt("")
    setImageUrls([])
    setAudioFile(null)
    await executeSendMessage(history)
  }, [loading, isImproving, userPrompt, imageUrls, audioFile, messages, executeSendMessage, notifyError, setUserPrompt, setImageUrls, setAudioFile, setMessages])

  const handleRegenerateResponse = useCallback(async () => {
    if (loading || isImproving) return
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role !== "assistant") {
      notifyWarning("Apenas a última resposta da IA pode ser regenerada.")
      return
    }
    const historyWithoutLastResponse = messages.slice(0, -1)
    setMessages(historyWithoutLastResponse)
    await executeSendMessage(historyWithoutLastResponse)
  }, [loading, isImproving, messages, executeSendMessage, notifyWarning, setMessages])

  const improvePrompt = useCallback(async () => {
    if (!userPrompt.trim() || isImproving || loading) return
    setIsImproving(true)
    notifyInfo("Aprimorando seu prompt...")
    const userMessage = { role: "user", content: userPrompt }
    try {
      const response = await sendMessage(
        aiKey, aiProvider, model,
        [...freeModels, ...payModels, ...groqModels],
        [userMessage], "Prompter", new Set()
      )
      const improvedPrompt = response.data?.choices?.[0]?.message?.content
      if (improvedPrompt) {
        setUserPrompt(improvedPrompt)
        notifySuccess("Prompt aprimorado!")
      } else {
        notifyError("Não foi possível aprimorar o prompt.")
      }
    } catch (error) {
      console.error("Error improving prompt:", error)
      if (error.response && error.response.data.error) {
        notifyError(error.response.data.error.message)
      } else {
        notifyError("Falha ao aprimorar o prompt.")
      }
    } finally {
      setIsImproving(false)
    }
  }, [userPrompt, isImproving, loading, aiKey, aiProvider, model, freeModels, payModels, groqModels, setUserPrompt, notifyInfo, notifySuccess, notifyError])

  return { loading, isImproving, onSendMessage, handleRegenerateResponse, improvePrompt }
}

export default useMessage
