import { Settings, Speech, Sparkle, MessageCirclePlus, Send, Paperclip, Wrench, Factory, Info } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"
import AIBarSignOut from "./BarSignOut"
import Paper from "../Paper"
import TextArea from "../TextArea"
import Button from "../Button"
import ProviderSelector from "./ProviderSelector"

const AIBar = ({ imageCount, onSendMessage, improvePrompt, toggleSettingsDoor, toggleFactoryManagerDoor, agentsDoor, toggleAgentsDoor, toolsDoor, toggleToolsDoor, mediaDoor, toggleMediaDoor, toggleFeaturesDoor }) => {
  const { signed } = useAuth()
  const { userPrompt, setUserPrompt, clearHistory, loadingMessages, isImproving } = useAI()
  if (!signed) return <AIBarSignOut />

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

  const suggestions = ["#browser ", "#duckduckgo ", "#http ", "#cripto ", "#nasa ", "#arquivosnasa ", "#asteroides ", "#terra ", "#marte ", "#climaespaço ", "#climamarte ", "#notícias ", "#clima ", "wikipedia ", "#cinema ", "#jogos ", "#albion ", "#genshin ", "#pokédex "]

  return (
    <Paper className="relative flex max-w-[99%] items-center gap-2 p-2 mb-2 mx-auto">
      <div className="w-full flex flex-col gap-2 md:hidden">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettingsDoor} disabled={loadingMessages || isImproving}><Settings size={16} /></Button>
          <Button variant="secondary" size="icon" $rounded title="Recursos & Novidades" onClick={toggleFeaturesDoor}><Info size={16} /></Button>
          <ProviderSelector disabled={loadingMessages || isImproving} />
          <Button variant={mediaDoor ? "outline" : "secondary"} size="icon" $rounded title="Mídia" onClick={toggleMediaDoor}><Paperclip size={16} /></Button>
          <Button variant={agentsDoor ? "outline" : "secondary"} size="icon" $rounded title="Agentes" onClick={toggleAgentsDoor}><Speech size={16} /></Button>
          <Button variant={toolsDoor ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={toggleToolsDoor}><Wrench size={16} /></Button>
          <Button variant="secondary" size="icon" $rounded title="Fábrica de Agentes e Ferramentas" onClick={toggleFactoryManagerDoor} disabled={loadingMessages || isImproving}><Factory size={16} /></Button>
          <Button variant="outline" size="icon" $rounded title="Aperfeiçoar Prompt" onClick={improvePrompt} loading={isImproving} disabled={loadingMessages || isImproving || !userPrompt.trim()}>{!isImproving && <Sparkle size={16} />}</Button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loadingMessages || isImproving}><MessageCirclePlus size={16} /></Button>
          <TextArea suggestions={suggestions} id="prompt-input-mobile" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} textAreaClassName="flex-1 resize-none h-8 w-full p-2 rounded-md font-mono text-sm" rows={1} disabled={loadingMessages || isImproving} placeholder={!loadingMessages || !isImproving ? "Escreva seu prompt" : "Pensando..."} />
          <Button size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loadingMessages} disabled={loadingMessages || isImproving || (!userPrompt.trim() && imageCount === 0)}>{!loadingMessages && <Send size={16} />}</Button>
        </div>
      </div>
      <div className="w-full hidden md:flex items-center gap-2">
        <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettingsDoor} disabled={loadingMessages || isImproving}><Settings size={16} /></Button>
        <Button variant="secondary" size="icon" $rounded title="Recursos & Novidades" onClick={toggleFeaturesDoor}><Info size={16} /></Button>
        <ProviderSelector disabled={loadingMessages || isImproving} />
        <Button variant={mediaDoor ? "outline" : "secondary"} size="icon" $rounded title="Mídia" onClick={toggleMediaDoor}><Paperclip size={16} /></Button>
        <Button variant={agentsDoor ? "outline" : "secondary"} size="icon" $rounded title="Agentes" onClick={toggleAgentsDoor}><Speech size={16} /></Button>
        <Button variant={toolsDoor ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={toggleToolsDoor}><Wrench size={16} /></Button>
        <Button variant="secondary" size="icon" $rounded title="Fábrica de Agentes e Ferramentas" onClick={toggleFactoryManagerDoor} disabled={loadingMessages || isImproving}><Factory size={16} /></Button>
        <TextArea suggestions={suggestions} id="prompt-input-desktop" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} textAreaClassName="flex-1 resize-none h-8 w-full p-2 rounded-md font-mono text-sm" rows={1} disabled={loadingMessages || isImproving} placeholder={!loadingMessages || !isImproving ? "Escreva seu prompt" : "Pensando..."}/>
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
