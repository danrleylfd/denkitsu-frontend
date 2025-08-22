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
          toolCalls: [],
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, placeholder])
        await sendMessageStream(aiKey, aiProvider, model, [...freeModels, ...payModels, ...groqModels], apiMessages, activeTools, selectedAgent, delta => {
          const currentMsg = { ...placeholder }
          if (delta.reasoning) {
            currentMsg.reasoning += delta.reasoning
            const addToolCallOnce = (toolName, index) => {
              if (!currentMsg.toolCalls.some(t => t.name === toolName)) {
                currentMsg.toolCalls.push({ index, name: toolName, arguments: "" })
              }
            }
            if (delta.reasoning.includes("<tool>search")) addToolCallOnce("web_search", 97)
            if (delta.reasoning.includes("<tool>browser_search")) addToolCallOnce("browser_search", 98)
            if (delta.reasoning.includes("<tool>python")) addToolCallOnce("code_interpreter", 99)
          }
          if (delta.content) currentMsg.content += delta.content
          if (delta.tool_calls) {
            delta.tool_calls.forEach((toolCallChunk) => {
              const existingCall = currentMsg.toolCalls.find(c => c.index === toolCallChunk.index)
              if (!existingCall) {
                currentMsg.toolCalls.push({
                  index: toolCallChunk.index,
                  name: toolCallChunk.function.name,
                  arguments: toolCallChunk.function.arguments
                })
              }
              if (existingCall && toolCallChunk.function?.arguments) existingCall.arguments += toolCallChunk.function.arguments
            })
          }
          Object.assign(placeholder, currentMsg)
          setMessages(prev => prev.map(msg => (msg.id === placeholder.id ? { ...placeholder } : msg)))
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
        const executedFunctionTools = (res.tool_calls || []).map((call, idx) => ({
          index: idx,
          name: call.function.name,
          arguments: call.function.arguments
        }))
        const executedNativeTools = (res.executed_tools || []).map((tool, idx) => {
          let name = tool.type === "python" ? "code_interpreter" : tool.type === "search" ? "web_search" : tool.type
          return { index: 100 + idx, name, arguments: tool.arguments || "" }
        })
        const allToolCalls = [...executedFunctionTools, ...executedNativeTools]
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: "assistant",
          content,
          reasoning: (res.reasoning || "") + reasoning,
          toolCalls: allToolCalls,
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
    if (!promptText && imageUrls.length === 0) return
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
  }, [loading, isImproving, userPrompt, imageUrls, messages, executeSendMessage, setUserPrompt, setImageUrls, setAudioFile])

  const handleSendAudioMessage = useCallback(async () => {
    if (!audioFile) return
    setLoading(true)
    const userMessagePlaceholder = { role: "user", content: `[Áudio: ${audioFile.name || "Gravação"}]`, timestamp: new Date().toISOString() }
    const historyWithPlaceholder = [...messages, userMessagePlaceholder]
    setMessages(historyWithPlaceholder)
    setAudioFile(null)
    try {
      const transcription = await transcribeAudio(audioFile)
      const transcriptionUserMessage = { role: "user", content: `[Áudio: ${audioFile.name || "Gravação"}]\nTranscrição de Áudio:\n${transcription}`, timestamp: new Date().toISOString() }
      const historyWithTranscription = [...historyWithPlaceholder.slice(0, -1), transcriptionUserMessage]
      setMessages(historyWithTranscription)
      await executeSendMessage(historyWithTranscription)
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Falha ao transcrever o áudio.")
      setMessages(prev => prev.filter(m => m.timestamp !== userMessagePlaceholder.timestamp))
      setLoading(false)
    }
  }, [audioFile, messages, executeSendMessage, setAudioFile, setMessages, notifyError])

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
