import { useState, useEffect, useRef, useCallback } from "react"

import { useAuth } from "../contexts/AuthContext"
import { useAI } from "../contexts/AIContext"
import { sendMessageStream, getModels } from "../services/aiChat"

import SideMenu from "../components/SideMenu"
import ChatMessage from "../components/ChatMessage"
import Lousa from "../components/Lousa"
import AISettings from "../components/AISettings"
import ChatInput from "../components/ChatInput"
import { MessageError } from "../components/Notifications"
import Paper from "../components/Paper"

const ContentView = ({ children }) => <main className="flex flex-col flex-1 h-screen mx-auto">{children}</main>

const AI = () => {
  const { user } = useAuth()
  const { aiKey, model, setModel, aiProvider, setAIProvider, prompt, web, setWeb, messages, setMessages, clearHistory, customPrompt, setCustomPrompt } = useAI()

  const [freeModels, setFreeModels] = useState([])
  const [payModels, setPayModels] = useState([])
  const [groqModels, setGroqModels] = useState([])
  const [inputText, setInputText] = useState("")
  const [imageUrl, setImageUrl] = useState("")
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

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() && !imageUrl) return

    const messageContent = []
    if (inputText.trim()) {
      messageContent.push({ type: "text", content: inputText.trim() })
    }
    if (imageUrl) {
      messageContent.push({ type: "image_url", image_url: { url: imageUrl } })
    }

    const newUserMessage = { role: "user", content: messageContent.length === 1 ? messageContent[0].content : messageContent }

    const messagesToSend = [...messages]

    let modePrompt = null
    if (selectedPrompt) {
      modePrompt = prompt.find(p => p.content.includes(selectedPrompt))
      if (modePrompt) {
        const exists = messages.some(msg => msg.content === modePrompt.content)
        console.log(exists)
        if (!exists) messagesToSend.push(modePrompt)
      }
    }
    messagesToSend.push(newUserMessage)

    setMessages(messagesToSend)
    setInputText("")
    setImageUrl("")
    setLoading(true)
    setError(null)

    try {
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
          updated[msgIndex].content =
            "Falha ao enviar mensagem.\n```diff\n- " +
            err.message +
            "\n+ Tente usar algum modelo de outro provedor ou verifique sua chave de API nas configurações.\n```"
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }, [inputText, imageUrl, messages, model, aiKey, aiProvider, setMessages, selectedPrompt])

  const handleShowCanva = useCallback((htmlCode) => {
    setCanvaContent(htmlCode)
  }, [])

  const handleCloseCanva = useCallback(() => {
    setCanvaContent(null)
  }, [])

  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple">
      <div className="flex flex-col flex-1 overflow-y-auto p-2 gap-2">
        <ChatMessage msg={{ role: "assistant", content: "Olá! Como posso ajudar você hoje?\n Shift + Enter para quebrar a linha." }} />
        {messages.map((msg, pos) => (
          <ChatMessage key={pos} msg={msg} user={user} onShowCanva={handleShowCanva} loading={loading && msg.content === ""} />
        ))}
        <div ref={messagesEndRef} />
        {error && <MessageError>{error}</MessageError>}
      </div>

      {imageUrl && (
        <Paper className="bg-lightBg-primary dark:bg-darkBg-primary rounded-none relative w-full">
          <img src={imageUrl} alt="Preview" className="max-h-24 rounded-md object-cover" />
        </Paper>
      )}

      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        web={web}
        setWeb={setWeb}
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
