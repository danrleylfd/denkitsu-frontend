import { useState, useEffect, useRef, useMemo } from "react"
import {
  LogIn, UserPlus, Settings, Send, ImagePlus, Wrench,
  AudioWaveform, Brain, MessageCirclePlus, Mic, ScanText, Lock
} from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"
import { TOOL_DEFINITIONS } from "../../constants/tools"

import Paper from "../Paper"
import AIInput from "./Input"
import Button from "../Button"
import ToolButton from "./ToolButton"

const SidePanelAIBar = ({ userPrompt, setUserPrompt, onAddImage, imageCount, onSendMessage, clearHistory, toggleSettings, loading, onAnalyzePage }) => {
  const { signed } = useAuth()
  const {
    aiProvider, aiProviderToggle, aiKey,
    model, freeModels, payModels, groqModels,
    stream, toggleStream,
    listening, setListening, toggleListening,
    handleToolToggle
  } = useAI()

  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const recognitionRef = useRef(null)

  const allModels = [...freeModels, ...payModels, ...groqModels]
  const selectedModel = allModels.find(m => m.id === model)
  const isImageSupported = selectedModel?.supports_images ?? false
  const isToolsSupported = selectedModel?.supports_tools ?? false

  const sidePanelTools = useMemo(() => {
    // const sidePanelToolKeys = new Set(["web", "browserTool", "httpTool", "criptoTool", "nasaTool", "newsTool", "weatherTool", "wikiTool", "genshinTool", "pokedexTool"])
    return TOOL_DEFINITIONS
      // .filter(tool => sidePanelToolKeys.has(tool.key))
      .map(tool => {
        let isDisabled = false
        if (tool.key === "web") {
          isDisabled = !isToolsSupported || aiProvider === "groq" || loading
        } else {
          isDisabled = !isToolsSupported || stream || loading
        }
        return { ...tool, isDisabled }
      })
  }, [isToolsSupported, aiProvider, loading, stream])

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
      if (listening) {
        recognition.start()
      }
    }
    if (listening) {
      recognition.start()
    } else {
      recognition.stop()
    }
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
          <p className="text-lightFg-secondary dark:text-darkFg-secondary">"Faça login ou crie sua conta para conversar."</p>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" $rounded onClick={() => chrome.tabs.create({ url: `https://denkitsu.vercel.app/signup` })}>
              <UserPlus size={16} />
            </Button>
            <Button variant="primary" size="icon" $rounded onClick={() => chrome.tabs.create({ url: `https://denkitsu.vercel.app/signin` })}>
              <LogIn size={16} />
            </Button>
          </div>
        </div>
      </Paper>
    )
  }

  const renderTools = () => (
    <div className="absolute z-20 p-2 rounded-lg shadow-lg bg-lightBg-primary dark:bg-darkBg-primary opacity-80 dark:opacity-90 border border-bLight dark:border-bDark grid grid-cols-5 sm:grid-cols-7 gap-2 w-max left-1/2 -translate-x-1/2 bottom-full mb-4">
      {sidePanelTools.map(({ key, title, Icon, isDisabled }) => (
        <ToolButton key={key} toolKey={key} title={title} disabled={isDisabled} onToggle={handleToolToggle}>
          <Icon size={16} />
        </ToolButton>
      ))}
    </div>
  )

  return (
    <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mb-2 mx-auto">
      <div className="w-full flex flex-col gap-2 sm:hidden">
        <div className="flex items-center justify-between flex-wrap gap-2">
            <Button variant={aiProvider === "groq" ? "orange" : "info"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Provedor: Groq" : "Provedor: OpenRouter"} disabled={loading}>
                <Brain size={16} />
            </Button>
            <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}>
                <Settings size={16} />
            </Button>
            <Button variant="secondary" size="icon" $rounded title="Analisar Página Atual" onClick={onAnalyzePage} disabled={loading}>
                <ScanText size={16} />
            </Button>
            <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={isImageSupported === false || aiProvider === "groq" || loading}>
                <ImagePlus size={16} />
            </Button>
            {aiKey.length > 0 && (
            <div className="relative">
                <Button variant={isToolsOpen ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={() => setIsToolsOpen(!isToolsOpen)} disabled={loading}>
                <Wrench size={16} />
                </Button>
                {isToolsOpen && renderTools()}
            </div>
            )}
            <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={loading}>
                <AudioWaveform size={16} />
            </Button>
            <Button variant={listening ? "mic" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir"} onClick={toggleListening} disabled={loading}>
                <Mic size={16} />
            </Button>
            <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading}>
                <MessageCirclePlus size={16} />
            </Button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <AIInput id="prompt-input-mobile" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} className="resize-y" />
          <Button size="icon" $rounded title="Enviar" onClick={() => { setListening(false); onSendMessage() }} loading={loading} disabled={loading || (!userPrompt.trim() && imageCount === 0)}>
            {!loading && <Send size={16} />}
          </Button>
        </div>
      </div>
      <div className="w-full hidden sm:flex items-center gap-2">
        <Button variant={aiProvider === "groq" ? "orange" : "info"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Provedor: Groq" : "Provedor: OpenRouter"} disabled={loading}>
            <Brain size={16} />
        </Button>
        <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}>
            <Settings size={16} />
        </Button>
        <Button variant="secondary" size="icon" $rounded title="Analisar Página Atual" onClick={onAnalyzePage} disabled={loading}>
            <ScanText size={16} />
        </Button>
        <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={isImageSupported === false || aiProvider === "groq" || loading}>
            <ImagePlus size={16} />
        </Button>
        {aiKey.length > 0 && (
          <div className="relative">
            <Button variant={isToolsOpen ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={() => setIsToolsOpen(!isToolsOpen)} disabled={loading}>
              <Wrench size={16} />
            </Button>
            {isToolsOpen && renderTools()}
          </div>
        )}
        <AIInput id="prompt-input-desktop" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} className="resize-y" />
        <div className="flex items-center gap-2">
            <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={loading}>
                <AudioWaveform size={16} />
            </Button>
            <Button variant={listening ? "mic" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir"} onClick={toggleListening} disabled={loading}>
                <Mic size={16} />
            </Button>
            <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading}>
                <MessageCirclePlus size={16} />
            </Button>
        </div>
        <Button variant="primary" size="icon" $rounded title="Enviar" onClick={() => { setListening(false); onSendMessage() }} loading={loading} disabled={loading || (!userPrompt.trim() && imageCount === 0)}>
          {!loading && <Send size={16} />}
        </Button>
      </div>
    </Paper>
  )
}

export default SidePanelAIBar
