import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  LogIn, UserPlus,
  Settings, SendHorizontal, ImagePlus, ImageOff, Globe, GlobeLock, Newspaper, Shredder, Cloud, CloudOff,
  AudioLines, Brain, MessageCirclePlus, BookOpen, BookAlert, Link2, Link2Off, Wrench, Gamepad, Gamepad2,
  Lock
} from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"

import Paper from "../Paper"
import AIInput from "./Input"
import Button from "../Button"

const AIBar = ({ userPrompt, setUserPrompt, onAddImage, imageCount, onSendMessage, clearHistory, toggleSettings, loading }) => {
  const { signed } = useAuth()
  const { aiProvider, aiProviderToggle, aiKey, model, freeModels, payModels, groqModels, stream, toggleStream, web, toggleWeb, newsTool, toggleNews, weatherTool, toggleWeather, wikiTool, toggleWiki, browseTool, toggleBrowse, genshinTool, toggleGenshin } = useAI()

  const [isToolsOpen, setIsToolsOpen] = useState(false)

  const toolsDropdownRef = useRef(null)
  const toolsTriggerRef = useRef(null)

  const allModels = [...freeModels, ...payModels, ...groqModels]
  const selectedModel = allModels.find(m => m.id === model)
  const isImageSupported = selectedModel?.supports_images ?? false
  const isToolsSupported = selectedModel?.supports_tools ?? false

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

  if (!signed) {
    return (
      <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mt-2 mx-auto">
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
      <Button variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Groq" : "OpenRouter"} disabled={loading}>
        <Brain size={16} />
      </Button>
      <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}>
        <Settings size={16} />
      </Button>
      <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={!isImageSupported || aiProvider === "groq" || loading}>
        {isImageSupported && aiProvider === "openrouter" ? <ImagePlus size={16} /> : <ImageOff size={16} />}
      </Button>

      {aiKey.length > 0 && (
        <div className="relative">
          <Button ref={toolsTriggerRef} variant="secondary" size="icon" title="Ferramentas" $rounded onClick={() => setIsToolsOpen(!isToolsOpen)} disabled={!isToolsSupported || aiProvider === "groq" || stream || loading}>
            <Wrench size={16} />
          </Button>

          {isToolsOpen && (
            <div
              ref={toolsDropdownRef}
              className={`absolute z-20 p-2 rounded-lg shadow-lg bg-lightBg-primary dark:bg-darkBg-primary opacity-80 dark:opacity-90 border border-bLight dark:border-bDark grid grid-cols-7 gap-2 w-max left-1/2 -translate-x-1/2 bottom-full mb-4`}
            >
              <Button variant={isToolsSupported && aiProvider === "openrouter" && web ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar na Web" onClick={toggleWeb} disabled={!isToolsSupported || aiProvider === "groq" || loading}>
                {isToolsSupported && aiProvider === "openrouter" ? <Globe size={16} /> : <GlobeLock size={16} />}
              </Button>
              <Button variant={isToolsSupported && aiProvider === "openrouter" && !stream && browseTool ? "outline" : "secondary"} size="icon" $rounded title="Navegar em Links" onClick={toggleBrowse} disabled={!isToolsSupported || aiProvider === "groq" || stream || loading}>
                {isToolsSupported && aiProvider === "openrouter" && !stream ? <Link2 size={16} /> : <Link2Off size={16} />}
              </Button>
              <Button variant={isToolsSupported && aiProvider === "openrouter" && !stream && wikiTool ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar na Wikipédia" onClick={toggleWiki} disabled={!isToolsSupported || aiProvider === "groq" || stream || loading}>
                {isToolsSupported && aiProvider === "openrouter" && !stream ? <BookOpen size={16} /> : <BookAlert size={16} />}
              </Button>
              <Button variant={isToolsSupported && aiProvider === "openrouter" && !stream && newsTool ? "outline" : "secondary"} size="icon" $rounded title="Buscar Notícias" onClick={toggleNews} disabled={!isToolsSupported || aiProvider === "groq" || stream || loading}>
                {isToolsSupported && aiProvider === "openrouter" && !stream ? <Newspaper size={16} /> : <Shredder size={16} />}
              </Button>
              <Button variant={isToolsSupported && aiProvider === "openrouter" && !stream && weatherTool ? "outline" : "secondary"} size="icon" $rounded title="Prever Clima" onClick={toggleWeather} disabled={!isToolsSupported || aiProvider === "groq" || stream || loading}>
                {isToolsSupported && aiProvider === "openrouter" && !stream ? <Cloud size={16} /> : <CloudOff size={16} />}
              </Button>
              <Button variant={isToolsSupported && aiProvider === "openrouter" && !stream && genshinTool ? "outline" : "secondary"} size="icon" $rounded title="Genshin Impact" onClick={toggleGenshin} disabled={!isToolsSupported || aiProvider === "groq" || stream || loading}>
                {isToolsSupported && aiProvider === "openrouter" && !stream ? <Gamepad size={16} /> : <Gamepad2 size={16} />}
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
      <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={newsTool || weatherTool || wikiTool || browseTool || genshinTool || loading}>
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
