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

const ContentView = ({ children }) => <main className="flex flex-col flex-1 h-dvh mx-auto">{children}</main>

const AI = () => {
  const {
    aiProvider, aiKey, model,
    stream, web, browserTool, httpTool, wikiTool, newsTool, weatherTool, criptoTool, genshinTool, pokedexTool,
    imageUrls, setImageUrls,
    freeModels, setFreeModels,
    payModels, setPayModels,
    groqModels, setGroqModels,
    userPrompt, setUserPrompt,
    messages, setMessages, clearHistory,
  } = useAI()
  const { notifyWarning, notifyError } = useNotification()
  const [loading, setLoading] = useState(false)
  const [lousaContent, setLousaContent] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState("Padrão")

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

  const onRemoveImage = index => setImageUrls(prev => prev.filter((_, i) => i !== index))

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
        const data = await sendMessage(aiKey, aiProvider, model, [...freeModels, ...payModels, ...groqModels], apiMessages, selectedPrompt, web, browserTool, httpTool, wikiTool, newsTool, weatherTool, criptoTool, genshinTool, pokedexTool)
        const res = data?.choices?.[0]?.message
        if (!res) return
        const cleanContent = (raw = "") => {
          let reasoning = ""
          const content = raw.replace(/(<think>.*?<\/think>|<thinking>.*?<\/thinking>|◁think▷.*?◁\/think▷)/gs, (_, r) => {
            reasoning += r;
            return ""
          });
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
  }, [aiProvider, aiKey, model, stream, web, browserTool, httpTool, wikiTool, newsTool, weatherTool, criptoTool, genshinTool, pokedexTool, freeModels, payModels, groqModels, selectedPrompt, setMessages, notifyError])

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

  const temMensagensDoUsuario = messages.some(msg => msg.role === "user")

  return (
    <SideMenu ContentView={ContentView} className="bg-brand-purple bg-cover bg-center">
      {!temMensagensDoUsuario ? (
        <div className="flex grow justify-center items-center flex-col">
          <ImagePreview imageUrls={imageUrls} onRemoveImage={onRemoveImage} />
          <AIBar
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            onAddImage={onAddImage}
            imageCount={imageUrls.length}
            toggleSettings={() => setSettingsOpen(!settingsOpen)}
            onSendMessage={onSendMessage}
            clearHistory={clearHistory}
            loading={loading}
          />
          <AITip />
          <AISettings
            settingsOpen={settingsOpen}
            toggleSettings={() => setSettingsOpen(!settingsOpen)}
            freeModels={freeModels}
            payModels={payModels}
            groqModels={groqModels}
            selectedPrompt={selectedPrompt}
            onSelectPrompt={setSelectedPrompt}
          />
        </div>
      ) : (
        <>
          <AIHistory
            toggleLousa={toggleLousa}
            onRegenerate={handleRegenerateResponse}
          />
          <ImagePreview imageUrls={imageUrls} onRemoveImage={onRemoveImage} />
          <AIBar
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            onAddImage={onAddImage}
            imageCount={imageUrls.length}
            toggleSettings={() => setSettingsOpen(!settingsOpen)}
            onSendMessage={onSendMessage}
            clearHistory={clearHistory}
            loading={loading}
          />
          <AITip />
          <AISettings
            settingsOpen={settingsOpen}
            toggleSettings={() => setSettingsOpen(!settingsOpen)}
            freeModels={freeModels}
            payModels={payModels}
            groqModels={groqModels}
            selectedPrompt={selectedPrompt}
            onSelectPrompt={setSelectedPrompt}
          />
          <Lousa content={lousaContent} toggleLousa={toggleLousa} />
        </>
      )}
    </SideMenu>
  )
}

export default AI
