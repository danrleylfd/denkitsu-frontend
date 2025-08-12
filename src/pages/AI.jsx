import { useState, useEffect, useCallback } from "react"

import { useAI } from "../contexts/AIContext"
import { useNotification } from "../contexts/NotificationContext"

import { sendMessageStream, sendMessage, getModels } from "../services/aiChat"

import SideMenu from "../components/SideMenu"
import AIBar from "../components/AI/Bar"
import AITip from "../components/AI/Tip"
import ImagePreview from "../components/AI/ImagePreview"
import AISettings from "../components/AI/Settings"
import AIHistory from "../components/AI/History"
import Lousa from "../components/AI/Lousa"
import AITools from "../components/AI/Tools"

const ContentView = ({ children }) => <main className="flex flex-col flex-1 h-dvh mx-auto">{children}</main>

const AI = () => {
  const {
    freeModels, payModels, groqModels,
    setFreeModels, setPayModels, setGroqModels, aiKey, imageUrls,
    stream, aiProvider, model, web, tools, messages, setMessages,
    userPrompt, setUserPrompt, setImageUrls, selectedPrompt
  } = useAI()

  const { notifyWarning, notifyError } = useNotification()
  const [loading, setLoading] = useState(false)
  const [lousaContent, setLousaContent] = useState(null)
  const [settingsDoor, setSettingsDoor] = useState(false)
  const [toolsDoor, setToolsDoor] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const { freeModels: loadedFree, payModels: loadedPay, groqModels: loadedGroq } = await getModels()
        setFreeModels(loadedFree || [])
        if (aiKey) setPayModels(loadedPay || [])
        setGroqModels(loadedGroq || [])
      } catch (error) {
        notifyError(error.message || "Falha ao carregar modelos de IA.")
      }
    })()
  }, [aiKey, setFreeModels, setPayModels, setGroqModels, notifyError])

  const onAddImage = () => {
    if (imageUrls.length >= 3) return notifyWarning("Você pode adicionar no máximo 3 imagens.")
    const url = window.prompt("Cole a URL da imagem:")
    if (!url) return
    const img = new Image()
    img.src = url
    img.onload = () => setImageUrls(prev => [...prev, url])
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
        await sendMessageStream(aiKey, aiProvider, model, apiMessages, web, selectedPrompt, delta => {
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
        const { data } = await sendMessage(
          aiKey,
          aiProvider,
          model,
          [...freeModels, ...payModels, ...groqModels],
          apiMessages,
          selectedPrompt,
          web,
          tools
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
        setMessages(prev => [
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
      setMessages(prev => prev.filter(msg => msg.content !== "" || msg.id !== err.id))
    } finally {
      setLoading(false)
    }
  }, [aiProvider, aiKey, model, stream, web, freeModels, payModels, groqModels, selectedPrompt, setMessages, notifyError, tools])

  const onSendMessage = useCallback(async () => {
    if (loading || (!userPrompt.trim() && imageUrls.length === 0)) return
    const newMessage = {
      role: "user",
      content: [
        ...(userPrompt.trim() ? [{ type: "text", content: userPrompt.trim() }] : []),
        ...imageUrls.map(url => ({ type: "image_url", image_url: { url } }))
      ],
      timestamp: new Date().toISOString()
    }
    const history = [...messages, newMessage]
    setMessages(history)
    setUserPrompt("")
    setImageUrls([])
    await executeSendMessage(history)
  }, [loading, userPrompt, imageUrls, messages, setMessages, setUserPrompt, setImageUrls, executeSendMessage])

  const handleRegenerateResponse = useCallback(async () => {
    if (loading) return
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role !== "assistant") {
      notifyWarning("Apenas a última resposta da IA pode ser regenerada.")
      return
    }
    const historyWithoutLastResponse = messages.slice(0, -1)
    setMessages(historyWithoutLastResponse)
    await executeSendMessage(historyWithoutLastResponse)
  }, [loading, messages, setMessages, executeSendMessage, notifyWarning])

  const toggleLousa = useCallback((content) => setLousaContent(content), [])

  return (
    <SideMenu ContentView={ContentView} className="bg-brand-purple bg-cover bg-center">
      <AIHistory toggleLousa={toggleLousa} onRegenerate={handleRegenerateResponse} />
      <ImagePreview />
      <div className="w-full relative">
        <AITools loading={loading} toolsDoor={toolsDoor} />
        <AIBar
          loading={loading}
          toggleSettingsDoor={() => setSettingsDoor(!settingsDoor)}
          toolsDoor={toolsDoor}
          toggleToolsDoor={() => setToolsDoor(prev => !prev)}
          onAddImage={onAddImage}
          imageCount={imageUrls.length}
          onSendMessage={onSendMessage}
        />
      </div>
      <AITip />
      <AISettings
        settingsDoor={settingsDoor}
        toggleSettingsDoor={() => setSettingsDoor(!settingsDoor)}
      />
      <Lousa content={lousaContent} toggleLousa={toggleLousa} />
    </SideMenu>
  )
}

export default AI
