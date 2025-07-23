import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  LogIn, UserPlus,
  Settings, SendHorizontal, ImagePlus, ImageOff,
  AudioLines, Brain, MessageCirclePlus, Wrench,
  Lock, Mic, MicOff
} from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"

import Paper from "../Paper"
import AIInput from "./Input"
import AITools from "./Tools"
import Button from "../Button"

const AIBar = ({ userPrompt, setUserPrompt, onAddImage, imageCount, onSendMessage, clearHistory, toggleSettings, loading }) => {
  const { signed } = useAuth()
  const {
    aiProvider, aiProviderToggle, aiKey,
    stream, toggleStream, listening, setListening, toggleListening
  } = useAI()

  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const recognitionRef = useRef(null)
  const desktopToolsTriggerRef = useRef(null)
  const mobileToolsTriggerRef = useRef(null)
  const desktopToolsDropdownRef = useRef(null)
  const mobileToolsDropdownRef = useRef(null)

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
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
        setUserPrompt((prev) => `${prev}${finalTranscript}`)
      }
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
    if (listening) {
      recognition.start()
    } else {
      recognition.stop()
    }
  }, [listening])

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Lógica para fechar cada menu independentemente
      if (desktopToolsDropdownRef.current && !desktopToolsDropdownRef.current.contains(event.target) && desktopToolsTriggerRef.current && !desktopToolsTriggerRef.current.contains(event.target)) {
        setIsDesktopToolsOpen(false)
      }
      if (mobileToolsDropdownRef.current && !mobileToolsDropdownRef.current.contains(event.target) && mobileToolsTriggerRef.current && !mobileToolsTriggerRef.current.contains(event.target)) {
        setIsMobileToolsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  if (!signed) {
    return (
      <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mt-2 mx-auto">
        <Button variant="secondary" size="icon" $rounded disabled><Lock size={16} /></Button>
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-lightFg-secondary dark:text-darkFg-secondary">Faça login ou crie sua conta para conversar.</p>
          <div className="flex gap-2">
            <Link to="/signup"><Button variant="outline" size="icon" $rounded><UserPlus size={16} /></Button></Link>
            <Link to="/signin"><Button variant="primary" size="icon" $rounded><LogIn size={16} /></Button></Link>
          </div>
        </div>
      </Paper>
    )
  }

  return (
    <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg max-w-[95%] mb-2 mx-auto">
      {/* ########## LAYOUT PARA DESKTOP (sm: e acima) ########## */}
      <div className="hidden sm:flex w-full items-center gap-2">
        <Button variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Groq" : "OpenRouter"} disabled={loading}><Brain size={16} /></Button>
        <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}><Settings size={16} /></Button>
        <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={loading}><ImagePlus size={16} /></Button>
        {aiKey.length > 0 && (
          <div className="relative">
            <Button ref={desktopToolsTriggerRef} variant="secondary" size="icon" title="Ferramentas" $rounded onClick={() => setIsToolsOpen(!isToolsOpen)} disabled={loading}><Wrench size={16} /></Button>
            {isToolsOpen && <AITools dropdownRef={desktopToolsDropdownRef} />}
          </div>
        )}
        <AIInput id="prompt-input" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} className="resize-y" />
        <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={loading}><AudioLines size={16} /></Button>
        <Button variant={listening ? "danger" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir"} onClick={toggleListening} disabled={loading}>{listening ? <Mic size={16} /> : <MicOff size={16} />}</Button>
        <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading}><MessageCirclePlus size={16} /></Button>
        <Button size="icon" $rounded title="Enviar" onClick={() => { setListening(false); onSendMessage() }} loading={loading} disabled={loading || (!userPrompt.trim() && imageCount === 0)}>{!loading && <SendHorizontal size={16} />}</Button>
      </div>

      {/* ########## LAYOUT PARA MOBILE (abaixo de sm:) ########## */}
      <div className="sm:hidden w-full flex flex-col gap-2">
        <div className="flex w-full items-center justify-around flex-wrap gap-y-2">
          <Button variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Groq" : "OpenRouter"} disabled={loading}><Brain size={16} /></Button>
          <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}><Settings size={16} /></Button>
          <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={loading}><ImagePlus size={16} /></Button>
          {aiKey.length > 0 && (
            <div className="relative">
              <Button ref={mobileToolsTriggerRef} variant="secondary" size="icon" title="Ferramentas" $rounded onClick={() => setIsToolsOpen(!isToolsOpen)} disabled={loading}><Wrench size={16} /></Button>
              {isToolsOpen && <AITools dropdownRef={mobileToolsDropdownRef} />}
            </div>
          )}
          <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={loading}><AudioLines size={16} /></Button>
          <Button variant={listening ? "danger" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir"} onClick={toggleListening} disabled={loading}>{listening ? <Mic size={16} /> : <MicOff size={16} />}</Button>
          <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading}><MessageCirclePlus size={16} /></Button>
        </div>
        <div className="flex w-full items-center gap-2">
          <AIInput id="prompt-input-mobile" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} className="resize-y" />
          <Button size="icon" $rounded title="Enviar" onClick={() => { setListening(false); onSendMessage() }} loading={loading} disabled={loading || (!userPrompt.trim() && imageCount === 0)}>{!loading && <SendHorizontal size={16} />}</Button>
        </div>
      </div>
    </Paper>
  )
}

export default AIBar
