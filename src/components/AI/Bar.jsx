import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  LogIn, UserPlus,
  Settings, SendHorizontal, ImagePlus, ImageOff, Globe, GlobeLock, Newspaper, Shredder, Cloud, CloudOff,
  AudioLines, Brain, MessageCirclePlus, BookOpen, BookAlert, Link2, Link2Off, Wrench, Gamepad, Gamepad2,
  Lock, Server, ServerOff, Mic, MicOff, MoreVertical
} from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"

import Paper from "../Paper"
import AIInput from "./Input"
import Button from "../Button"

const AIBar = ({ userPrompt, setUserPrompt, onAddImage, imageCount, onSendMessage, clearHistory, toggleSettings, loading }) => {
  const { signed } = useAuth()
  const {
    aiProvider, aiProviderToggle, aiKey,
    model, freeModels, payModels, groqModels,
    stream, toggleStream,
    listening, setListening, toggleListening,
    web, toggleWeb,
    newsTool, toggleNews,
    weatherTool, toggleWeather,
    wikiTool, toggleWiki,
    browseTool, toggleBrowse,
    genshinTool, toggleGenshin,
    httpTool, toggleHttp,
  } = useAI()

  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)

  const toolsDropdownRef = useRef(null)
  const toolsTriggerRef = useRef(null)
  const moreMenuDropdownRef = useRef(null)
  const moreMenuTriggerRef = useRef(null)
  const recognitionRef = useRef(null)

  const allModels = [...freeModels, ...payModels, ...groqModels]
  const selectedModel = allModels.find(m => m.id === model)
  const isImageSupported = selectedModel?.supports_images ?? false
  const isToolsSupported = selectedModel?.supports_tools ?? false

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
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target) && toolsTriggerRef.current && !toolsTriggerRef.current.contains(event.target)) {
        setIsToolsOpen(false)
      }
      if (moreMenuDropdownRef.current && !moreMenuDropdownRef.current.contains(event.target) && moreMenuTriggerRef.current && !moreMenuTriggerRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false)
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
        <Button variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Groq" : "OpenRouter"} disabled={loading}>
          <Brain size={16} />
        </Button>
        <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}>
          <Settings size={16} />
        </Button>
        <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={isImageSupported === false || aiProvider === "groq" || loading}>
          {isImageSupported && aiProvider === "openrouter" ? <ImagePlus size={16} /> : <ImageOff size={16} />}
        </Button>
        {aiKey.length > 0 && (
          <div className="relative">
            <Button ref={toolsTriggerRef} variant="secondary" size="icon" title="Ferramentas" $rounded onClick={() => setIsToolsOpen(!isToolsOpen)} disabled={loading}>
              <Wrench size={16} />
            </Button>
            {isToolsOpen && (
              <div ref={toolsDropdownRef} className="absolute z-20 p-2 rounded-lg shadow-lg bg-lightBg-primary dark:bg-darkBg-primary opacity-80 dark:opacity-90 border border-bLight dark:border-bDark grid grid-cols-7 gap-2 w-max left-1/2 -translate-x-1/2 bottom-full mb-4">
                <Button variant={isToolsSupported && aiProvider === "openrouter" && web ? "outline" : "secondary"} size="icon" $rounded title="Pesquisa Profunda" onClick={toggleWeb} disabled={!isToolsSupported || aiProvider === "groq" || loading}><Globe size={16} /></Button>
                <Button variant={isToolsSupported && !stream && browseTool ? "outline" : "secondary"} size="icon" $rounded title="Acessar Site Específico" onClick={toggleBrowse} disabled={!isToolsSupported || stream || loading}><Link2 size={16} /></Button>
                <Button variant={isToolsSupported && !stream && httpTool ? "outline" : "secondary"} size="icon" $rounded title="Requisição HTTP" onClick={toggleHttp} disabled={!isToolsSupported || stream || loading}><Server size={16} /></Button>
                <Button variant={isToolsSupported && !stream && wikiTool ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar na Wikipédia" onClick={toggleWiki} disabled={!isToolsSupported || stream || loading}><BookOpen size={16} /></Button>
                <Button variant={isToolsSupported && !stream && newsTool ? "outline" : "secondary"} size="icon" $rounded title="Buscar Notícias" onClick={toggleNews} disabled={!isToolsSupported || stream || loading}><Newspaper size={16} /></Button>
                <Button variant={isToolsSupported && !stream && weatherTool ? "outline" : "secondary"} size="icon" $rounded title="Prever Clima" onClick={toggleWeather} disabled={!isToolsSupported || stream || loading}><Cloud size={16} /></Button>
                <Button variant={isToolsSupported && !stream && genshinTool ? "outline" : "secondary"} size="icon" $rounded title="Genshin Impact (Beta)" onClick={toggleGenshin} disabled={!isToolsSupported || stream || loading}><Gamepad2 size={16} /></Button>
              </div>
            )}
          </div>
        )}
        <AIInput id="prompt-input" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} className="resize-y" />
        <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={newsTool || weatherTool || wikiTool || browseTool || genshinTool || httpTool || loading}>
          <AudioLines size={16} />
        </Button>
        <Button variant={listening ? "danger" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir"} onClick={toggleListening} disabled={loading}>
          {listening ? <Mic size={16} /> : <MicOff size={16} />}
        </Button>
        <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading}>
          <MessageCirclePlus size={16} />
        </Button>
        <Button size="icon" $rounded title="Enviar" onClick={() => { setListening(false); onSendMessage() }} loading={loading} disabled={loading || (!userPrompt.trim() && imageCount === 0)}>
          {!loading && <SendHorizontal size={16} />}
        </Button>
      </div>

      {/* ########## LAYOUT PARA MOBILE (abaixo de sm:) ########## */}
      <div className="sm:hidden w-full flex flex-col gap-2">
        {/* --- Linha 1: Input e Enviar --- */}
        <div className="flex w-full items-center gap-2">
          <AIInput id="prompt-input-mobile" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} className="resize-y" />
          <Button size="icon" $rounded title="Enviar" onClick={() => { setListening(false); onSendMessage() }} loading={loading} disabled={loading || (!userPrompt.trim() && imageCount === 0)}>
            {!loading && <SendHorizontal size={16} />}
          </Button>
        </div>

        {/* --- Linha 2: Botões de Ação --- */}
        <div className="flex w-full items-center justify-around">
          <div className="relative">
            <Button ref={moreMenuTriggerRef} variant="secondary" size="icon" $rounded title="Mais Opções" onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} disabled={loading}>
              <MoreVertical size={16} />
            </Button>
            {isMoreMenuOpen && (
              <div ref={moreMenuDropdownRef} className="absolute z-20 left-0 bottom-full mb-2 p-2 rounded-lg shadow-lg bg-lightBg-primary dark:bg-darkBg-primary opacity-80 dark:opacity-90 border border-bLight dark:border-bDark flex flex-col gap-2">
                <Button variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Groq" : "OpenRouter"} disabled={loading}><Brain size={16} /></Button>
                <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}><Settings size={16} /></Button>
                <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={newsTool || weatherTool || wikiTool || browseTool || genshinTool || httpTool || loading}><AudioLines size={16} /></Button>
                <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading}><MessageCirclePlus size={16} /></Button>
              </div>
            )}
          </div>
          <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={isImageSupported === false || aiProvider === "groq" || loading}>
            {isImageSupported && aiProvider === "openrouter" ? <ImagePlus size={16} /> : <ImageOff size={16} />}
          </Button>
          {aiKey.length > 0 && (
            <div className="relative">
              <Button ref={toolsTriggerRef} variant="secondary" size="icon" title="Ferramentas" $rounded onClick={() => setIsToolsOpen(!isToolsOpen)} disabled={loading}>
                <Wrench size={16} />
              </Button>
              {isToolsOpen && (
                <div ref={toolsDropdownRef} className="absolute z-20 p-2 rounded-lg shadow-lg bg-lightBg-primary dark:bg-darkBg-primary opacity-80 dark:opacity-90 border border-bLight dark:border-bDark grid grid-cols-6 sm:grid-cols-7 gap-2 w-max left-1/2 -translate-x-1/2 bottom-full mb-4">
                  <Button variant={isToolsSupported && aiProvider === "openrouter" && web ? "outline" : "secondary"} size="icon" $rounded title="Pesquisa Profunda" onClick={toggleWeb} disabled={!isToolsSupported || aiProvider === "groq" || loading}><Globe size={16} /></Button>
                  <Button variant={isToolsSupported && !stream && browseTool ? "outline" : "secondary"} size="icon" $rounded title="Acessar Site Específico" onClick={toggleBrowse} disabled={!isToolsSupported || stream || loading}><Link2 size={16} /></Button>
                  <Button variant={isToolsSupported && !stream && httpTool ? "outline" : "secondary"} size="icon" $rounded title="Requisição HTTP" onClick={toggleHttp} disabled={!isToolsSupported || stream || loading}><Server size={16} /></Button>
                  <Button variant={isToolsSupported && !stream && wikiTool ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar na Wikipédia" onClick={toggleWiki} disabled={!isToolsSupported || stream || loading}><BookOpen size={16} /></Button>
                  <Button variant={isToolsSupported && !stream && newsTool ? "outline" : "secondary"} size="icon" $rounded title="Buscar Notícias" onClick={toggleNews} disabled={!isToolsSupported || stream || loading}><Newspaper size={16} /></Button>
                  <Button variant={isToolsSupported && !stream && weatherTool ? "outline" : "secondary"} size="icon" $rounded title="Prever Clima" onClick={toggleWeather} disabled={!isToolsSupported || stream || loading}><Cloud size={16} /></Button>
                  <Button variant={isToolsSupported && !stream && genshinTool ? "outline" : "secondary"} size="icon" $rounded title="Genshin Impact (Beta)" onClick={toggleGenshin} disabled={!isToolsSupported || stream || loading}><Gamepad2 size={16} /></Button>
                </div>
              )}
            </div>
          )}
          <Button variant={listening ? "danger" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir"} onClick={toggleListening} disabled={loading}>
            {listening ? <Mic size={16} /> : <MicOff size={16} />}
          </Button>
        </div>
      </div>
    </Paper>
  )
}

export default AIBar
