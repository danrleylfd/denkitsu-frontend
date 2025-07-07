import { LuSettings, LuSendHorizontal, LuImagePlus, LuGlobe, LuGlobeLock, LuBinary, LuBrain } from "react-icons/lu"
import { MdClearAll } from "react-icons/md"

import { useAI } from "../contexts/AIContext"

import PromptInput from "./PromptInput"
import Button from "./Button"
import Paper from "./Paper"

const ChatInput = ({ userPrompt, setUserPrompt, onAddImage, imageCount, web, toggleWeb, stream, toggleStream, onSendMessage, clearHistory, toggleSettings, loading }) => {
  const { aiProvider, aiProviderToggle } = useAI()
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }
  return (
    <Paper className="bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mb-2 mx-auto">
      <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}>
        <LuSettings size={16} />
      </Button>
      <Button variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Groq" : "OpenRouter"}>
        <LuBrain size={16} />
      </Button>
      <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={loading}>
        <LuImagePlus size={16} />
      </Button>
      <Button variant={aiProvider === "openrouter" ? web ? "secondary" : "outline" } size="icon" $rounded title="Pesquisar na Web" onClick={toggleWeb} disabled={aiProvider === "groq" || loading}>
        {aiProvider === "openrouter" ? <LuGlobe size={16} /> : <LuGlobeLock size={16} />}
      </Button>
      <PromptInput userPrompt={userPrompt} setUserPrompt={setUserPrompt} handleKeyDown={handleKeyDown} loading={loading} />
      <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Stream" onClick={toggleStream} disabled={loading}>
        <LuBinary size={16} />
      </Button>
      <Button variant="danger" size="icon" $rounded title="Apagar Conversa" onClick={clearHistory} disabled={loading}>
        <MdClearAll size={16} />
      </Button>
      <Button size="icon" $rounded title="Enviar" onClick={onSendMessage} loading={loading} disabled={loading || (!userPrompt.trim() && imageCount === 0)}>
        {!loading && <LuSendHorizontal size={16} />}
      </Button>
    </Paper>
  )
}

export default ChatInput
