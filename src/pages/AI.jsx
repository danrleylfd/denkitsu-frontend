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

const ContentView = ({ children }) => <main className="flex flex-col flex-1 h-screen mx-auto">{children}</main>

const AI = () => {
  const {
    aiProvider, aiKey, model,
    stream, web, newsTool, weatherTool, wikiTool, browseTool, genshinTool, httpTool,
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
  const [selectedPrompt, setSelectedPrompt] = useState("")

  useEffect(() => {
    ;(async () => {
      try {
        const { freeModels: loadedFree, payModels: loadedPay, groqModels: loadedGroq } = await getModels()
        setFreeModels(loadedFree || [])
        if (aiKey) setPayModels(loadedPay || [])
        setGroqModels(loadedGroq || [])
      } catch (error) {
        const { message } = (() => {
          try {
            return JSON.parse(error.message)
          } catch (err) {
            console.error(err)
            notifyError("Falha ao carregar modelos. Tente novamente.")
            return { message: "Falha ao carregar modelos. Tente novamente." }
          }
        })()
        setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: message, reasoning: "" }])
      }
    })()
  }, [aiKey, setFreeModels, setPayModels, setGroqModels, setMessages, notifyError])

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

  const onSendMessage = useCallback(async () => {
  if (!userPrompt.trim() && imageUrls.length === 0) return
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
  setLoading(true)
  const apiMessages = history.map(({ role, content }) =>
    Array.isArray(content)
      ? { role, content: content.map(item => (item.type === "text" ? { type: "text", text: item.content } : item)) }
      : { role, content }
  )

  const cleanContent = raw => {
    let reasoning = ""
    const content = raw.replace(/<think>(.*?)<\/think>/gs, (_, r) => {
      reasoning += r
      return ""
    })
    return { content, reasoning }
  }

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
    try {
      await sendMessageStream(aiKey, aiProvider, model, apiMessages, web, selectedPrompt, delta => {
        if (delta.content) placeholder._contentBuffer += delta.content
        if (delta.reasoning) placeholder._reasoningBuffer += delta.reasoning
        if (delta.tool_calls?.[0]?.arguments?.reasoning) placeholder._reasoningBuffer += delta.tool_calls[0].arguments.reasoning
        const { content, reasoning } = cleanContent(placeholder._contentBuffer)
        placeholder.content = content
        placeholder.reasoning = (placeholder._reasoningBuffer + reasoning).trim()
        setMessages((prev) => prev.map(msg => (msg.id === placeholder.id ? { ...placeholder } : msg)))
      })
    } catch (error) {
      const err = JSON.parse(error.message)
      console.error(err)
      notifyError(err.message)
      setMessages(prev => prev.filter(msg => msg.id !== placeholder.id))
    } finally {
      setLoading(false)
    }
  } else {
    try {
      if (genshinTool) apiMessages.push({
        role: "system",
        content: "Denkitsu deve entender como o personagem funciona. Divida a análise de personagens em 5 tópicos: 1. Informações gerais sobre o personagem; 2. Informações sobre como o personagem funciona; 3. Status do personagem(Números); 4. Status recomendados(Números); 5. Sua opinião sobre os Status(atual) do personagem."
      })
      const data = await sendMessage(aiKey, aiProvider, model, [...freeModels, ...payModels, ...groqModels], apiMessages, selectedPrompt, web, newsTool, weatherTool, wikiTool, browseTool, genshinTool, httpTool)
      const res = data?.choices?.[0]?.message
      if (!res) return
      const { content, reasoning } = cleanContent(res.content || "")
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
    } catch (error) {
      console.error(error)
      const err = JSON.parse(error.message)
      console.error(err)
      notifyError(err.message)
    } finally {
      setLoading(false)
    }
  }
}, [userPrompt, imageUrls, messages, model, aiKey, aiProvider, stream, web, newsTool, weatherTool, wikiTool, selectedPrompt, setMessages, setUserPrompt, setImageUrls, setLoading, notifyError])

  const toggleLousa = useCallback(content => setLousaContent(content), [])

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
          <AIHistory toggleLousa={toggleLousa} messages={messages} />
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
