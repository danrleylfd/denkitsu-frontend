import { useState, useCallback } from "react"

import { useAuth } from "../contexts/AuthContext"
import { useNotification } from "../contexts/NotificationContext"

import { sendMessageStream, sendMessage } from "../services/aiChat"
import { transcribeAudio } from "../services/audio"

const useMessage = (props) => {
  const {
    aiProvider, aiKey, model, stream, activeTools, userPrompt, imageUrls, audioFile, messages,
    freeModels, payModels, groqModels, selectedAgent, customProviderUrl, pageContext,
    setUserPrompt, setImageUrls, setAudioFile, setMessages, setSelectedAgent, setPageContext
  } = props

  const { signed, user, loadUser } = useAuth()
  const { notifyError, notifyWarning, notifyInfo, notifySuccess } = useNotification()
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [isImproving, setIsImproving] = useState(false)

  const executeSendMessage = useCallback(async (historyToProcess, agentForCall) => {
    setLoadingMessages(true)

    const apiMessages = historyToProcess.map(({ role, content }) =>
      Array.isArray(content)
        ? { role, content: content.map(item => (item.type === "text" ? { type: "text", text: item.content } : item)) }
        : { role, content }
    )

    try {
      if (stream) {
        const placeholderId = Date.now()
        const placeholder = { id: placeholderId, role: "assistant", content: "", reasoning: "", toolCalls: [], timestamp: new Date().toISOString(), audio: null }
        setMessages(prev => [...prev, placeholder])

        const streamGenerator = sendMessageStream(aiKey, aiProvider, model, [...freeModels, ...payModels, ...groqModels], apiMessages, activeTools, agentForCall, customProviderUrl)

        for await (const event of streamGenerator) {
          setMessages(prevMessages =>
            prevMessages.map(msg => {
              if (msg.id !== placeholderId) return msg

              const updatedMsg = { ...msg }

              if (event.type === "AGENT_SWITCH") {
                updatedMsg.routingInfo = { routedTo: event.agent }
                setSelectedAgent(event.agent)
              } else if (event.type === "TOOL_EXECUTION_START") {
                updatedMsg.toolCalls = (event.tool_calls || []).map(call => ({ name: call.function.name, arguments: "pending" }))
              } else if (event.choices) {
                const delta = event.choices[0]?.delta
                if (delta?.reasoning) updatedMsg.reasoning += delta.reasoning
                if (delta?.content) updatedMsg.content += delta.content
                if (delta?.audio) updatedMsg.audio = delta.audio
                if (delta?.tool_calls) {
                  delta.tool_calls.forEach(toolCallChunk => {
                    const index = toolCallChunk.index
                    if (!updatedMsg.toolCalls[index]) updatedMsg.toolCalls[index] = { name: "", arguments: "" }
                    if (toolCallChunk.function.name) updatedMsg.toolCalls[index].name = toolCallChunk.function.name
                    if (toolCallChunk.function.arguments) updatedMsg.toolCalls[index].arguments += toolCallChunk.function.arguments
                  })
                }
              } else if (event.type === "ERROR") {
                throw new Error(event.error.message)
              }
              return updatedMsg
            })
          )
        }
      } else {
        const { data } = await sendMessage(aiKey, aiProvider, model, [...freeModels, ...payModels, ...groqModels], apiMessages, agentForCall, activeTools, customProviderUrl)
        const res = data?.choices?.[0]?.message
        const assistantMessage = {
          id: Date.now(),
          role: "assistant",
          content: res.content || "",
          reasoning: res.reasoning || "",
          toolCalls: (data.tool_calls || []).map(call => ({ name: call.function.name, arguments: call.function.arguments })),
          timestamp: new Date().toISOString(),
          routingInfo: data.routingInfo || null,
          audio: res.audio || null
        }
        setMessages(prev => [...prev, assistantMessage])
        if (data.routingInfo) setSelectedAgent(data.routingInfo.routedTo)
      }
    } catch (err) {
      notifyError(err.response?.data?.error?.message || err.message || "Falha na comunicação com o servidor de IA.")
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoadingMessages(false)
      if (signed && agentForCall === "Suporte") loadUser()
    }
  }, [
    aiKey, aiProvider, model, freeModels, payModels, groqModels, activeTools, stream, customProviderUrl,
    setMessages, setSelectedAgent, signed, loadUser, notifyError
  ])

  const onSendMessage = useCallback(async () => {
    if (loadingMessages || isImproving) return
    const promptText = userPrompt.trim()
    if (!promptText && imageUrls.length === 0 && !pageContext) return

    const userMessageContent = []
    if (promptText) userMessageContent.push({ type: "text", content: promptText })
    if (imageUrls.length > 0) userMessageContent.push(...imageUrls.map(url => ({ type: "image_url", image_url: { url } })))

    const uiMessage = {
      role: "user",
      content: userMessageContent.length > 0 ? userMessageContent : "",
      timestamp: new Date().toISOString(),
      pageContext: pageContext ? `Página: [${pageContext.title}](${pageContext.url})\n\n---\n\n${pageContext.content}` : null
    }

    const historyForUi = [...messages, uiMessage]
    setMessages(historyForUi)

    const apiMessageContent = []
    if (pageContext) {
      const pageText = `Use o seguinte contexto da página web para responder à minha pergunta.\n\nPágina: [${pageContext.title}](${pageContext.url})\n\n[CONTEÚDO DA PÁGINA]\n${pageContext.content}\n\n[MINHA PERGUNTA]`
      apiMessageContent.push({ type: "text", content: pageText })
    }
    apiMessageContent.push(...userMessageContent)

    const apiMessage = { role: "user", content: apiMessageContent }
    const historyForApi = [...messages.filter(m => !m.isPageContext), apiMessage]

    setUserPrompt("")
    setImageUrls([])
    setAudioFile(null)
    if (pageContext) setPageContext(null)

    await executeSendMessage(historyForApi, selectedAgent)
  }, [loadingMessages, isImproving, userPrompt, imageUrls, messages, selectedAgent, executeSendMessage, pageContext, setPageContext, setMessages, setUserPrompt, setImageUrls, setAudioFile])

  const handleSendAudioMessage = useCallback(async () => {
    if (!audioFile) return
    setLoadingMessages(true)
    const userMessagePlaceholder = { role: "user", content: `[Áudio: ${audioFile.name || "Gravação"}]`, timestamp: new Date().toISOString() }
    const historyWithPlaceholder = [...messages, userMessagePlaceholder]
    setMessages(historyWithPlaceholder)
    setAudioFile(null)
    try {
      const transcription = await transcribeAudio(audioFile)

      let finalTranscription = `[Áudio: ${audioFile.name || "Gravação"}]\nTranscrição de Áudio:\n${transcription}`
      if (pageContext) {
        finalTranscription = `Use o seguinte contexto da página "${pageContext.title}" (${pageContext.url}) para responder à minha pergunta sobre o áudio transcrito.\n\n[CONTEXTO DA PÁGINA]\n${pageContext.content}\n\n[TRANSCRIÇÃO DE ÁUDIO]\n${transcription}`
        setPageContext(null)
      }

      const transcriptionUserMessage = { role: "user", content: finalTranscription, timestamp: userMessagePlaceholder.timestamp }
      const historyWithTranscription = [...messages, transcriptionUserMessage]
      setMessages(historyWithTranscription)
      await executeSendMessage(historyWithTranscription, selectedAgent)
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Falha ao transcrever o áudio.")
      setMessages(prev => prev.filter(m => m.timestamp !== userMessagePlaceholder.timestamp))
      setLoadingMessages(false)
    }
  }, [audioFile, messages, executeSendMessage, pageContext, setPageContext, setAudioFile, setMessages, selectedAgent, notifyError])

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
  }, [loadingMessages, isImproving, messages, executeSendMessage, setMessages, selectedAgent, notifyWarning])

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
