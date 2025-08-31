import { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react"

import { useModels } from "./ModelContext"
import { useTools } from "./ToolContext"
import { useAgents } from "./AgentContext"

import useMessage from "../hooks/message"
import useAudio from "../hooks/audio"

import { storage } from "../utils/storage"

const AIContext = createContext()

const AIProvider = ({ children }) => {
  const { aiProvider, aiKey, model, freeModels, payModels, groqModels } = useModels()
  const { activeTools } = useTools()
  const { selectedAgent, setSelectedAgent } = useAgents()
  const [customPrompt, setCustomPrompt] = useState(`Goal\n  Responda em ${navigator.language}\nReturn Format\n  Padrão\nWarning\nContext Dump\n`)
  const [stream, setStream] = useState(false)
  const [imageUrls, setImageUrls] = useState([])
  const [userPrompt, setUserPrompt] = useState("")
  const [messages, setMessages] = useState([])
  const [autoScroll, setAutoScroll] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [audioFile, setAudioFile] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const storedCustomPrompt = await storage.local.getItem("@Denkitsu:customPrompt")
        const storedStream = await storage.local.getItem("@Denkitsu:Stream")
        const storedMessages = await storage.local.getItem("@Denkitsu:messages")
        const storedAutoScroll = await storage.local.getItem("@Denkitsu:AutoScroll")
        if (storedCustomPrompt) setCustomPrompt(storedCustomPrompt)
        if (storedStream !== null) setStream(JSON.parse(storedStream))
        if (storedMessages) setMessages(JSON.parse(storedMessages))
        if (storedAutoScroll !== null) setAutoScroll(JSON.parse(storedAutoScroll))
      } catch (error) {
        console.error("Falha ao carregar estado do AIContext:", error)
      } finally {
        setIsInitialized(true)
      }
    }
    loadPersistedState()
  }, [])

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

  useEffect(() => {
    if (!isInitialized) return
    storage.local.setItem("@Denkitsu:customPrompt", customPrompt)
  }, [customPrompt, isInitialized])

  useEffect(() => {
    if (!isInitialized) return
    storage.local.setItem("@Denkitsu:Stream", JSON.stringify(stream))
  }, [stream, isInitialized])

  useEffect(() => {
    if (!isInitialized) return
    storage.local.setItem("@Denkitsu:AutoScroll", JSON.stringify(autoScroll))
  }, [autoScroll, isInitialized])

  useEffect(() => {
    if (!isInitialized || messages.length === 0) return
    storage.local.setItem("@Denkitsu:messages", JSON.stringify(messages))
  }, [messages, isInitialized])

  const clearHistory = useCallback(() => {
    const systemMessage = { role: "system", content: customPrompt }
    setMessages([systemMessage])
    storage.local.setItem("@Denkitsu:messages", JSON.stringify([systemMessage]))
  }, [customPrompt])

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
    } else console.warn("Speech Synthesis API not supported in this browser.")
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
