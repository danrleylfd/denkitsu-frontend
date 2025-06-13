import { useState, useEffect, useRef, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import "highlight.js/styles/gml.css"
import { MdSend } from "react-icons/md"

import { useAuth } from "../contexts/AuthContext"
import { sendMessage, getModels } from "../services/aiChat"

import SideMenu from "../components/SideMenu"
import Button from "../components/Button"
import { MessageError } from "../components/Notifications"

const ContentView = ({ children }) => <div className="flex flex-col flex-1 h-screen mx-auto p-0 gap-2">{children}</div>

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
    <SideMenu ContentView={ContentView}>
      <div className="flex flex-col flex-1 overflow-y-auto p-2 gap-2 bg-cover bg-[url('/background.jpg')] bg-brand-purple">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-2 px-2 ${msg.role === "assistant" ? "justify-start" : "justify-end"} ${msg.role === "system" ? "hidden" : ""}`}>
            <img src={msg.role === "assistant" ? "/denkitsu.png" : user.avatarUrl} alt={msg.role} className="w-8 h-8 rounded-full object-cover" />
            <div className="max-w-[90%] md:max-w-[67%] break-words rounded-md px-4 py-2 shadow-[6px_6px_16px_rgba(0,0,0,0.5)] text-light-color dark:text-dark-color bg-light-cardBg dark:bg-dark-cardBg">
              <ReactMarkdown
                children={msg.content}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ node, ...props }) => <img {...props} className="w-full rounded" />,
                  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                  h1: ({ node, ...props }) => <strong {...props} />,
                  h2: ({ node, ...props }) => <strong {...props} />,
                  h3: ({ node, ...props }) => <strong {...props} />,
                  h4: ({ node, ...props }) => <strong {...props} />,
                  h5: ({ node, ...props }) => <strong {...props} />,
                  h6: ({ node, ...props }) => <strong {...props} />,
                  p: ({ node, ...props }) => <p {...props}/>,
                  pre: ({ node, ...props }) => <pre {...props} className="text-xs font-mono p-2 rounded-md" />,
                  code: ({ node, inline, className, children, ...props }) =>
                    inline ? (
                      <code {...props} className="text-xs font-mono p-2 rounded-md">
                        {children}
                      </code>
                    ) : (
                      <div {...props} className="text-xs font-mono p-2 rounded-md">
                        {children}
                      </div>
                    ),
                  think: ({ node, ...props }) => <blockquote className="text-xs">💭 {props.children} 💭</blockquote>
                }}
              />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {error && <MessageError>{error}</MessageError>}
      </div>
      <div className="flex items-center justify-between gap-2 p-2 bg-light-background dark:bg-dark-background">
        <div className="w-0 h-0 p-0 m-0"/>
        <select
          id="model-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={loading}
          className="bg-light-cardBg dark:bg-dark-cardBg text-light-color dark:text-dark-color text-sm min-h-[48px] max-w-[6.5rem] rounded-md">
          <option disabled>Selecionar Modelo</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
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
          className="flex-1 resize-y min-h-[44px] max-h-[120px] max-w-full overflow-y-hidden px-2 py-4 rounded-md font-mono text-sm bg-light-cardBg dark:bg-dark-cardBg text-light-color dark:text-dark-color"
        />
        <Button size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loading} disabled={loading || !inputText.trim()}>
          {!loading && <MdSend size={16} />}
        </Button>
      </div>
    </SideMenu>
  )
}

export default AI
