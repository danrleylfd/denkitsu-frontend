import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { MdSend } from "react-icons/md"

import { useAuth } from "../contexts/AuthContext"
import { useAI } from "../contexts/AIContext"

import { sendMessageStream, sendMessage, getModels, getPrompt } from "../services/aiChat"

import SideMenu from "../components/SideMenu"
import Markdown from "../components/Markdown"
import MessageActions from "../components/MessageActions"
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
  const [messages, setMessages] = useState([{ role: "assistant", content: "Olá! Como posso ajudar você hoje?\n Shift + Enter para quebrar a linha." }])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    async function loadPrompt() {
      const prompt = await getPrompt()
      setPrompt(prompt)
    }
    loadPrompt()
  }, [])

  useEffect(() => {
    async function loadModels() {
      const { freeModels, payModels } = await getModels()
      setFreeModels(freeModels)
      // setPayModels(payModels)
      setPayModels([])
    }
    loadModels()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputText])

  useEffect(() => {
    if (!storedModel || storedModel !== model) localStorage.setItem("@Denkitsu:model", model)
  }, [model])

  const handleSendMessage = useCallback(async () => {
    const newUserMessage = { role: "user", content: inputText.trim() }
    const currentMessages = [...messages, newUserMessage]
    setMessages(currentMessages)
    setInputText("")
    setLoading(true)
    setError(null)
    try {
      const apiMessages = currentMessages.map(({ role, content }) => ({ role, content }))
      const streamedAssistantMessage = { role: "assistant", content: "", reasoning: "" }
      setMessages((prev) => [...prev, streamedAssistantMessage])
      await sendMessageStream(model, apiMessages, prompt, aiKey, (delta) => {
        if (delta.content) streamedAssistantMessage.content += delta.content
        if (delta.reasoning) streamedAssistantMessage.reasoning += delta.reasoning
        if (delta.tool_calls?.[0]?.arguments?.reasoning) {
          streamedAssistantMessage.reasoning += delta.tool_calls[0].arguments.reasoning
        }
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...streamedAssistantMessage }
          return updated
        })
      })
    } catch (error) {
      setError(error.message || "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }, [inputText, loading, messages, model, aiKey])

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple">
      <div className="flex flex-col flex-1 overflow-y-auto p-2 gap-2">
        {messages.map((msg, pos) => (
          <div
            key={pos}
            className={`flex items-end gap-2 px-2 ${msg.role === "assistant" ? "flex-row" : "flex-row-reverse"} ${msg.role === "system" ? "hidden" : ""}`}>
            <img src={msg.role === "assistant" ? "/denkitsu.png" : user.avatarUrl} alt={msg.role} className="w-8 h-8 rounded-full object-cover" />
            <div className="max-w-[90%] md:max-w-[67%] break-words rounded-md px-4 py-2 shadow-[6px_6px_16px_rgba(0,0,0,0.5)] text-lightFg-secondary dark:text-darkFg-secondary bg-lightBg-secondary dark:bg-darkBg-secondary opacity-75 dark:opacity-90">
              {pos > 0 && msg.role === "assistant" && msg.reasoning && <Markdown content={msg.reasoning} think />}
              <Markdown content={msg.content} />
              {pos > 0 && msg.role === "assistant" && <MessageActions message={msg} />}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {error && <MessageError>{error}</MessageError>}
      </div>
      <div className="flex items-center justify-between gap-2 px-1 py-2 bg-lightBg-primary dark:bg-darkBg-primary">
        <div className="w-0 h-0 p-0 m-0" />
        <select
          id="model-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={loading}
          className="bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary text-sm min-h-[48px] max-w-[6.5rem] rounded-md">
          <option disabled>Selecionar Modelo</option>
          <option disabled>Gratuito</option>
          {freeModels.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
          <option disabled>Premium</option>
          {payModels.map((model) => (
            <option key={model.id} disabled value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        <textarea
          id="prompt-input"
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={!loading ? "Escreva seu prompt" : "Pensando..."}
          disabled={loading}
          rows={1}
          className="flex-1 resize-y min-h-[44px] max-h-[120px] max-w-full overflow-y-hidden px-2 py-4 rounded-md font-mono text-sm bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary"
        />
        <Button size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loading} disabled={loading || !inputText.trim()}>
          {!loading && <MdSend size={16} />}
        </Button>
      </div>
    </SideMenu>
  )
}

export default AI
