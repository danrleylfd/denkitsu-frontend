import { useState, useEffect, useRef, useCallback } from "react"
import { MdSend, MdClearAll } from "react-icons/md"
import { LuBrain } from "react-icons/lu"

import { useAuth } from "../contexts/AuthContext"
import { useAI } from "../contexts/AIContext"

import { sendMessageStream, getModels } from "../services/aiChat"

import SideMenu from "../components/SideMenu"
import ChatMessage from "../components/ChatMessage"
import Lousa from "../components/Lousa"
import ModelSelect from "../components/ModelSelect"
import PromptInput from "../components/PromptInput"
import Button from "../components/Button"
import { MessageError } from "../components/Notifications"

const ContentView = ({ children }) => <main className="flex flex-col flex-1 h-screen mx-auto">{children}</main>

const AI = () => {
  const { user } = useAuth()
  const { aiKey, model, setModel, prompt, setPrompt, aiProvider, setAIProvider, aiProviderToggle , messages, setMessages, clearHistory } = useAI()
  const [freeModels, setFreeModels] = useState([])
  const [payModels, setPayModels] = useState([])
  const [groqModels, setGroqModels] = useState([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [canvaContent, setCanvaContent] = useState(null)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    async function loadModels() {
      const { freeModels: loadedFree, payModels: loadedPay, groqModels: loadedGroq } = await getModels()
      setFreeModels(loadedFree || [])
      if(aiKey) setPayModels(loadedPay || [])
      setGroqModels(loadedGroq || [])
    }
    loadModels()
  }, [aiKey])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputText])

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;
    const newUserMessage = { id: Date.now(), role: "user", content: inputText.trim() }
    setMessages(prevMessages => [...prevMessages, newUserMessage])
    const currentMessages = [...messages, newUserMessage]
    setInputText("")
    setLoading(true)
    setError(null)
    try {
      const apiMessages = currentMessages.map(({ role, content }) => ({ role, content }))
      const streamedAssistantMessage = { id: Date.now() + 1, role: "assistant", content: "", reasoning: "" }
      setMessages(prev => [...prev, streamedAssistantMessage])
      await sendMessageStream(aiKey, aiProvider, model, apiMessages, (delta) => {
        if (delta.content) streamedAssistantMessage.content += delta.content
        if (delta.reasoning) streamedAssistantMessage.reasoning += delta.reasoning
        if (delta.tool_calls?.[0]?.arguments?.reasoning) {
          streamedAssistantMessage.reasoning += delta.tool_calls[0].arguments.reasoning
        }
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...streamedAssistantMessage }
          return updated
        })
      })
    } catch (err) {
      setMessages(prev => {
        prev[prev.length - 1].content = "Falha ao enviar mensagem.\n```markdown\n" + err.message + "\n```"
        return [...prev]
      })
    } finally {
      setLoading(false)
    }
  }, [inputText, messages, model, aiKey, prompt])

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleShowCanva = useCallback((htmlCode) => {
    setCanvaContent(htmlCode)
  }, [])

  const handleCloseCanva = useCallback(() => {
    setCanvaContent(null)
  }, [])

  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple">
      <div className="flex flex-col flex-1 overflow-y-auto p-2 gap-2">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            msg={msg}
            user={user}
            onShowCanva={handleShowCanva}
            loading={loading}
          />
        ))}
        <div ref={messagesEndRef} />
        {error && <MessageError>{error}</MessageError>}
      </div>
      <div className="flex items-center justify-between gap-2 px-1 py-2 bg-lightBg-primary dark:bg-darkBg-primary">
        <div className="w-0 h-0 p-0 m-0" />
        <Button variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"} size="icon" $rounded onClick={aiProviderToggle} disabled title={aiProvider === "groq" ? "Groq" : "OpenRouter"}>
          <LuBrain size={16} />
        </Button>
        <ModelSelect aiProvider={aiProvider} setAIProvider={setAIProvider} model={model} setModel={setModel} loading={loading} freeModels={freeModels} payModels={payModels} groqModels={groqModels} />
        <PromptInput
          textareaRef={textareaRef}
          inputText={inputText}
          setInputText={setInputText}
          handleKeyDown={handleKeyDown}
          loading={loading}
        />
        <Button size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loading} disabled={loading || !inputText.trim()}>
          {!loading && <MdSend size={16} />}
        </Button>
        <Button variant="danger" size="icon" $rounded title="Apagar Conversa" onClick={clearHistory} disabled={loading}>
          <MdClearAll size={16} />
        </Button>
      </div>
      <Lousa htmlContent={canvaContent} onClose={handleCloseCanva} />
    </SideMenu>
  )
}

export default AI
