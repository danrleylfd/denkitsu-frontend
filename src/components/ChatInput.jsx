import { LuSettings, LuSendHorizontal, LuImagePlus, LuX, LuGlobe } from "react-icons/lu"
import PromptInput from "./PromptInput"
import Button from "./Button"
import Paper from "./Paper"

const ChatInput = ({ inputText, setInputText, imageUrl, setImageUrl, web, setWeb, handleSendMessage, toggleSettings, loading }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAddImageUrl = () => {
    const url = window.prompt("Cole a URL da imagem:")
    if (url) {
      setImageUrl(url)
    }
  }

  return (
    <Paper className="bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-none">
      <div className="flex items-center gap-2 bg-lightBg-primary dark:bg-darkBg-primary">
        <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}>
          <LuSettings size={16} />
        </Button>
        {imageUrl.length === 0 && <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={handleAddImageUrl} disabled={loading}>
          <LuImagePlus size={16} />
        </Button>}
        {imageUrl.length > 0 && (
          <Button variant="danger" size="icon" $rounded onClick={() => setImageUrl("")}>
            <LuX size={16} />
          </Button>
        )}
        <Button variant={web ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar na Web" onClick={() => setWeb(!web)} disabled={loading}>
          <LuGlobe size={16} />
        </Button>
        <PromptInput inputText={inputText} setInputText={setInputText} handleKeyDown={handleKeyDown} loading={loading} />
        <Button size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loading} disabled={loading || (!inputText.trim() && !Image.url)}>
          {!loading && <LuSendHorizontal size={16} />}
        </Button>
      </div>
    </Paper>
  )
}

export default ChatInput
