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
    <Paper className="bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-none" data-oid="eoht858">
      <div className="flex items-center gap-2 bg-lightBg-primary dark:bg-darkBg-primary" data-oid="j_h_vms">
        <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettings} disabled={loading} data-oid="flbwr1e">
          <LuSettings size={16} data-oid="nzups:_" />
        </Button>
        <PromptInput inputText={inputText} setInputText={setInputText} handleKeyDown={handleKeyDown} loading={loading} data-oid="v87wy7p" />

        <Button size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loading} disabled={loading || !inputText.trim()} data-oid="693j85c">
          {!loading && <LuSendHorizontal size={16} data-oid="fzs8tht" />}
        </Button>
      </div>
    </Paper>
  )
}

export default ChatInput
