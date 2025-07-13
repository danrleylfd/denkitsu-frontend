import { Settings, SendHorizontal, ImagePlus, Globe, GlobeLock, Newspaper, Cloud, Binary, Brain, MessageCirclePlus } from "lucide-react"

import { useAI } from "../../contexts/AIContext"

import Paper from "../Paper"
import AIInput from "./Input"
import Button from "../Button"

const AIBar = ({ userPrompt, setUserPrompt, onAddImage, imageCount, onSendMessage, clearHistory, toggleSettings, loading }) => {
  const { aiProvider, aiProviderToggle, aiKey, stream, toggleStream, web, toggleWeb, newsTool, toggleNews, weatherTool, toggleWeather } = useAI()
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }
  return (
    <Paper className="bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mb-2 mx-auto">
      <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}>
        <Settings size={16} />
      </Button>
      <Button variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Groq" : "OpenRouter"} disabled={loading}>
        <Brain size={16} />
      </Button>
      <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={loading}>
        <ImagePlus size={16} />
      </Button>
      {aiKey.length > 0 && (
        <>
          <Button variant={aiProvider === "openrouter" && web ? "outline" : "secondary" } size="icon" $rounded title="Pesquisar na Web" onClick={toggleWeb} disabled={aiProvider === "groq" || loading}>
            {aiProvider === "openrouter" ? <Globe size={16} /> : <GlobeLock size={16} />}
          </Button>
          <Button variant={aiProvider === "openrouter" && !stream && newsTool ? "outline" : "secondary"} size="icon" $rounded title="Buscar Notícias" onClick={toggleNews} disabled={aiProvider === "groq" || stream || loading}>
            <Newspaper size={16} />
          </Button>
          <Button variant={aiProvider === "openrouter" && !stream && weatherTool ? "outline" : "secondary"} size="icon" $rounded title="Previsão do clima" onClick={toggleWeather} disabled={aiProvider === "groq" || stream || loading}>
            <Cloud size={16} />
          </Button>
        </>
      )}
      <AIInput
        id="prompt-input"
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        className="resize-y"
      />
      {aiKey.length > 0 && (
        <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Stream" onClick={toggleStream} disabled={loading}>
          <Binary size={16} />
        </Button>
      )}
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
