import { LogIn, UserPlus, Settings, Send, Paperclip, Wrench, Speech, Waypoints, MessageCirclePlus, Mic, ScanText, Lock, Sparkle, Info, Factory, Store, Server } from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"
import { useModels } from "../../contexts/ModelContext"

import AIInput from "./Input"
import Paper from "../Paper"
import Button from "../Button"

const ExtensionAIBar = ({
  loading,
  isImproving,
  improvePrompt,
  imageCount,
  onSendMessage,
  toggleSettingsDoor,
  agentsDoor,
  toggleAgentsDoor,
  toolsDoor,
  toggleToolsDoor,
  onAnalyzePage,
  toggleFeaturesDoor,
  toggleFactoryManagerDoor,
  mediaDoor,
  toggleMediaDoor
}) => {
  const { signed } = useAuth()
  const {
    userPrompt,
    setUserPrompt,
    audioFile,
    clearHistory,
    fileInputRef,
    handleFileChange
  } = useAI()
  const { aiProvider, aiProviderToggle } = useModels()

  const handleSendMessage = () => {
    if (loading || isImproving) return
    if (!userPrompt.trim() && imageCount === 0 && !audioFile) return
    onSendMessage()
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  const providerTitle =
    aiProvider === "groq"
      ? "Provedor: Groq"
      : aiProvider === "openrouter"
        ? "Provedor: OpenRouter"
        : "Provedor: Personalizado"

  if (!signed) {
    return (
      <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mb-2 mx-auto">
        <Button variant="secondary" size="icon" $rounded disabled>
          <Lock size={16} />
        </Button>
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-lightFg-secondary dark:text-darkFg-secondary">Faça login ou crie sua conta para conversar.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" $rounded onClick={() => chrome.tabs.create({ url: `https://denkitsu.vercel.app/signup` })}>
              <UserPlus size={16} />
            </Button>
            <Button variant="primary" size="icon" $rounded onClick={() => chrome.tabs.create({ url: `https://denkitsu.vercel.app/signin` })}>
              <LogIn size={16} />
            </Button>
          </div>
        </div>
      </Paper>
    )
  }

  return (
    <>
      <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mb-2 mx-auto">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" style={{ display: "none" }} />
        <div className="w-full flex flex-col gap-2 md:hidden">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Button variant="secondary" size="icon" $rounded title="Recursos" onClick={toggleFeaturesDoor}><Info size={16} /></Button>
            <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettingsDoor} disabled={loading || isImproving}><Settings size={16} /></Button>
            <Button
              variant={aiProvider === "groq" ? "orange" : aiProvider === "openrouter" ? "info" : "success"}
              size="icon"
              $rounded
              onClick={aiProviderToggle}
              title={providerTitle}
              disabled={loading || isImproving}>
              {aiProvider === "custom" ? <Server size={16} /> : <Waypoints size={16} />}
            </Button>
            <Button variant={mediaDoor ? "outline" : "secondary"} size="icon" $rounded title="Mídia" onClick={toggleMediaDoor}><Paperclip size={16} /></Button>
            <Button variant={agentsDoor ? "outline" : "secondary"} size="icon" $rounded title="Agentes" onClick={toggleAgentsDoor}><Speech size={16} /></Button>
            <Button variant={toolsDoor ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={toggleToolsDoor}><Wrench size={16} /></Button>
            <Button variant="secondary" size="icon" $rounded title="Fábrica" onClick={toggleFactoryManagerDoor} disabled={loading || isImproving}><Factory size={16} /></Button>
            <Button variant="secondary" size="icon" $rounded title="Abrir Loja" onClick={() => chrome.tabs.create({ url: "https://denkitsu.vercel.app/store" })}><Store size={16} /></Button>
            <Button variant="outline" size="icon" $rounded title="Aperfeiçoar Prompt" onClick={improvePrompt} loading={isImproving} disabled={loading || isImproving || !userPrompt.trim()}>{!isImproving && <Sparkle size={16} />}</Button>
            <Button variant="secondary" size="icon" $rounded title="Analisar Página" onClick={onAnalyzePage} disabled={loading || isImproving}><ScanText size={16} /></Button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading || isImproving}><MessageCirclePlus size={16} /></Button>
            <AIInput id="prompt-input-mobile" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} className="resize-y" disabled={loading || isImproving} />
            <Button size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loading} disabled={loading || isImproving || (!userPrompt.trim() && imageCount === 0 && !audioFile)}>{!loading && <Send size={16} />}</Button>
          </div>
        </div>
        <div className="w-full hidden md:flex items-center gap-2">
          <Button variant="secondary" size="icon" $rounded title="Recursos" onClick={toggleFeaturesDoor}><Info size={16} /></Button>
          <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettingsDoor} disabled={loading || isImproving}><Settings size={16} /></Button>
          <Button
            variant={aiProvider === "groq" ? "orange" : aiProvider === "openrouter" ? "info" : "success"}
            size="icon"
            $rounded
            onClick={aiProviderToggle}
            title={providerTitle}
            disabled={loading || isImproving}>
            {aiProvider === "custom" ? <Server size={16} /> : <Waypoints size={16} />}
          </Button>
          <Button variant={mediaDoor ? "outline" : "secondary"} size="icon" $rounded title="Mídia" onClick={toggleMediaDoor}><Paperclip size={16} /></Button>
          <Button variant={agentsDoor ? "outline" : "secondary"} size="icon" $rounded title="Agentes" onClick={toggleAgentsDoor}><Speech size={16} /></Button>
          <Button variant={toolsDoor ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={toggleToolsDoor}><Wrench size={16} /></Button>
          <Button variant="secondary" size="icon" $rounded title="Fábrica" onClick={toggleFactoryManagerDoor} disabled={loading || isImproving}><Factory size={16} /></Button>
          <Button variant="secondary" size="icon" $rounded title="Abrir Loja" onClick={() => chrome.tabs.create({ url: "https://denkitsu.vercel.app/store" })}><Store size={16} /></Button>
          <AIInput id="prompt-input-desktop" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} className="resize-y" disabled={loading || isImproving} />
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" $rounded title="Analisar Página" onClick={onAnalyzePage} disabled={loading || isImproving}><ScanText size={16} /></Button>
            <Button variant="outline" size="icon" $rounded title="Aperfeiçoar Prompt" onClick={improvePrompt} loading={isImproving} disabled={loading || isImproving || !userPrompt.trim()}>{!isImproving && <Sparkle size={16} />}</Button>
            <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading || isImproving}><MessageCirclePlus size={16} /></Button>
          </div>
          <Button variant="primary" size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loading} disabled={loading || isImproving || (!userPrompt.trim() && imageCount === 0 && !audioFile)}>{!loading && <Send size={16} />}</Button>
        </div>
      </Paper>
    </>
  )
}

export default ExtensionAIBar