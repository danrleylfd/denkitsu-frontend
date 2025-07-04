import { LuSettings, LuSendHorizontal, LuImagePlus, LuGlobe, LuBinary } from "react-icons/lu"
import PromptInput from "./PromptInput"
import Button from "./Button"
import Paper from "./Paper"

const ChatInput = ({ userPrompt, setUserPrompt, onAddImage, imageCount, web, toggleWeb, stream, toggleStream, onSendMessage, toggleSettings, loading }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }
  return (
    <Paper className="bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 w-[95%] mb-2 mx-auto">
      <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Stream" onClick={toggleStream} disabled={loading}>
        <LuBinary size={16} />
      </Button>
      <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}>
        <LuSettings size={16} />
      </Button>
      <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={loading}>
        <LuImagePlus size={16} />
      </Button>
      <Button variant={web ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar na Web" onClick={toggleWeb} disabled={loading}>
        <LuGlobe size={16} />
      </Button>
      <PromptInput userPrompt={userPrompt} setUserPrompt={setUserPrompt} handleKeyDown={handleKeyDown} loading={loading} />
      <Button size="icon" $rounded title="Enviar" onClick={onSendMessage} loading={loading} disabled={loading || (!userPrompt.trim() && imageCount === 0)}>
        {!loading && <LuSendHorizontal size={16} />}
      </Button>
    </Paper>
  )
}

export default ChatInput
