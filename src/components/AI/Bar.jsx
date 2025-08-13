import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Lock, Brain, Settings, ImagePlus, Wrench, AudioWaveform, Mic, MessageCirclePlus, Send, Bot, } from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"

import Paper from "../Paper"
import AIInput from "./Input"
import Button from "../Button"

const AIBar = ({ onAddImage, imageCount, onSendMessage, toggleSettingsDoor, loading, agentsDoor, toggleAgents, toolsDoor, toggleToolsDoor }) => {
  const { signed } = useAuth()
  const {
    aiProvider, aiProviderToggle, aiKey,
    userPrompt, setUserPrompt,
    clearHistory,
    model, freeModels, payModels, groqModels,
    stream, toggleStream,
    listening, setListening, toggleListening,
  } = useAI()

  const recognitionRef = useRef(null)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)

  const allModels = [...freeModels, ...payModels, ...groqModels]
  const selectedModel = allModels.find(m => m.id === model)
  const isImageSupported = selectedModel?.supports_images ?? false

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Reconhecimento de voz não é suportado neste navegador.")
      return
    }
    const recognition = new window.webkitSpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "pt-BR"
    recognition.onresult = (event) => {
      let finalTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript
      }
      if (finalTranscript) setUserPrompt((prev) => `${prev}${finalTranscript}`)
    }
    recognition.onerror = (event) => {
      console.error(`Erro no reconhecimento de voz: ${event.error}`)
    }
    recognitionRef.current = recognition
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
      }
    }
  }, [setUserPrompt])

  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return
    recognition.onend = () => {
      if (listening) recognition.start()
    }
    if (listening) recognition.start()
    else recognition.stop()
  }, [listening])

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  if (!signed) {
    return (
      <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mb-2 mx-auto">
        <Button variant="secondary" size="icon" $rounded disabled>
          <Lock size={16} />
        </Button>
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-lightFg-secondary dark:text-darkFg-secondary">Faça login ou crie sua conta para conversar.</p>
          <div className="flex gap-2">
            <Link to="/signup">
              <Button variant="outline" size="icon" $rounded>
                <UserPlus size={16} />
              </Button>
            </Link>
            <Link to="/signin">
              <Button variant="primary" size="icon" $rounded>
                <LogIn size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </Paper>
    )
  }

  return (
    <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mb-2 mx-auto">
      <div className="w-full flex flex-col gap-2 sm:hidden">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Button variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Groq" : "OpenRouter"} disabled={loading}>
            <Brain size={16} />
          </Button>
          <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettingsDoor} disabled={loading}>
            <Settings size={16} />
          </Button>
          <Button variant={agentsDoor ? "outline" : "secondary"} size="icon" $rounded title="Agentes" onClick={toggleAgents} disabled={loading}>
            <Bot size={16} />
          </Button>
          <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={isImageSupported === false || aiProvider === "groq" || loading}>
            <ImagePlus size={16} />
          </Button>
          {aiKey.length > 0 && (
            <div className="relative">
              <Button variant={toolsDoor ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={toggleToolsDoor}>
                <Wrench size={16} />
              </Button>
            </div>
          )}
          <Button variant={stream ? "gradient-purple" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={loading}>
            <AudioWaveform size={16} />
          </Button>
          <Button variant={listening ? "gradient-red" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir"} onClick={toggleListening} disabled={loading}>
            <Mic size={16} />
          </Button>
          <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading}>
            <MessageCirclePlus size={16} />
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <AIInput
            id="prompt-input-mobile"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="resize-y"
          />
          <Button variant="gradient-rainbow" size="icon" $rounded title="Enviar" onClick={() => { setListening(false); onSendMessage() }} loading={loading} disabled={loading || (!userPrompt.trim() && imageCount === 0)}>
            {!loading && <Send size={16} />}
          </Button>
        </div>
      </div>
      <div className="w-full hidden sm:flex items-center gap-2">
        <Button variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Groq" : "OpenRouter"} disabled={loading}>
          <Brain size={16} />
        </Button>
        <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettingsDoor} disabled={loading}>
          <Settings size={16} />
        </Button>
        <Button variant={agentsDoor ? "outline" : "secondary"} size="icon" $rounded title="Agentes" onClick={toggleAgents} disabled={loading}>
          <Bot size={16} />
        </Button>
        <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={isImageSupported === false || aiProvider === "groq" || loading}>
          <ImagePlus size={16} />
        </Button>
        {aiKey.length > 0 && (
          <div className="relative">
            <Button variant={toolsDoor ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={toggleToolsDoor}>
              <Wrench size={16} />
            </Button>
          </div>
        )}
        <AIInput
          id="prompt-input-desktop"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="resize-y"
        />
        <div className="flex items-center gap-2">
          <Button variant={stream ? "gradient-purple" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={loading}>
            <AudioWaveform size={16} />
          </Button>
          <Button variant={listening ? "gradient-red" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir"} onClick={toggleListening} disabled={loading}>
            <Mic size={16} />
          </Button>
          <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading}>
            <MessageCirclePlus size={16} />
          </Button>
        </div>
        <Button variant="gradient-rainbow" size="icon" $rounded title="Enviar" onClick={() => { setListening(false); onSendMessage() }} loading={loading} disabled={loading || (!userPrompt.trim() && imageCount === 0)}>
          {!loading && <Send size={16} />}
        </Button>
      </div>
    </Paper>
  )
}

export default AIBar
