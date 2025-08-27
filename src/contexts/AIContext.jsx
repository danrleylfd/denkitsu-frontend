import { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react"
import { useModels } from "./ModelContext"
import { useTools } from "./ToolContext"
import { useAgents } from "./AgentContext"
import useMessage from "../hooks/message"
import useAudio from "../hooks/audio"

const AIContext = createContext()

const AIProvider = ({ children }) => {
  const { aiProvider, aiKey, model, freeModels, payModels, groqModels } = useModels()
  const { activeTools } = useTools()
  const { selectedAgent, setSelectedAgent } = useAgents()

  const storedCustomPrompt = localStorage.getItem("@Denkitsu:customPrompt")
  const storedStream = JSON.parse(localStorage.getItem("@Denkitsu:Stream"))
  const storedMessages = localStorage.getItem("@Denkitsu:messages")
  const storedAutoScroll = JSON.parse(localStorage.getItem("@Denkitsu:AutoScroll"))

  const [customPrompt, setCustomPrompt] = useState(storedCustomPrompt || `Goal\n  Responda em ${navigator.language}\nReturn Format\n  Padrão\nWarning\nContext Dump\n`)
  const [stream, setStream] = useState(storedStream === null ? false : storedStream)
  const [imageUrls, setImageUrls] = useState([])
  const [userPrompt, setUserPrompt] = useState("")
  const [messages, setMessages] = useState(storedMessages ? JSON.parse(storedMessages) : [])
  const [autoScroll, setAutoScroll] = useState(storedAutoScroll === null ? false : storedAutoScroll)
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [audioFile, setAudioFile] = useState(null)

  const toggleListening = useCallback(() => setListening(l => !l), [])

  const {
    recording, fileInputRef, handleStartRecording,
    handleStopRecording, handleUploadClick, handleFileChange
  } = useAudio({ setAudioFile, setUserPrompt, listening })

  const {
    loadingMessages, isImproving, onSendMessage, handleRegenerateResponse, improvePrompt, handleSendAudioMessage
  } = useMessage({
    aiProvider, aiKey, model, stream, activeTools, userPrompt, imageUrls, audioFile, messages,
    freeModels, payModels, groqModels, selectedAgent,
    setUserPrompt, setImageUrls, setAudioFile, setMessages, setSelectedAgent
  })

  useEffect(() => localStorage.setItem("@Denkitsu:customPrompt", customPrompt), [customPrompt])
  useEffect(() => localStorage.setItem("@Denkitsu:Stream", stream), [stream])
  useEffect(() => localStorage.setItem("@Denkitsu:AutoScroll", autoScroll), [autoScroll])

  useEffect(() => {
    setMessages((prev) => {
      const hasSystemMessage = prev.some((msg) => msg.role === "system")
      if (!hasSystemMessage) return [{ role: "system", content: customPrompt }]
      return prev
    })
    localStorage.setItem("@Denkitsu:messages", JSON.stringify(messages))
  }, [messages, customPrompt])

  const clearHistory = useCallback(() => setMessages([{ role: "system", content: customPrompt }]), [customPrompt])
  const toggleStream = useCallback(() => setStream(prev => !prev), [])
  const toggleAutoScroll = useCallback(() => setAutoScroll(prev => !prev), [])

  const speakResponse = useCallback((text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        text
          .replace(/!\[.*?\]\(.*?\)/g, "")
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
          .replace(/(?:https?|ftp):\/\/[\n\S]+/g, "")
          .replace(/[^a-zA-Z0-9À-ÿ,.\-!?;\s]/g, "")
      )
      utterance.lang = "pt-BR"
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    } else {
      console.warn("Speech Synthesis API not supported in this browser.")
    }
  }, [])

  const values = useMemo(() => ({
    autoScroll, toggleAutoScroll,
    stream, toggleStream,
    speaking, speakResponse,
    listening, toggleListening,
    imageUrls, setImageUrls,
    audioFile, setAudioFile,
    customPrompt, setCustomPrompt,
    userPrompt, setUserPrompt,
    messages, setMessages, clearHistory,
    loadingMessages, isImproving, onSendMessage, handleRegenerateResponse, improvePrompt, handleSendAudioMessage,
    recording, fileInputRef, handleStartRecording, handleStopRecording, handleUploadClick, handleFileChange,
  }), [
    autoScroll, toggleAutoScroll, stream, toggleStream, speaking, speakResponse, listening, toggleListening,
    imageUrls, audioFile, customPrompt, userPrompt, messages, clearHistory,
    loadingMessages, isImproving, onSendMessage, handleRegenerateResponse, improvePrompt, handleSendAudioMessage,
    recording, fileInputRef, handleStartRecording, handleStopRecording, handleUploadClick, handleFileChange
  ])

  return (
    <AIContext.Provider value={values}>
      {children}
    </AIContext.Provider>
  )
}

const useAI = () => {
  const context = useContext(AIContext)
  if (!context) throw new Error("useAI deve ser usado dentro de um <AIProvider>")
  return context
}

export { useAI }
export default AIProvider
