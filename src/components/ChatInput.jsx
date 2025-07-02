import { LuSettings, LuSendHorizontal, LuImagePlus, LuGlobe } from "react-icons/lu"
import PromptInput from "./PromptInput"
import Button from "./Button"
import Paper from "./Paper"

const ChatInput = ({ inputText, setInputText, onAddImage, imageCount, web, setWeb, handleSendMessage, toggleSettings, loading }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Paper className="bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-none flex items-center gap-2">
      <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}>
        <LuSettings size={16} />
      </Button>
      <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={loading}>
        <LuImagePlus size={16} />
      </Button>
      <Button variant={web ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar na Web" onClick={() => setWeb(!web)} disabled={loading}>
        <LuGlobe size={16} />
      </Button>
      <PromptInput inputText={inputText} setInputText={setInputText} handleKeyDown={handleKeyDown} loading={loading} />
      <Button size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loading} disabled={loading || (!inputText.trim() && imageCount === 0)}>
        {!loading && <LuSendHorizontal size={16} />}
      </Button>
    </Paper>
  )
}

export default ChatInput
