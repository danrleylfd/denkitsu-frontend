import { useState, useEffect, useRef, useCallback } from "react"
import { useAI } from "../contexts/AIContext"
import { sendMessageStream, getModels } from "../services/aiChat"

const useChat = () => {
  const { aiKey, model, aiProvider, prompt, messages, setMessages, customPrompt } = useAI()

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
    const loadModels = async () => {
      try {
        const { freeModels: loadedFree, payModels: loadedPay, groqModels: loadedGroq } = await getModels()
        setFreeModels(loadedFree || [])
        if (aiKey) setPayModels(loadedPay || [])
        setGroqModels(loadedGroq || [])
      } catch (err) {
        console.error("Failed to load models:", err)
        setError("Falha ao carregar os modelos de IA.")
      }
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

    const newUserMessage = { id: Date.now(), role: "user", content: messageContent.length === 1 ? messageContent[0].content : messageContent }

    const messagesToSend = [...messages]

    if (selectedPrompt) {
      const modePromptObject = prompt.find(p => p.content.includes(selectedPrompt))
      if (modePromptObject) {
          messagesToSend.push(modePromptObject)
      }
    }
    messagesToSend.push(newUserMessage)

    setMessages((prev) => [...prev, newUserMessage])
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
  }, [inputText, imageUrl, messages, model, aiKey, aiProvider, setMessages, selectedPrompt])

  const handleShowCanva = useCallback((htmlCode) => setCanvaContent(htmlCode), [])
  const handleCloseCanva = useCallback(() => setCanvaContent(null), [])
  const toggleSettings = useCallback(() => setIsSettingsOpen((prev) => !prev), [])

  return {
    messages, inputText, imageUrl, loading, error, canvaContent, isSettingsOpen, selectedPrompt, freeModels, payModels, groqModels, messagesEndRef,
    setInputText, setImageUrl, setSelectedPrompt,
    handleSendMessage, handleShowCanva, handleCloseCanva, toggleSettings
  }
}

export default useChat
