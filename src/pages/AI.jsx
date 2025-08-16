import { useState, useEffect, useCallback } from "react"

import { useAI } from "../contexts/AIContext"
import { useNotification } from "../contexts/NotificationContext"

import { sendMessageStream, sendMessage, getModels } from "../services/aiChat"
import { transcribeAudio } from "../services/audio"

import SideMenu from "../components/SideMenu"

import AIBar from "../components/AI/Bar"
import AITip from "../components/AI/Tip"
import ImagePreview from "../components/AI/ImagePreview"
import AISettings from "../components/AI/Settings"
import AIAgents from "../components/AI/Agents"
import AITools from "../components/AI/Tools"
import AIHistory from "../components/AI/History"
import Lousa from "../components/AI/Lousa"

const ContentView = ({ children }) => <main className="flex flex-col flex-1 h-dvh mx-auto">{children}</main>

const AI = () => {
  const aiContext = useAI()

  const { notifyWarning, notifyError } = useNotification()
  const [loading, setLoading] = useState(false)
  const [lousaContent, setLousaContent] = useState(null)
  const [agentsDoor, setAgentsDoor] = useState(false)
  const [toolsDoor, setToolsDoor] = useState(false)
  const [settingsDoor, setSettingsDoor] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState("Padrão")

  useEffect(() => {
    (async () => {
      try {
        const { freeModels: loadedFree, payModels: loadedPay, groqModels: loadedGroq } = await getModels()
        aiContext.setFreeModels(loadedFree?.filter(model => !model.id.includes("whisper")) || [])
        if (aiContext.aiKey) {
          aiContext.setPayModels(loadedPay?.filter(model => !model.id.includes("whisper")) || [])
        }
        aiContext.setGroqModels(loadedGroq?.filter(model => !model.id.includes("whisper")) || [])
      } catch (error) {
        notifyError(error.message || "Falha ao carregar modelos de IA.")
      }
    })()
  }, [aiContext.aiKey, notifyError])

  const onAddImage = () => {
    if (aiContext.imageUrls.length >= 3) return notifyWarning("Você pode adicionar no máximo 3 imagens.")
    const url = window.prompt("Cole a URL da imagem:")
    if (!url) return
    const img = new Image()
    img.src = url
    img.onload = () => aiContext.setImageUrls(prev => [...prev, url])
    img.onerror = () => notifyError("A URL fornecida não parece ser uma imagem válida ou não pode ser acessada.")
  }

  const executeSendMessage = useCallback(async (historyToProcess) => {
    setLoading(true)
    const apiMessages = historyToProcess.map(({ role, content }) =>
      Array.isArray(content)
        ? { role, content: content.map(item => (item.type === "text" ? { type: "text", text: item.content } : item)) }
        : { role, content }
    )
    try {
      if (aiContext.stream) {
        const placeholder = {
          id: Date.now(),
          role: "assistant",
          content: "",
          reasoning: "",
          _contentBuffer: "",
          _reasoningBuffer: "",
          timestamp: new Date().toISOString()
        }
        aiContext.setMessages(prev => [...prev, placeholder])
        await sendMessageStream(aiContext.aiKey, aiContext.aiProvider, aiContext.model, apiMessages, aiContext.activeTools, selectedPrompt, delta => {
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
          aiContext.setMessages((prev) => prev.map(msg => (msg.id === placeholder.id ? { ...placeholder } : msg)))
        })
      } else {
        const { data } = await sendMessage(
          aiContext.aiKey,
          aiContext.aiProvider,
          aiContext.model,
          [...aiContext.freeModels, ...aiContext.payModels, ...aiContext.groqModels],
          apiMessages,
          selectedPrompt,
          aiContext.activeTools
        )
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
        aiContext.setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            role: "assistant",
            content,
            reasoning: (res.reasoning || "") + reasoning,
            timestamp: new Date().toISOString()
          }
        ])
      }
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Falha na comunicação com o servidor de IA.")
      aiContext.setMessages(prev => prev.filter(msg => msg.content !== "" || msg.id !== err.id))
    } finally {
      setLoading(false)
    }
  }, [notifyError, aiContext, selectedPrompt])

  const onSendMessage = useCallback(async () => {
    if (loading) return
    const promptText = aiContext.userPrompt.trim()
    const audioFile = aiContext.audioFile
    const imageUrls = aiContext.imageUrls
    if (!promptText && !audioFile && imageUrls.length === 0) return
    if (audioFile) {
      setLoading(true)
      const userMessagePlaceholder = {
        role: "user",
        content: `[Áudio: ${audioFile.name || "Gravação"}]`,
        timestamp: new Date().toISOString()
      }
      const historyWithPlaceholder = [...aiContext.messages, userMessagePlaceholder]
      aiContext.setMessages(historyWithPlaceholder)
      aiContext.setAudioFile(null)
      try {
        const transcription = await transcribeAudio(audioFile)
        audioPrompt = `
        Goal: Se a transcrição de áudio gerada por IA for uma música, diga o nome da música, se não, faça um resumo do texto
        Context Dump: Transcrição de Áudio:\n${transcription}
        `
        const transcriptionUserMessage = {
          role: "user",
          content: audioPrompt,
          timestamp: new Date().toISOString()
        }
        const historyWithTranscription = [...historyWithPlaceholder.slice(0, -1), transcriptionUserMessage]
        aiContext.setMessages(historyWithTranscription)
        await executeSendMessage(historyWithTranscription)
      } catch (err) {
        if (err.response && err.response.data.error) {
          notifyError(err.response.data.error.message)
        } else {
          notifyError("Falha ao transcrever o áudio.")
        }
        aiContext.setMessages(prev => prev.filter(m => m.timestamp !== userMessagePlaceholder.timestamp))
      }
      return
    }

    const newContent = []
    if (promptText) {
      newContent.push({ type: "text", content: promptText })
    }
    if (imageUrls.length > 0) {
      newContent.push(...imageUrls.map(url => ({ type: "image_url", image_url: { url } })))
    }

    const newMessage = {
      role: "user",
      content: newContent,
      timestamp: new Date().toISOString()
    }
    const history = [...aiContext.messages, newMessage]
    aiContext.setMessages(history)
    aiContext.setUserPrompt("")
    aiContext.setImageUrls([])
    aiContext.setAudioFile(null)
    await executeSendMessage(history)

  }, [loading, aiContext, executeSendMessage, notifyError])

  const handleRegenerateResponse = useCallback(async () => {
    if (loading) return
    const lastMessage = aiContext.messages[aiContext.messages.length - 1]
    if (lastMessage?.role !== "assistant") {
      notifyWarning("Apenas a última resposta da IA pode ser regenerada.")
      return
    }
    const historyWithoutLastResponse = aiContext.messages.slice(0, -1)
    aiContext.setMessages(historyWithoutLastResponse)
    await executeSendMessage(historyWithoutLastResponse)
  }, [loading, aiContext.messages, executeSendMessage, notifyWarning])
  const toggleLousa = useCallback((content) => setLousaContent(content), [])
  return (
    <SideMenu ContentView={ContentView} className="bg-brand-purple bg-cover bg-center">
      <AIHistory toggleLousa={toggleLousa} onRegenerate={handleRegenerateResponse} />
      <ImagePreview />
      <div className="w-full relative">
        <AIAgents loading={loading} agentsDoor={agentsDoor} selectedAgent={selectedPrompt} onSelectAgent={setSelectedPrompt} />
        <AITools loading={loading} toolsDoor={toolsDoor} />
        <AIBar
          loading={loading}
          onAddImage={onAddImage}
          imageCount={aiContext.imageUrls.length}
          onSendMessage={onSendMessage}
          agentsDoor={agentsDoor}
          toolsDoor={toolsDoor}
          toggleAgentsDoor={() => setAgentsDoor(prev => !prev)}
          toggleToolsDoor={() => setToolsDoor(prev => !prev)}
          toggleSettingsDoor={() => setSettingsDoor(prev => !prev)}
        />
      </div>
      <AITip />
      <AISettings settingsDoor={settingsDoor} toggleSettingsDoor={() => setSettingsDoor(prev => !prev)} />
      <Lousa content={lousaContent} toggleLousa={toggleLousa} />
    </SideMenu>
  )
}

export default AI
