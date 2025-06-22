import { useState, useEffect, useRef, useCallback } from "react"
import { MdSend } from "react-icons/md"

import { useAuth } from "../contexts/AuthContext"
import { useAI } from "../contexts/AIContext"

import { sendMessageStream, getModels, getPrompt } from "../services/aiChat"

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
  const { aiKey } = useAI()
  const storedModel = localStorage.getItem("@Denkitsu:model")

  const [prompt, setPrompt] = useState("")
  const [freeModels, setFreeModels] = useState([])
  const [payModels, setPayModels] = useState([])
  const [model, setModel] = useState(storedModel || "deepseek/deepseek-r1:free")
  const [messages, setMessages] = useState([{ id: 1, role: "assistant", content: "Olá! Como posso ajudar você hoje?\n Shift + Enter para quebrar a linha." }])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [canvaContent, setCanvaContent] = useState(null)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    async function loadPrompt() {
      const promptData = await getPrompt()
      setPrompt(promptData)
    }
    loadPrompt()
  }, [])

  useEffect(() => {
    async function loadModels() {
      const { freeModels: loadedFree, payModels: loadedPay } = await getModels()
      setFreeModels(loadedFree || [])
      if(aiKey) setPayModels(loadedPay || [])
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

  useEffect(() => {
    localStorage.setItem("@Denkitsu:model", model)
  }, [model])


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

      await sendMessageStream(model, apiMessages, prompt, aiKey, (delta) => {
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
      setError(err.message || "Erro desconhecido")
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
        <ModelSelect model={model} setModel={setModel} loading={loading} freeModels={freeModels} payModels={payModels} />
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
      </div>
      <Lousa htmlContent={canvaContent} onClose={handleCloseCanva} />
    </SideMenu>
  )
}

export default AI
