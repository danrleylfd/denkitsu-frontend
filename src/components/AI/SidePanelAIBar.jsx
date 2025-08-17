import { LogIn, UserPlus, Settings, Send, ImagePlus, Wrench, Speech, AudioWaveform, AudioLines, FileAudio, Waypoints, MessageCirclePlus, Mic, ScanText, Lock, Sparkle } from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"

import AIInput from "./Input"
import AIAudio from "./Audio"

import Paper from "../Paper"
import Button from "../Button"

const SidePanelAIBar = ({ loading, isImproving, improvePrompt, onAddImage, imageCount, onSendMessage, toggleSettingsDoor, agentsDoor, toggleAgentsDoor, toolsDoor, toggleToolsDoor, onAnalyzePage }) => {
  const { signed } = useAuth()
  const {
    aiProvider, aiProviderToggle, aiKey,
    userPrompt, setUserPrompt,
    audioFile, setAudioFile, clearHistory,
    model, freeModels, payModels, groqModels,
    stream, toggleStream,
    listening, toggleListening,
    recording, fileInputRef, handleStartRecording,
    handleStopRecording, handleUploadClick, handleFileChange
  } = useAI()

  const allModels = [...freeModels, ...payModels, ...groqModels]
  const selectedModel = allModels.find(m => m.id === model)
  const isImageSupported = selectedModel?.supports_images ?? false

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

  if (!signed) {
    return (
      <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mb-2 mx-auto">
        <Button variant="secondary" size="icon" $rounded disabled>
          <Lock size={16} />
        </Button>
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-lightFg-secondary dark:text-darkFg-secondary">"Faça login ou crie sua conta para conversar."</p>
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
      {audioFile && <AIAudio audioFile={audioFile} setAudioFile={setAudioFile} />}
      <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mb-2 mx-auto">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" style={{ display: "none" }} />
        <div className="w-full flex flex-col gap-2 sm:hidden">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettingsDoor} disabled={loading || isImproving}><Settings size={16} /></Button>
            <Button variant={aiProvider === "groq" ? "orange" : "info"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Provedor: Groq" : "Provedor: OpenRouter"} disabled={loading || isImproving}><Waypoints size={16} /></Button>
            <Button variant={agentsDoor ? "outline" : "secondary"} size="icon" $rounded title="Agentes" onClick={toggleAgentsDoor}><Speech size={16} /></Button>
            <Button variant={toolsDoor ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={toggleToolsDoor} disabled={aiKey.length === 0}><Wrench size={16} /></Button>
            <Button variant="secondary" size="icon" $rounded title="Analisar Página Atual" onClick={onAnalyzePage} disabled={loading || isImproving}><ScanText size={16} /></Button>
            <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={isImageSupported === false || aiProvider === "groq" || loading || isImproving}><ImagePlus size={16} /></Button>
            <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={loading || isImproving}><AudioWaveform size={16} /></Button>
            <Button variant={listening ? "mic" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir (Ditado)"} onClick={toggleListening} disabled={loading || isImproving || recording}><Mic size={16} /></Button>
            <Button variant={recording ? "mic" : "secondary"} size="icon" $rounded title={recording ? "Parar Gravação" : "Gravar Áudio"} onClick={recording ? handleStopRecording : handleStartRecording} disabled={loading || isImproving || listening && !recording}><AudioLines size={16} /></Button>
            <Button variant="secondary" size="icon" $rounded title="Upload de Áudio" onClick={handleUploadClick} disabled={loading || isImproving || listening || recording}><FileAudio size={16} /></Button>
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
          <Button variant="secondary" size="icon" $rounded title="Analisar Página Atual" onClick={onAnalyzePage} disabled={loading || isImproving}><ScanText size={16} /></Button>
          <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={isImageSupported === false || aiProvider === "groq" || loading || isImproving}><ImagePlus size={16} /></Button>
          <AIInput id="prompt-input-desktop" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} className="resize-y" disabled={loading || isImproving} />
          <div className="flex items-center gap-2">
            <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={loading || isImproving}><AudioWaveform size={16} /></Button>
            <Button variant={listening ? "mic" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir (Ditado)"} onClick={toggleListening} disabled={loading || isImproving || recording}><Mic size={16} /></Button>
            <Button variant={recording ? "mic" : "secondary"} size="icon" $rounded title={recording ? "Parar Gravação" : "Gravar Áudio"} onClick={recording ? handleStopRecording : handleStartRecording} disabled={loading || isImproving || listening && !recording}><AudioLines size={16} /></Button>
            <Button variant="secondary" size="icon" $rounded title="Upload de Áudio" onClick={handleUploadClick} disabled={loading || isImproving || listening || recording}><FileAudio size={16} /></Button>
            <Button variant="outline" size="icon" $rounded title="Aperfeiçoar Prompt" onClick={improvePrompt} loading={isImproving} disabled={loading || isImproving || !userPrompt.trim()}>{!isImproving && <Sparkle size={16} />}</Button>
            <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading || isImproving}><MessageCirclePlus size={16} /></Button>
          </div>
          <Button variant="primary" size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loading} disabled={loading || isImproving || (!userPrompt.trim() && imageCount === 0 && !audioFile)}>{!loading && <Send size={16} />}</Button>
        </div>
      </Paper>
    </>
  )
}

export default SidePanelAIBar
