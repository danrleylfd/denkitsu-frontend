import { LuSettings, LuSendHorizontal } from "react-icons/lu"
import PromptInput from "./PromptInput"
import Button from "./Button"
import Paper from "./Paper"

const ChatInput = ({ inputText, setInputText, handleSendMessage, toggleSettings, loading }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Paper className="bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-none">
      <div className="flex items-center gap-2 bg-lightBg-primary dark:bg-darkBg-primary">
        <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading}>
          <LuSettings size={16} />
        </Button>
        <PromptInput inputText={inputText} setInputText={setInputText} handleKeyDown={handleKeyDown} loading={loading} />

        <Button size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loading} disabled={loading || !inputText.trim()}>
          {!loading && <LuSendHorizontal size={16} />}
        </Button>
      </div>
    </Paper>
  )
}

export default ChatInput
