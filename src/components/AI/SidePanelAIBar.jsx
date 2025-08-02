import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  LogIn, UserPlus,
  Settings, SendHorizontal, ImagePlus, ImageOff, Globe, GlobeLock, Newspaper, Shredder, Cloud, CloudOff,
  AudioLines, AudioWaveform, Brain, MessageCirclePlus, BookOpen, BookAlert, Link2, Link2Off, Wrench, Gamepad, Gamepad2,
  Lock, Server, ServerOff, Mic, MicOff, MoreVertical, Smartphone, Bitcoin, CircleOff, ScanText // Ícone adicionado
} from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"

import Paper from "../Paper"
import AIInput from "./Input"
import Button from "../Button"

const SidePanelAIBar = ({ userPrompt, setUserPrompt, onAddImage, imageCount, onSendMessage, clearHistory, toggleSettings, loading, onAnalyzePage }) => {
  const { signed } = useAuth()
  const {
    aiProvider, aiProviderToggle, aiKey,
    model, freeModels, payModels, groqModels,
    stream, toggleStream,
    listening, setListening, toggleListening,
    web, toggleWeb,
    browserTool, toggleBrowser,
    httpTool, toggleHttp,
    wikiTool, toggleWiki,
    newsTool, toggleNews,
    weatherTool, toggleWeather,
    criptoTool, toggleCripto,
    genshinTool, toggleGenshin,
    pokedexTool, togglePokedex,
    nasaTool, toggleNasa,
  } = useAI()

  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
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
    if (!recognition) {
      return
    }
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
          <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}>
            <Settings size={16} />
          </Button>
          <Button variant="secondary" size="icon" $rounded title="Analisar Página Atual" onClick={onAnalyzePage} disabled={loading}>
            <ScanText size={16} />
          </Button>
          <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={isImageSupported === false || aiProvider === "groq" || loading}>
            {isImageSupported && aiProvider === "openrouter" ? <ImagePlus size={16} /> : <ImageOff size={16} />}
          </Button>
          {aiKey.length > 0 && (
            <div className="relative">
              <Button variant={isToolsOpen ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={() => setIsToolsOpen(!isToolsOpen)} disabled={loading}>
                <Wrench size={16} />
              </Button>
              {isToolsOpen && (
                <div className="absolute z-20 p-2 rounded-lg shadow-lg bg-lightBg-primary dark:bg-darkBg-primary opacity-80 dark:opacity-90 border border-bLight dark:border-bDark grid grid-cols-7 gap-2 w-max left-1/2 -translate-x-1/2 bottom-full mb-4">
                  <Button variant={isToolsSupported && aiProvider === "openrouter" && web ? "outline" : "secondary"} size="icon" $rounded title="Pesquisa Profunda" onClick={toggleWeb} disabled={!isToolsSupported || aiProvider === "groq" || loading}>
                    {isToolsSupported && aiProvider === "openrouter" ? <Globe size={16} /> : <GlobeLock size={16} />}
                  </Button>
                  <Button variant={isToolsSupported && !stream && browserTool ? "outline" : "secondary"} size="icon" $rounded title="Acessar Site Específico" onClick={toggleBrowser} disabled={!isToolsSupported || stream || loading}>
                    {isToolsSupported && !stream ? <Link2 size={16} /> : <Link2Off size={16} />}
                  </Button>
                  <Button variant={isToolsSupported && !stream && httpTool ? "outline" : "secondary"} size="icon" $rounded title="Requisição HTTP" onClick={toggleHttp} disabled={!isToolsSupported || stream || loading}>
                    {isToolsSupported && !stream ? <Server size={16} /> : <ServerOff size={16} />}
                  </Button>
                  <Button variant={isToolsSupported && !stream && wikiTool ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar na Wikipédia" onClick={toggleWiki} disabled={!isToolsSupported || stream || loading}>
                    {isToolsSupported && !stream ? <BookOpen size={16} /> : <BookAlert size={16} />}
                  </Button>
                  <Button variant={isToolsSupported && !stream && newsTool ? "outline" : "secondary"} size="icon" $rounded title="Buscar Notícias" onClick={toggleNews} disabled={!isToolsSupported || stream || loading}>
                    {isToolsSupported && !stream ? <Newspaper size={16} /> : <Shredder size={16} />}
                  </Button>
                  <Button variant={isToolsSupported && !stream && weatherTool ? "outline" : "secondary"} size="icon" $rounded title="Prever Clima" onClick={toggleWeather} disabled={!isToolsSupported || stream || loading}>
                    {isToolsSupported && !stream ? <Cloud size={16} /> : <CloudOff size={16} />}
                  </Button>
                  <Button variant={isToolsSupported && !stream && criptoTool ? "outline" : "secondary"} size="icon" $rounded title="Cripto (Beta)" onClick={toggleCripto} disabled={!isToolsSupported || stream || loading}>
                    {isToolsSupported && !stream ? <Bitcoin size={16} /> : <CircleOff size={16} />}
                  </Button>
                  <Button variant={isToolsSupported && !stream && genshinTool ? "outline" : "secondary"} size="icon" $rounded title="Genshin Impact (Beta)" onClick={toggleGenshin} disabled={!isToolsSupported || stream || loading}>
                    {isToolsSupported && !stream ? <Gamepad2 size={16} /> : <Gamepad size={16} />}
                  </Button>
                  <Button variant={isToolsSupported && !stream && pokedexTool ? "outline" : "secondary"} size="icon" $rounded title="Pokedex (Beta)" onClick={togglePokedex} disabled={!isToolsSupported || stream || loading}>
                    {isToolsSupported && !stream ? <Smartphone size={16} /> : <Smartphone size={16} />}
                  </Button>
                  <Button variant={isToolsSupported && !stream && nasaTool ? "outline" : "secondary"} size="icon" $rounded title="NASA APOD" onClick={toggleNasa} disabled={!isToolsSupported || stream || loading}>
                    <Rocket size={16} />
                  </Button>
                </div>
              )}
            </div>
          )}
          <Button variant={stream ? "gradient-purple" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={browserTool || httpTool || wikiTool || newsTool || weatherTool || genshinTool || pokedexTool || loading}>
            <AudioWaveform size={16} />
          </Button>
          <Button variant={listening ? "gradient-red" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir"} onClick={toggleListening} disabled={loading}>
            {listening ? <Mic size={16} /> : <MicOff size={16} />}
          </Button>
          <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading}>
            <MessageCirclePlus size={16} />
          </Button>
          {/* <div className="relative"> Não apague esse comentário
            <Button hidden variant="secondary" size="icon" $rounded title="Mais Opções" onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} disabled={loading}>
              <MoreVertical size={16} />
            </Button>
            {isMoreMenuOpen && (
              <div className="absolute z-20 left-0 bottom-full mb-4 p-2 rounded-lg shadow-lg bg-lightBg-primary dark:bg-darkBg-primary opacity-80 dark:opacity-90 border border-bLight dark:border-bDark flex flex-col gap-2">
              </div>
            )}
          </div> */}
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
            {!loading && <SendHorizontal size={16} />}
          </Button>
        </div>
      </div>
      <div className="w-full hidden sm:flex items-center gap-2">
        <Button variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Groq" : "OpenRouter"} disabled={loading}>
          <Brain size={16} />
        </Button>
        <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}>
          <Settings size={16} />
        </Button>
        <Button variant="secondary" size="icon" $rounded title="Analisar Página Atual" onClick={onAnalyzePage} disabled={loading}>
          <ScanText size={16} />
        </Button>
        <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={isImageSupported === false || aiProvider === "groq" || loading}>
          {isImageSupported && aiProvider === "openrouter" ? <ImagePlus size={16} /> : <ImageOff size={16} />}
        </Button>
        {aiKey.length > 0 && (
          <div className="relative">
            <Button variant={isToolsOpen ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={() => setIsToolsOpen(!isToolsOpen)} disabled={loading}>
              <Wrench size={16} />
            </Button>
            {isToolsOpen && (
              <div className="absolute z-20 p-2 rounded-lg shadow-lg bg-lightBg-primary dark:bg-darkBg-primary opacity-80 dark:opacity-90 border border-bLight dark:border-bDark grid grid-cols-5 sm:grid-cols-7 gap-2 w-max left-1/2 -translate-x-1/2 bottom-full mb-4">
                <Button variant={isToolsSupported && aiProvider === "openrouter" && web ? "outline" : "secondary"} size="icon" $rounded title="Pesquisa Profunda" onClick={toggleWeb} disabled={!isToolsSupported || aiProvider === "groq" || loading}>
                  {isToolsSupported && aiProvider === "openrouter" ? <Globe size={16} /> : <GlobeLock size={16} />}
                </Button>
                <Button variant={isToolsSupported && !stream && browserTool ? "outline" : "secondary"} size="icon" $rounded title="Acessar Site Específico" onClick={toggleBrowser} disabled={!isToolsSupported || stream || loading}>
                  {isToolsSupported && !stream ? <Link2 size={16} /> : <Link2Off size={16} />}
                </Button>
                <Button variant={isToolsSupported && !stream && httpTool ? "outline" : "secondary"} size="icon" $rounded title="Requisição HTTP" onClick={toggleHttp} disabled={!isToolsSupported || stream || loading}>
                  {isToolsSupported && !stream ? <Server size={16} /> : <ServerOff size={16} />}
                </Button>
                <Button variant={isToolsSupported && !stream && wikiTool ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar na Wikipédia" onClick={toggleWiki} disabled={!isToolsSupported || stream || loading}>
                  {isToolsSupported && !stream ? <BookOpen size={16} /> : <BookAlert size={16} />}
                </Button>
                <Button variant={isToolsSupported && !stream && newsTool ? "outline" : "secondary"} size="icon" $rounded title="Buscar Notícias" onClick={toggleNews} disabled={!isToolsSupported || stream || loading}>
                  {isToolsSupported && !stream ? <Newspaper size={16} /> : <Shredder size={16} />}
                </Button>
                <Button variant={isToolsSupported && !stream && weatherTool ? "outline" : "secondary"} size="icon" $rounded title="Prever Clima" onClick={toggleWeather} disabled={!isToolsSupported || stream || loading}>
                  {isToolsSupported && !stream ? <Cloud size={16} /> : <CloudOff size={16} />}
                </Button>
                <Button variant={isToolsSupported && !stream && criptoTool ? "outline" : "secondary"} size="icon" $rounded title="Cripto (Beta)" onClick={toggleCripto} disabled={!isToolsSupported || stream || loading}>
                  {isToolsSupported && !stream ? <Bitcoin size={16} /> : <CircleOff size={16} />}
                </Button>
                <Button variant={isToolsSupported && !stream && genshinTool ? "outline" : "secondary"} size="icon" $rounded title="Genshin Impact (Beta)" onClick={toggleGenshin} disabled={!isToolsSupported || stream || loading}>
                  {isToolsSupported && !stream ? <Gamepad2 size={16} /> : <Gamepad size={16} />}
                </Button>
                <Button variant={isToolsSupported && !stream && pokedexTool ? "outline" : "secondary"} size="icon" $rounded title="Pokedex (Beta)" onClick={togglePokedex} disabled={!isToolsSupported || stream || loading}>
                  {isToolsSupported && !stream ? <Smartphone size={16} /> : <Smartphone size={16} />}
                </Button>
                <Button variant={isToolsSupported && !stream && nasaTool ? "outline" : "secondary"} size="icon" $rounded title="NASA APOD" onClick={toggleNasa} disabled={!isToolsSupported || stream || loading}>
                  <Rocket size={16} />
                </Button>
              </div>
            )}
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
          <Button variant={stream ? "gradient-purple" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={newsTool || weatherTool || wikiTool || browserTool || genshinTool || httpTool || loading}>
            <AudioWaveform size={16} />
          </Button>
          <Button variant={listening ? "gradient-red" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir"} onClick={toggleListening} disabled={loading}>
            {listening ? <Mic size={16} /> : <MicOff size={16} />}
          </Button>
          <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading}>
            <MessageCirclePlus size={16} />
          </Button>
        </div>
        <Button variant="gradient-rainbow" size="icon" $rounded title="Enviar" onClick={() => { setListening(false); onSendMessage() }} loading={loading} disabled={loading || (!userPrompt.trim() && imageCount === 0)}>
          {!loading && <SendHorizontal size={16} />}
        </Button>
      </div>
    </Paper>
  )
}

export default SidePanelAIBar
