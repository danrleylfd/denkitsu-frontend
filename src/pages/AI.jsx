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

const ContentView = ({ children }) => (
  <main className="flex flex-col flex-1 h-screen mx-auto" data-oid="mvsmdwz">
    {children}
  </main>
)

const AI = () => {
  const { user } = useAuth()
  const { aiKey, model, setModel, aiProvider, setAIProvider, messages, setMessages, clearHistory } = useAI()

  const [freeModels, setFreeModels] = useState([])
  const [payModels, setPayModels] = useState([])
  const [groqModels, setGroqModels] = useState([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [canvaContent, setCanvaContent] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

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
    if (!inputText.trim()) return
    const newUserMessage = { id: Date.now(), role: "user", content: inputText.trim() }
    const currentMessages = [...messages, newUserMessage]
    setMessages(currentMessages)
    setInputText("")
    setLoading(true)
    setError(null)
    try {
      const apiMessages = currentMessages.map(({ role, content }) => ({ role, content }))
      const streamedAssistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "",
        reasoning: "",
        _contentBuffer: "",
        _reasoningBuffer: ""
      }
      setMessages((prev) => [...prev, streamedAssistantMessage])
      await sendMessageStream(aiKey, aiProvider, model, apiMessages, (delta) => {
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
          if (msgIndex !== -1) {
            updated[msgIndex] = { ...streamedAssistantMessage }
          }
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
  }, [inputText, messages, model, aiKey, aiProvider, setMessages])

  const handleShowCanva = useCallback((htmlCode) => {
    setCanvaContent(htmlCode)
  }, [])

  const handleCloseCanva = useCallback(() => {
    setCanvaContent(null)
  }, [])

  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple" data-oid="y_q4oh.">
      <div className="flex flex-col flex-1 overflow-y-auto p-2 gap-2" data-oid=":_nev52">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} user={user} onShowCanva={handleShowCanva} loading={loading && msg.content === ""} data-oid="zebt8ak" />
        ))}
        <div ref={messagesEndRef} data-oid="t6yf7yp" />
        {error && <MessageError data-oid="6ug82oq">{error}</MessageError>}
      </div>
      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        handleSendMessage={handleSendMessage}
        clearHistory={clearHistory}
        toggleSettings={() => setIsSettingsOpen(true)}
        loading={loading}
        data-oid="ggfrn_1"
      />

      <AISettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        freeModels={freeModels}
        payModels={payModels}
        groqModels={groqModels}
        clearHistory={clearHistory}
        data-oid="iiypovr"
      />

      <Lousa htmlContent={canvaContent} onClose={handleCloseCanva} data-oid="qu6h-_6" />
    </SideMenu>
  )
}

export default AI
