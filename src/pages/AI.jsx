import { useState, useEffect, useRef, useCallback } from "react"
import { LuX } from "react-icons/lu"

import { useAuth } from "../contexts/AuthContext"
import { useAI } from "../contexts/AIContext"
import { sendMessageStream, sendMessage, getModels } from "../services/aiChat"

import SideMenu from "../components/SideMenu"
import ChatMessage from "../components/ChatMessage"
import Lousa from "../components/Lousa"
import AISettings from "../components/AISettings"
import ChatInput from "../components/ChatInput"
import { MessageError } from "../components/Notifications"
import Paper from "../components/Paper"
import Button from "../components/Button"

const ContentView = ({ children }) => <main className="flex flex-col flex-1 h-screen mx-auto">{children}</main>

const AI = () => {
  const { user } = useAuth()
  const {
    aiKey,
    model, setModel,
    aiProvider, setAIProvider,
    stream, setStream,
    prompt,
    imageUrls, setImageUrls,
    web, setWeb,
    messages, setMessages, clearHistory,
    customPrompt, setCustomPrompt
  } = useAI()

  const [freeModels, setFreeModels] = useState([])
  const [payModels, setPayModels] = useState([])
  const [groqModels, setGroqModels] = useState([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [canvaContent, setCanvaContent] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState("")

  const messagesEndRef = useRef(null)

  useEffect(() => {
    async function loadModels() {
      const { freeModels: loadedFree, payModels: loadedPay, groqModels: loadedGroq } = await getModels()
      setFreeModels(loadedFree || [])
      if (aiKey) setPayModels(loadedPay || [])
      setGroqModels(loadedGroq || [])
    }
    loadModels()
  }, [aiKey])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleAddImageUrl = () => {
    if (imageUrls.length >= 3) {
      alert("Você pode adicionar no máximo 3 imagens.")
      return
    }

    const url = window.prompt("Cole a URL da imagem:")
    if (!url) return

    const img = new Image()
    img.src = url

    img.onload = () => {
      setImageUrls((prev) => [...prev, url])
    }

    img.onerror = () => {
      alert("A URL fornecida não parece ser uma imagem válida ou não pode ser acessada.")
    }
  }

  const handleRemoveImageUrl = (indexToRemove) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() && imageUrls.length === 0) return

    const messageContent = []
    if (inputText.trim()) {
      messageContent.push({ type: "text", content: inputText.trim() })
    }
    if (imageUrls.length > 0) {
      imageUrls.forEach((url) => {
        messageContent.push({ type: "image_url", image_url: { url } })
      })
    }

    const newUserMessage = { role: "user", content: messageContent.length === 1 ? messageContent[0].content : messageContent }
    const messagesToSend = [...messages]
    let modePrompt = null
    if (selectedPrompt) {
      modePrompt = prompt.find((p) => p.content.includes(selectedPrompt))
      if (modePrompt) {
        const exists = messages.some((msg) => msg.content === modePrompt.content)
        if (!exists) messagesToSend.push(modePrompt)
      }
    }
    messagesToSend.push(newUserMessage)

    setMessages(messagesToSend)
    setInputText("")
    setImageUrls([])
    setLoading(true)
    setError(null)

    const apiMessages = messagesToSend.map(({ role, content }) => {
      if (Array.isArray(content)) {
        const apiContent = content.map((item) => {
          if (item.type === "text") return { type: "text", text: item.content }
          return item
        })
        return { role, content: apiContent }
      }
      return { role, content }
    })

    if (stream) {
      try {
        const streamedAssistantMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: "",
          reasoning: "",
          _contentBuffer: "",
          _reasoningBuffer: ""
        }
        setMessages((prev) => [...prev, streamedAssistantMessage])
        await sendMessageStream(aiKey, aiProvider, model, apiMessages, web, (delta) => {
          if (delta.content) {
            streamedAssistantMessage._contentBuffer += delta.content
          }
          if (delta.reasoning) {
            streamedAssistantMessage._reasoningBuffer += delta.reasoning
          }
          if (delta.tool_calls?.[0]?.arguments?.reasoning) {
            streamedAssistantMessage._reasoningBuffer += delta.tool_calls[0].arguments.reasoning
          }
          let reasoningFromThink = ""
          const finalContent = streamedAssistantMessage._contentBuffer.replace(/<think>(.*?)<\/think>/gs, (match, thought) => {
            reasoningFromThink += thought
            return ""
          })
          streamedAssistantMessage.content = finalContent
          streamedAssistantMessage.reasoning = streamedAssistantMessage._reasoningBuffer + reasoningFromThink
          setMessages((prev) => {
            const updated = [...prev]
            const msgIndex = updated.findIndex((msg) => msg.id === streamedAssistantMessage.id)
            if (msgIndex !== -1) updated[msgIndex] = { ...streamedAssistantMessage }
            return updated
          })
        })
      } catch (err) {
        setMessages((prev) => {
          const updated = [...prev]
          const msgIndex = updated.findIndex((msg) => msg.role === "assistant" && msg.content === "")
          if (msgIndex !== -1) {
            updated[msgIndex].content = "Falha ao enviar mensagem.\n```diff\n- " + err.message + "\n+ Tente usar algum modelo de outro provedor ou verifique sua chave de API nas configurações.\n```"
          }
          return updated
        })
      } finally {
        setLoading(false)
      }
    } else {
      // Non-streaming logic
      const assistantPlaceholder = { id: Date.now() + 1, role: "assistant", content: "" }
      setMessages((prev) => [...prev, assistantPlaceholder])
      try {
        const { data } = await sendMessage(aiKey, aiProvider, model, apiMessages, web)
        const responseMessage = data?.choices[0]?.message
        const finalMessage = {
          id: assistantPlaceholder.id,
          role: "assistant",
          content: responseMessage.content,
          reasoning: responseMessage.reasoning || ""
        }
        setMessages((prev) => {
          const updated = [...prev]
          const msgIndex = updated.findIndex((msg) => msg.id === assistantPlaceholder.id)
          if (msgIndex !== -1) updated[msgIndex] = finalMessage
          return updated
        })
      } catch (err) {
        const errMsg = err.response?.data?.error?.message || err.message || "Erro desconhecido"
        setMessages((prev) => {
          const updated = [...prev]
          const msgIndex = updated.findIndex((msg) => msg.id === assistantPlaceholder.id)
          if (msgIndex !== -1) {
            updated[msgIndex].content = "Falha ao enviar mensagem.\n```diff\n- " + errMsg + "\n```"
          }
          return updated
        })
      } finally {
        setLoading(false)
      }
    }
  }, [inputText, imageUrls, messages, model, aiKey, aiProvider, web, stream, setMessages, selectedPrompt, prompt])

  const handleShowCanva = useCallback((htmlCode) => {
    setCanvaContent(htmlCode)
  }, [])

  const handleCloseCanva = useCallback(() => {
    setCanvaContent(null)
  }, [])

  return (
    <SideMenu ContentView={ContentView} className="bg-brand-purple">
      <div className="flex flex-col flex-1 overflow-y-auto p-2 gap-2">
        <ChatMessage msg={{ role: "assistant", content: "Olá! Como posso ajudar você hoje?\n Shift + Enter para quebrar a linha." }} />
        {messages.map((msg, pos) => (
          <ChatMessage key={pos} msg={msg} user={user} onShowCanva={handleShowCanva} loading={loading && msg.content === ""} />
        ))}
        <div ref={messagesEndRef} />
        {error && <MessageError>{error}</MessageError>}
      </div>
      {imageUrls.length > 0 && (
        <Paper className="bg-lightBg-secondary dark:bg-darkBg-secondary rounded-none flex gap-2 overflow-x-auto py-2">
          {imageUrls.map((url, index) => (
            <div key={index} className="flex flex-col gap-2">
              <img src={url} alt={`Preview ${index + 1}`} className="h-16 w-auto rounded-md object-cover" />
              <Button
                variant="danger"
                size="icon"
                $rounded
                onClick={() => handleRemoveImageUrl(index)}
                title="Remover Imagem">
                <LuX size={16} />
              </Button>
            </div>
          ))}
        </Paper>
      )}
      <ChatInput
        inputText={inputText} setInputText={setInputText}
        onAddImage={handleAddImageUrl} imageCount={imageUrls.length}
        web={web} setWeb={setWeb}
        stream={stream} setStream={setStream}
        handleSendMessage={handleSendMessage}
        toggleSettings={() => setIsSettingsOpen(true)}
        loading={loading}
      />

      <AISettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        freeModels={freeModels}
        payModels={payModels}
        groqModels={groqModels}
        clearHistory={clearHistory}
        prompts={prompt}
        selectedPrompt={selectedPrompt}
        onSelectPrompt={setSelectedPrompt}
      />

      <Lousa htmlContent={canvaContent} onClose={handleCloseCanva} />
    </SideMenu>
  )
}

export default AI
