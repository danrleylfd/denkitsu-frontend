import { useState, useEffect, useCallback } from "react"

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
    prompts,
    web,
    setWeb,
    stream,
    setStream,
    imageUrls,
    setImageUrls,
    aiProvider,
    aiKey,
    model,
    freeModels,
    setFreeModels,
    payModels,
    setPayModels,
    groqModels,
    setGroqModels,
    messages,
    setMessages,
    clearHistory,
    userPrompt,
    setUserPrompt
  } = useAI()

  const [loading, setLoading] = useState(false)
  const [canvaContent, setCanvaContent] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState("")

  useEffect(() => {
    async function loadModels() {
      const { freeModels: loadedFree, payModels: loadedPay, groqModels: loadedGroq } = await getModels()
      setFreeModels(loadedFree || [])
      if (aiKey) setPayModels(loadedPay || [])
      setGroqModels(loadedGroq || [])
    }
    loadModels()
  }, [aiKey])

  const onAddImage = () => {
    if (imageUrls.length >= 3) return alert("Você pode adicionar no máximo 3 imagens.")
    const url = window.prompt("Cole a URL da imagem:")
    if (!url) return
    const img = new Image()
    img.src = url
    img.onload = () => setImageUrls((prev) => [...prev, url])
    img.onerror = () => alert("A URL fornecida não parece ser uma imagem válida ou não pode ser acessada.")
  }

  const onRemoveImage = (indexToRemove) => setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove))

  const onSendMessage = useCallback(async () => {
    if (!userPrompt.trim() && imageUrls.length === 0) return
    const newUserMessage = buildUserMessage(userPrompt, imageUrls)
    const messagesToSend = prepareMessageHistory(messages, selectedPrompt, prompts, newUserMessage)
    setMessages(messagesToSend)
    setUserPrompt("")
    setImageUrls([])
    setLoading(true)
    const apiMessages = prepareApiMessages(messagesToSend)
    stream ? await handleStreamingRequest(apiMessages, setMessages) : await handleNonStreamingRequest(apiMessages, setMessages)
  }, [userPrompt, imageUrls, messages, model, aiKey, aiProvider, web, stream, selectedPrompt, prompts])

  const buildUserMessage = (prompt, urls) => {
    const content = []
    if (prompt.trim()) content.push({ type: "text", content: prompt.trim() })
    if (urls.length > 0) urls.forEach((url) => content.push({ type: "image_url", image_url: { url } }))
    return {
      role: "user",
      content: content.length === 1 ? content[0].content : content
    }
  }

  const cleanStreamingContent = (content) => {
    let output = content
    let reasoningFromThink = ""
    output = output.replace(/<think>(.*?)<\/think>/gs, (_, thought) => {
      reasoningFromThink += thought
      return ""
    })
    output = output.replace(/<think[^>]*>/gi, "")
    output = output.replace(/<\/?think>/gi, "")
    return { cleanedContent: output, reasoningFromThink }
  }

  const prepareMessageHistory = (messages, selected, prompts, newMessage) => {
    const history = [...messages]
    if (selected) {
      const modePrompt = prompts.find((p) => p.content.includes(selected))
      if (modePrompt && !messages.some((msg) => msg.content === modePrompt.content)) history.push(modePrompt)
    }
    history.push(newMessage)
    return history
  }

  const prepareApiMessages = (messages) => (
    messages.map(({ role, content }) =>
      Array.isArray(content)
        ? {
            role,
            content: content.map((item) => (item.type === "text" ? { type: "text", text: item.content } : item))
          }
        : { role, content }
    )
  )

  const createAssistantPlaceholder = () => ({
    id: Date.now() + 1,
    role: "assistant",
    content: "",
    reasoning: "",
    _contentBuffer: "",
    _reasoningBuffer: ""
  })

  const handleStreamingRequest = async (apiMessages, setMessages) => {
    const placeholder = createAssistantPlaceholder()
    setMessages((prev) => [...prev, placeholder])
    try {
      await sendMessageStream(aiKey, aiProvider, model, apiMessages, web, (delta) => processStreamingDelta(delta, placeholder, setMessages))
    } catch (error) {
      handleStreamingError(error, setMessages)
    } finally {
      setLoading(false)
    }
  }

  const processStreamingDelta = (delta, message, setMessages) => {
    if (delta.content) message._contentBuffer += delta.content
    if (delta.reasoning) message._reasoningBuffer += delta.reasoning
    if (delta.tool_calls?.[0]?.arguments?.reasoning) {
      message._reasoningBuffer += delta.tool_calls[0].arguments.reasoning
    }
    const { cleanedContent, reasoningFromThink } = cleanStreamingContent(message._contentBuffer)
    message.content = cleanedContent
    message.reasoning = (message._reasoningBuffer + reasoningFromThink).trim()
    setMessages((prev) => {
      const updated = [...prev]
      const index = updated.findIndex((m) => m.id === message.id)
      if (index !== -1) updated[index] = { ...message }
      return updated
    })
  }

  const handleStreamingError = (error, setMessages) => {
    const errMsg = parseErrorMessage(error)
    const errorContent = `Falha ao enviar mensagem.\n\`\`\`diff\n- ${errMsg}\n+ Tente usar outro modelo ou verifique sua chave de API\n+ Tente desativar a tool Web\n\`\`\``
    setMessages((prev) => {
      const updated = [...prev]
      const index = updated.findIndex((msg) => msg.role === "assistant" && msg.content === "")
      if (index !== -1) updated[index].content = errorContent
      return updated
    })
  }

  const handleNonStreamingRequest = async (apiMessages, setMessages) => {
    const placeholder = createAssistantPlaceholder()
    setMessages((prev) => [...prev, placeholder])
    try {
      const { data } = await sendMessage(aiKey, aiProvider, model, apiMessages, web)
      handleNonStreamingResponse(data, placeholder, setMessages)
    } catch (error) {
      handleNonStreamingError(error, placeholder, setMessages)
    } finally {
      setLoading(false)
    }
  }

  const handleNonStreamingResponse = (data, placeholder, setMessages) => {
  const response = data?.choices[0]?.message
  if (!response) return
  let content = response.content || ""
  let reasoning = response.reasoning || ""
  let reasoningFromThink = ""
  content = content.replace(/<think>(.*?)<\/think>/gs, (_, thought) => {
    reasoningFromThink += thought
    return ""
  })
  if (reasoningFromThink) reasoning += reasoningFromThink
  const finalMessage = {
    id: placeholder.id,
    role: "assistant",
    content: content,
    reasoning: reasoning
  }
  setMessages((prev) => {
    const updated = [...prev]
    const index = updated.findIndex((msg) => msg.id === placeholder.id)
    if (index !== -1) updated[index] = finalMessage
    return updated
  })
}

  const handleNonStreamingError = (error, placeholder, setMessages) => {
    const errMsg = parseErrorMessage(error)
    const errorContent = `Falha ao enviar mensagem.\n\`\`\`diff\n- ${errMsg}\n+ Tente usar outro modelo ou verifique sua chave de API\n+ Tente desativar a tool Web\n\`\`\``

    setMessages((prev) => {
      const updated = [...prev]
      const index = updated.findIndex((msg) => msg.id === placeholder.id)
      if (index !== -1) updated[index].content = errorContent
      return updated
    })
  }

  const parseErrorMessage = (error) => {
    try {
      const parsed = JSON.parse(error.message)
      return parsed.error || parsed.message
    } catch {
      return error.response?.data?.error?.message || error.message
    }
  }

  const toggleCanva = useCallback((htmlCode = null) => (canvaContent ? setCanvaContent(htmlCode) : setCanvaContent(htmlCode)), [])

  return (
    <SideMenu ContentView={ContentView} className="bg-brand-purple">
      <ChatHistory />

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
        loading={loading}
      />

      <AISettings
        settingsOpen={settingsOpen}
        toggleSettings={() => setSettingsOpen(!settingsOpen)}
        freeModels={freeModels}
        payModels={payModels}
        groqModels={groqModels}
        clearHistory={clearHistory}
        prompts={prompts}
        selectedPrompt={selectedPrompt}
        onSelectPrompt={setSelectedPrompt}
      />

      <Lousa htmlContent={canvaContent} toggleCanva={toggleCanva} />
    </SideMenu>
  )
}

export default AI
