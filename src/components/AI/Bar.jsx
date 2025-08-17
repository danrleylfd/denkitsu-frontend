import { Waypoints, Settings, Wrench, Speech, Sparkle, MessageCirclePlus, Send, Paperclip } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"
import AIBarSignOut from "./BarSignOut"
import Paper from "../Paper"
import AIInput from "./Input"
import Button from "../Button"

const AIBar = ({ loading, isImproving, improvePrompt, imageCount, onSendMessage, toggleSettingsDoor, agentsDoor, toggleAgentsDoor, toolsDoor, toggleToolsDoor, mediaDoor, toggleMediaDoor }) => {
  const { signed } = useAuth()
  if (!signed) return <AIBarSignOut />
  const {
    aiProvider, aiProviderToggle, aiKey, userPrompt, setUserPrompt, audioFile, clearHistory
  } = useAI()

  const handleSendMessage = () => {
    if (loading || isImproving) return
    if (!userPrompt.trim() && imageCount === 0 && !audioFile) return
    onSendMessage()
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
      <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mb-2 mx-auto">
        <div className="w-full flex flex-col gap-2 md:hidden">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettingsDoor} disabled={loading || isImproving}><Settings size={16} /></Button>
            <Button variant={aiProvider === "groq" ? "orange" : "info"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Provedor: Groq" : "Provedor: OpenRouter"} disabled={loading || isImproving}><Waypoints size={16} /></Button>
            <Button variant={agentsDoor ? "outline" : "secondary"} size="icon" $rounded title="Agentes" onClick={toggleAgentsDoor}><Speech size={16} /></Button>
            <Button variant={toolsDoor ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={toggleToolsDoor} disabled={aiKey.length === 0}><Wrench size={16} /></Button>
            <Button variant={mediaDoor ? "outline" : "secondary"} size="icon" $rounded title="Mídia" onClick={toggleMediaDoor} disabled={loading || isImproving}><Paperclip size={16} /></Button>
            <Button variant="outline" size="icon" $rounded title="Aperfeiçoar Prompt" onClick={improvePrompt} loading={isImproving} disabled={loading || isImproving || !userPrompt.trim()}>{!isImproving && <Sparkle size={16} />}</Button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading || isImproving}><MessageCirclePlus size={16} /></Button>
            <AIInput id="prompt-input-mobile" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} className="resize-y" disabled={loading || isImproving} />
            <Button size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loading} disabled={loading || isImproving || (!userPrompt.trim() && imageCount === 0 && !audioFile)}>{!loading && <Send size={16} />}</Button>
          </div>
        </div>
        <div className="w-full hidden md:flex items-center gap-2">
          <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettingsDoor} disabled={loading || isImproving}><Settings size={16} /></Button>
          <Button variant={aiProvider === "groq" ? "orange" : "info"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Provedor: Groq" : "Provedor: OpenRouter"} disabled={loading || isImproving}><Waypoints size={16} /></Button>
          <Button variant={agentsDoor ? "outline" : "secondary"} size="icon" $rounded title="Agentes" onClick={toggleAgentsDoor}><Speech size={16} /></Button>
          <Button variant={toolsDoor ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={toggleToolsDoor} disabled={aiKey.length === 0}><Wrench size={16} /></Button>
          <Button variant={mediaDoor ? "outline" : "secondary"} size="icon" $rounded title="Mídia" onClick={toggleMediaDoor} disabled={loading || isImproving}><Paperclip size={16} /></Button>
          <AIInput id="prompt-input-desktop" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} className="resize-y" disabled={loading || isImproving} />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" $rounded title="Aperfeiçoar Prompt" onClick={improvePrompt} loading={isImproving} disabled={loading || isImproving || !userPrompt.trim()}>{!isImproving && <Sparkle size={16} />}</Button>
            <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading || isImproving}><MessageCirclePlus size={16} /></Button>
          </div>
          <Button variant="primary" size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loading} disabled={loading || isImproving || (!userPrompt.trim() && imageCount === 0 && !audioFile)}>{!loading && <Send size={16} />}</Button>
        </div>
      </Paper>
  )
}

export default AIBar
