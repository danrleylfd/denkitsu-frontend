// src/components/AI/Bar.jsx

import { useState, useEffect, useRef } from "react"
import {
  Settings, SendHorizontal, ImagePlus, ImageOff, Globe, GlobeLock, Newspaper, Shredder, Cloud, CloudOff,
  AudioLines, Brain, MessageCirclePlus, BookOpen, BookAlert, Link2, Link2Off, Wrench // 1. Importar novo ícone
} from "lucide-react"

import { useAI } from "../../contexts/AIContext"

import Paper from "../Paper"
import AIInput from "./Input"
import Button from "../Button"

const AIBar = ({ userPrompt, setUserPrompt, onAddImage, imageCount, onSendMessage, clearHistory, toggleSettings, loading }) => {
  const { aiProvider, aiProviderToggle, aiKey, stream, toggleStream, web, toggleWeb, newsTool, toggleNews, weatherTool, toggleWeather, wikiTool, toggleWiki, browseTool, toggleBrowse } = useAI()

  const [isToolsOpen, setIsToolsOpen] = useState(false)

  const toolsDropdownRef = useRef(null)
  const toolsTriggerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target) &&
        toolsTriggerRef.current && !toolsTriggerRef.current.contains(event.target)
      ) {
        setIsToolsOpen(false)
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

  return (
    <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mb-2 mx-auto">
      <Button variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Groq" : "OpenRouter"} disabled={loading}>
        <Brain size={16} />
      </Button>
      <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}>
        <Settings size={16} />
      </Button>
      <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={aiProvider === "groq" || loading}>
        {aiProvider === "openrouter" ? <ImagePlus size={16} /> : <ImageOff size={16} />}
      </Button>

      {aiKey.length > 0 && (
        <div className="relative">
          <Button ref={toolsTriggerRef} variant="secondary" size="icon" title="Ferramentas" $rounded onClick={() => setIsToolsOpen(!isToolsOpen)} disabled={aiProvider === "groq" || stream || loading}>
            <Wrench size={16} />
          </Button>

          {isToolsOpen && (
            <div
              ref={toolsDropdownRef}
              className={`absolute z-20 p-2 rounded-lg shadow-lg bg-lightBg-primary dark:bg-darkBg-primary opacity-80 dark:opacity-90 border border-bLight dark:border-bDark grid grid-cols-5 gap-2 w-max left-1/2 -translate-x-1/2 bottom-full mb-4`}
            >
              <Button variant={aiProvider === "openrouter" && web ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar na Web" onClick={toggleWeb} disabled={aiProvider === "groq" || loading}>
                {aiProvider === "openrouter" ? <Globe size={16} /> : <GlobeLock size={16} />}
              </Button>
              <Button variant={aiProvider === "openrouter" && !stream && browseTool ? "outline" : "secondary"} size="icon" $rounded title="Navegar em Links" onClick={toggleBrowse} disabled={aiProvider === "groq" || stream || loading}>
                {(aiProvider === "openrouter" && !stream) ? <Link2 size={16} /> : <Link2Off size={16} />}
              </Button>
              <Button variant={aiProvider === "openrouter" && !stream && wikiTool ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar na Wikipédia" onClick={toggleWiki} disabled={aiProvider === "groq" || stream || loading}>
                {(aiProvider === "openrouter" && !stream) ? <BookOpen size={16} /> : <BookAlert size={16} />}
              </Button>
              <Button variant={aiProvider === "openrouter" && !stream && newsTool ? "outline" : "secondary"} size="icon" $rounded title="Buscar Notícias" onClick={toggleNews} disabled={aiProvider === "groq" || stream || loading}>
                {aiProvider === "openrouter" && !stream ? <Newspaper size={16} /> : <Shredder size={16} />}
              </Button>
              <Button variant={aiProvider === "openrouter" && !stream && weatherTool ? "outline" : "secondary"} size="icon" $rounded title="Prever Clima" onClick={toggleWeather} disabled={aiProvider === "groq" || stream || loading}>
                {(aiProvider === "openrouter" && !stream) ? <Cloud size={16} /> : <CloudOff size={16} />}
              </Button>
            </div>
          )}
        </div>
      )}

      <AIInput
        id="prompt-input"
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        className="resize-y"
      />
      <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={newsTool || weatherTool || wikiTool || browseTool || loading}>
        <AudioLines size={16} />
      </Button>
      <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading}>
        <MessageCirclePlus size={16} />
      </Button>
      <Button size="icon" $rounded title="Enviar" onClick={onSendMessage} loading={loading} disabled={loading || (!userPrompt.trim() && imageCount === 0)}>
        {!loading && <SendHorizontal size={16} />}
      </Button>
    </Paper>
  )
}

export default AIBar
