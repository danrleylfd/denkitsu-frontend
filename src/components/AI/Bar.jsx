import { Info, Waypoints, Settings, Speech, Sparkle, MessageCirclePlus, Send, Paperclip, Wrench, Factory } from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"
import { useModels } from "../../contexts/ModelContext"

import AIBarSignOut from "./BarSignOut"
import Paper from "../Paper"
import AIInput from "./Input"
import Button from "../Button"

const AIBar = ({ improvePrompt, imageCount, onSendMessage, toggleFeaturesDoor, toggleSettingsDoor, toggleFactoryManagerDoor, agentsDoor, toggleAgentsDoor, toolsDoor, toggleToolsDoor, mediaDoor, toggleMediaDoor }) => {
  const { signed } = useAuth()
  if (!signed) return <AIBarSignOut />
  const { loadingMessages, isImproving, userPrompt, setUserPrompt, clearHistory } = useAI()
  const { aiProvider, aiProviderToggle } = useModels()

  const handleSendMessage = () => {
    if (loadingMessages || isImproving) return
    if (!userPrompt.trim() && imageCount === 0) return
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
          <Button variant="secondary" size="icon" $rounded title="Recursos" onClick={toggleFeaturesDoor}><Info size={16} /></Button>
          <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettingsDoor} disabled={loadingMessages || isImproving}><Settings size={16} /></Button>
          <Button variant={aiProvider === "groq" ? "orange" : "info"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Provedor: Groq" : "Provedor: OpenRouter"} disabled={loadingMessages || isImproving}><Waypoints size={16} /></Button>
          <Button variant={mediaDoor ? "outline" : "secondary"} size="icon" $rounded title="Mídia" onClick={toggleMediaDoor}><Paperclip size={16} /></Button>
          <Button variant={agentsDoor ? "outline" : "secondary"} size="icon" $rounded title="Agentes" onClick={toggleAgentsDoor}><Speech size={16} /></Button>
          <Button variant={toolsDoor ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={toggleToolsDoor}><Wrench size={16} /></Button>
          <Button variant="secondary" size="icon" $rounded title="Fábrica de Agentes e Ferramentas" onClick={toggleFactoryManagerDoor} disabled={loadingMessages || isImproving}><Factory size={16} /></Button>
          <Button variant="outline" size="icon" $rounded title="Aperfeiçoar Prompt" onClick={improvePrompt} loading={isImproving} disabled={loadingMessages || isImproving || !userPrompt.trim()}>{!isImproving && <Sparkle size={16} />}</Button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loadingMessages || isImproving}><MessageCirclePlus size={16} /></Button>
          <AIInput id="prompt-input-mobile" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} className="resize-y" disabled={loadingMessages || isImproving} />
          <Button size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loadingMessages} disabled={loadingMessages || isImproving || (!userPrompt.trim() && imageCount === 0)}>{!loadingMessages && <Send size={16} />}</Button>
        </div>
      </div>
      <div className="w-full hidden md:flex items-center gap-2">
        <Button variant="secondary" size="icon" $rounded title="Recursos" onClick={toggleFeaturesDoor}><Info size={16} /></Button>
        <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettingsDoor} disabled={loadingMessages || isImproving}><Settings size={16} /></Button>
        <Button variant={aiProvider === "groq" ? "orange" : "info"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Provedor: Groq" : "Provedor: OpenRouter"} disabled={loadingMessages || isImproving}><Waypoints size={16} /></Button>
        <Button variant={mediaDoor ? "outline" : "secondary"} size="icon" $rounded title="Mídia" onClick={toggleMediaDoor}><Paperclip size={16} /></Button>
        <Button variant={agentsDoor ? "outline" : "secondary"} size="icon" $rounded title="Agentes" onClick={toggleAgentsDoor}><Speech size={16} /></Button>
        <Button variant={toolsDoor ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={toggleToolsDoor}><Wrench size={16} /></Button>
        <Button variant="secondary" size="icon" $rounded title="Fábrica de Agentes e Ferramentas" onClick={toggleFactoryManagerDoor} disabled={loadingMessages || isImproving}><Factory size={16} /></Button>
        <AIInput id="prompt-input-desktop" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} className="resize-y" disabled={loadingMessages || isImproving} />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" $rounded title="Aperfeiçoar Prompt" onClick={improvePrompt} loading={isImproving} disabled={loadingMessages || isImproving || !userPrompt.trim()}>{!isImproving && <Sparkle size={16} />}</Button>
          <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loadingMessages || isImproving}><MessageCirclePlus size={16} /></Button>
        </div>
        <Button variant="primary" size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loadingMessages} disabled={loadingMessages || isImproving || (!userPrompt.trim() && imageCount === 0)}>{!loadingMessages && <Send size={16} />}</Button>
      </div>
    </Paper>
  )
}

export default AIBar
