import { useState, useEffect, useCallback } from "react"

import { useNotification } from "../contexts/NotificationContext"
import { useAI } from "../contexts/AIContext"
import { sendMessageStream, sendMessage, getModels } from "../services/aiChat"

import SideMenu from "../components/SideMenu"
import Lousa from "../components/Lousa"
import AISettings from "../components/AISettings"
import ChatInput from "../components/ChatInput"
import ImagePreview from "../components/ImagePreview"
import ChatHistory from "../components/ChatHistory"

const ContentView = ({ children }) => <main className="flex flex-col flex-1 h-screen mx-auto">{children}</main>

const AI = () => {
  const {
    prompts, aiProvider, aiKey, model,
    web, setWeb,
    stream, setStream,
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
  }, [])

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
    ]
  }
  const history = [...messages]
  if (selectedPrompt) {
    const prompt = prompts.find(p => p.content.includes(selectedPrompt))
    if (prompt && !messages.some(m => m.content === prompt.content)) history.push(prompt)
  }
  history.push(newMessage)
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
      _reasoningBuffer: ""
    }
    setMessages(prev => [...prev, placeholder])
    try {
      await sendMessageStream(aiKey, aiProvider, model, apiMessages, web, delta => {
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
      const data = await sendMessage(aiKey, aiProvider, model, apiMessages, web)
      const res = data?.choices?.[0]?.message
      if (!res) return
      const { content, reasoning } = cleanContent(res.content || "")
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content,
          reasoning: (res.reasoning || "") + reasoning
        }
      ])
    } catch (error) {
      const err = JSON.parse(error.message)
      console.error(err)
      notifyError(err.message)
    } finally {
      setLoading(false)
    }
  }
}, [userPrompt, imageUrls, messages, model, aiKey, aiProvider, web, stream, selectedPrompt, prompts])

  const toggleLousa = useCallback(content => setLousaContent(content), [])

  const temMensagensDoUsuario = messages.some(msg => msg.role === "user")

  return (
    <SideMenu ContentView={ContentView} className="bg-brand-purple bg-cover bg-center">
      {!temMensagensDoUsuario ? (
        <div className="flex grow justify-center items-center flex-col">
          <ImagePreview imageUrls={imageUrls} onRemoveImage={onRemoveImage} />
          <ChatInput
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            onAddImage={onAddImage}
            imageCount={imageUrls.length}
            web={web}
            toggleWeb={() => setWeb(!web)}
            stream={stream}
            toggleStream={() => setStream(!stream)}
            toggleSettings={() => setSettingsOpen(!settingsOpen)}
            onSendMessage={onSendMessage}
            clearHistory={clearHistory}
            loading={loading}
          />
          <AISettings
            settingsOpen={settingsOpen}
            toggleSettings={() => setSettingsOpen(!settingsOpen)}
            freeModels={freeModels}
            payModels={payModels}
            groqModels={groqModels}
            prompts={prompts}
            selectedPrompt={selectedPrompt}
            onSelectPrompt={setSelectedPrompt}
          />
        </div>
      ) : (
        <>
          <ChatHistory toggleLousa={toggleLousa} messages={messages} />
          <ImagePreview imageUrls={imageUrls} onRemoveImage={onRemoveImage} />
          <ChatInput
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            onAddImage={onAddImage}
            imageCount={imageUrls.length}
            web={web}
            toggleWeb={() => setWeb(!web)}
            stream={stream}
            toggleStream={() => setStream(!stream)}
            toggleSettings={() => setSettingsOpen(!settingsOpen)}
            onSendMessage={onSendMessage}
            clearHistory={clearHistory}
            loading={loading}
          />
          <AISettings
            settingsOpen={settingsOpen}
            toggleSettings={() => setSettingsOpen(!settingsOpen)}
            freeModels={freeModels}
            payModels={payModels}
            groqModels={groqModels}
            prompts={prompts}
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
