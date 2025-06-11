import { useState, useEffect, useRef, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import "highlight.js/styles/gml.css"
import { MdSend } from "react-icons/md"

import { useAuth } from "../../contexts/AuthContext"
import { sendMessage, getModels } from "../../services/aiChat"

import SideMenu from "../../components/SideMenu"
import Button from "../../components/Button"
import { MessageError } from "../../components/Notifications"

import { SideContentContainer, ChatBody, Dropdown, MessageRow, Imagem, MessageBubble, CustomPre, CustomCode, InputArea, StyledTextarea } from "./styles"

const AI = () => {
  const { user } = useAuth()
  const storedModel = localStorage.getItem("@Denkitsu:model")
  const [models, setModels] = useState([])
  const [model, setModel] = useState(storedModel || "deepseek/deepseek-r1:free")
  const [messages, setMessages] = useState([{ role: "assistant", content: "Olá! Como posso ajudar você hoje?\n Shift + Enter para quebrar a linha." }])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  useEffect(() => {
    async function loadModels() {
      const models = await getModels()
      if (models.error) throw new Error(models.error.message)
      setModels(models)
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
      const data = await sendMessage(model, apiMessages)
      if (data.error) throw new Error(data.error.message)
      const message = data?.choices?.[0]?.message
      if (!message) throw new Error("Serviço temporariamente indisponível.")
      setMessages((prevMessages) => [...prevMessages, message])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [inputText, loading, messages])
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  return (
    <SideMenu ContentView={SideContentContainer}>
      <ChatBody>
        {messages.map((msg, idx) => (
          <MessageRow key={idx} $msgOwner={msg.role}>
            <Imagem src={msg.role === "assistant"? "/denkitsu.png" : user.avatarUrl} alt={msg.role} />
            <MessageBubble $msgOwner={msg.role}>
              <ReactMarkdown
                children={msg.content}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                components={{
                  pre: ({ node, ...props }) => <CustomPre {...props} />,
                  code: ({ node, inline, className, children, ...props }) =>
                    inline ? (
                      <CustomCode {...props} className={className}>
                        {children}
                      </CustomCode>
                    ) : (
                      <CustomCode as="div" {...props} className={className}>
                        {children}
                      </CustomCode>
                    ),
                  think: ({ node, ...props }) => <blockquote style={{ fontSize: 12 }}>💭 {props.children} 💭</blockquote>
                }}
              />
            </MessageBubble>
          </MessageRow>
        ))}
        <div ref={messagesEndRef} />
        {error && <MessageError>{error}</MessageError>}
      </ChatBody>
      <InputArea>
        <Dropdown id="model-select" value={model} onChange={(e) => setModel(e.target.value)} disabled={loading}>
          <option disabled>Selecionar Modelo</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </Dropdown>
        <StyledTextarea
          id="prompt-input"
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={!loading ? "Escreva seu prompt" : "Pensando..."}
          disabled={loading}
          rows={1}
        />
        <Button size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loading} disabled={loading || !inputText.trim()}>
          {!loading && <MdSend size={16} />}
        </Button>
      </InputArea>
    </SideMenu>
  )
}

export default AI
