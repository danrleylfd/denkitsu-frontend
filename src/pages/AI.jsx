import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import "highlight.js/styles/gml.css"
import { MdSend } from "react-icons/md"
import { FiCopy, FiTerminal, FiPlusSquare } from "react-icons/fi"

import { useAuth } from "../contexts/AuthContext"
import { sendMessage, getModels } from "../services/aiChat"
import { publishNews } from "../services/news"

import SideMenu from "../components/SideMenu"
import Button from "../components/Button"
import { MessageError } from "../components/Notifications"
import { useAI } from "../contexts/AIContext"
import { useTasks } from "../contexts/TasksContext"

const MessageActions = ({ message }) => {
  const [isPublishing, setIsPublishing] = useState(false)
  const [copyStatus, setCopyStatus] = useState(null)
  const { setTasks } = useTasks()

  const extractCodeFromMarkdown = (markdown) => {
    const codeRegex = /^```(\w*)\n([\s\S]+?)\n^```/gm
    const matches = [...markdown.matchAll(codeRegex)]
    return matches.map((match) => match[2].trim()).join("\n\n")
  }

  const codeToCopy = useMemo(() => extractCodeFromMarkdown(message.content), [message.content])

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopyStatus(type)
    setTimeout(() => setCopyStatus(null), 2000)
  }

  const handleAddToKanban = () => {
    const contentMessage = codeToCopy || message.content
    const newTasks = JSON.parse(contentMessage).map((content, index) => ({
      id: `task-${Date.now()}-${index}`,
      content
    }))
    setTasks((prev) => ({ ...prev, todo: [...prev.todo, ...newTasks] }))
    alert(`Conteúdo enviado para o Kanban:\n\n${contentMessage}`)
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const contentParts = message.content.split("**Fonte(s):**")
      let source = "Gerado por IA"
      if (contentParts.length > 1 && contentParts[1]) {
        const sourceText = contentParts[1]
        const urlRegex = /\((https?:\/\/[^\s)]+)\)/
        const match = sourceText.match(urlRegex)
        if (match && match[1]) {
          source = match[1]
        }
      }
      const newArticle = await publishNews(message.content, source)
      alert(`Artigo publicado com sucesso! Fontes: ${source}`)
    } catch (error) {
      alert(`Erro ao publicar: ${error.message}`)
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button variant="outline" $rounded onClick={handleAddToKanban} title="Adicionar ao Kanban">
        <FiPlusSquare size={16} /> Kanban
      </Button>
      <Button variant="outline" $rounded onClick={() => handleCopy(message.content, "text")} title="Copiar Resposta">
        <FiCopy size={16} /> {copyStatus === "text" ? "Copiado!" : "Copiar"}
      </Button>
      {codeToCopy && (
        <Button variant="outline" $rounded onClick={() => handleCopy(codeToCopy, "code")} title="Copiar Código">
          <FiTerminal size={16} /> {copyStatus === "code" ? "Copiado!" : "Copiar Código"}
        </Button>
      )}
      <Button variant="outline" $rounded onClick={handlePublish} disabled={isPublishing} title="Publicar Artigo">
        <FiPlusSquare size={16} /> {isPublishing ? "Publicando..." : "Publicar"}
      </Button>
    </div>
  )
}

const ContentView = ({ children }) => <div className="flex flex-col flex-1 h-screen mx-auto">{children}</div>

const AI = () => {
  const { user } = useAuth()
  const { aiKey } = useAI()
  const storedModel = localStorage.getItem("@Denkitsu:model")
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
    async function loadModels() {
      const { freeModels, payModels } = await getModels()
      // if (models.error) throw new Error(models.error.message)
      setFreeModels(freeModels)
      setPayModels(payModels)
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
      const data = await sendMessage(model, apiMessages, aiKey)
      if (data.error) throw new Error(data.error.message)
      const message = data?.choices?.[0]?.message
      if (!message) throw new Error("Serviço temporariamente indisponível.")
      setMessages((prevMessages) => [...prevMessages, message])
    } catch (error) {
      setError(error.message)
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
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-2 px-2 ${msg.role === "assistant" ? "flex-row" : "flex-row-reverse"} ${msg.role === "system" ? "hidden" : ""}`}>
            <img src={msg.role === "assistant" ? "/denkitsu.png" : user.avatarUrl} alt={msg.role} className="w-8 h-8 rounded-full object-cover" />
            <div className="max-w-[90%] md:max-w-[67%] break-words rounded-md px-4 py-2 shadow-[6px_6px_16px_rgba(0,0,0,0.5)] text-lightFg-secondary dark:text-darkFg-secondary bg-lightBg-secondary dark:bg-darkBg-secondary opacity-75 dark:opacity-90">
              <ReactMarkdown
                children={msg.content}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ node, ...props }) => <img className="w-full rounded" {...props} />,
                  a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
                  h1: ({ node, ...props }) => <strong {...props} />,
                  h2: ({ node, ...props }) => <strong {...props} />,
                  h3: ({ node, ...props }) => <strong {...props} />,
                  h4: ({ node, ...props }) => <strong {...props} />,
                  h5: ({ node, ...props }) => <strong {...props} />,
                  h6: ({ node, ...props }) => <strong {...props} />,
                  p: ({ node, ...props }) => <p {...props} />,
                  pre: ({ node, ...props }) => <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary break-words text-pretty text-xs p-2 rounded-md" {...props} />,
                  code: ({ node, inline, className, children, ...props }) => (
                    <code className="bg-lightBg-tertiary dark:bg-darkBg-tertiary break-words text-pretty text-xs p-2 rounded-md" {...props}>
                      {children}
                    </code>
                  ),
                  think: ({ children }) => <blockquote className="break-words text-pretty text-xs">💭 {children} 💭</blockquote>
                }}
              />
              {msg.role === "assistant" && idx > 0 && <MessageActions message={msg} />}
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
