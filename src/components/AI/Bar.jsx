import { useState, useEffect, useRef } from "react"
import { Sparkle, Waypoints, Settings, ImagePlus, Wrench, AudioWaveform, AudioLines, Mic, MessageCirclePlus, Send, Speech, FileAudio, } from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"
import { useNotification } from "../../contexts/NotificationContext"

import AIBarSignOut from "./BarSignOut"
import AIAudio from "./Audio"
import Paper from "../Paper"
import AIInput from "./Input"
import Button from "../Button"

const AIBar = ({ loading, isImproving, improvePrompt, onAddImage, imageCount, onSendMessage, toggleSettingsDoor, agentsDoor, toggleAgentsDoor, toolsDoor, toggleToolsDoor }) => {
  const { signed } = useAuth()
  if (!signed) return <AIBarSignOut />
  const {
    aiProvider, aiProviderToggle, aiKey,
    userPrompt, setUserPrompt, audioFile, setAudioFile,
    clearHistory,
    model, freeModels, payModels, groqModels,
    stream, toggleStream,
    listening, setListening, toggleListening,
  } = useAI()
  const { notifyError, notifyInfo } = useNotification()

  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)

  const allModels = [...freeModels, ...payModels, ...groqModels]
  const selectedModel = allModels.find(m => m.id === model)
  const isImageSupported = selectedModel?.supports_images ?? false

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioFile(audioBlob)
        notifyInfo("Gravação pronta para enviar.")
        audioChunksRef.current = []
        stream.getTracks().forEach(track => track.stop())
      }
      mediaRecorderRef.current.start()
      setRecording(true)
    } catch (err) {
      notifyError("Não foi possível acessar o microfone.")
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        notifyError("O arquivo de áudio não pode exceder 25 MB.")
        return
      }
      setAudioFile(file)
    }
    event.target.value = ""
  }

  const handleSendMessage = () => {
    if (loading || isImproving) return
    if (!userPrompt.trim() && imageCount === 0 && !audioFile) return
    onSendMessage()
  }

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Reconhecimento de voz não é suportado neste navegador.")
      return
    }
    const recognition = new window.webkitSpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "pt-BR"
    recognition.onresult = (event) => {
      let finalTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript
      }
      if (finalTranscript) setUserPrompt((prev) => `${prev}${finalTranscript}`)
    }
    recognition.onerror = (event) => {
      console.error(`Erro no reconhecimento de voz: ${event.error}`)
    }
    recognitionRef.current = recognition
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
      }
    }
  }, [setUserPrompt])

  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return
    recognition.onend = () => {
      if (listening) recognition.start()
    }
    if (listening) recognition.start()
    else recognition.stop()
  }, [listening])

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {audioFile && <AIAudio audioFile={audioFile} setAudioFile={setAudioFile} />}
      <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mb-2 mx-auto">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" style={{ display: "none" }} />
        <div className="w-full flex flex-col gap-2 md:hidden">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettingsDoor} disabled={loading}><Settings size={16} /></Button>
            <Button variant={aiProvider === "groq" ? "orange" : "info"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Provedor: Groq" : "Provedor: OpenRouter"} disabled={loading}><Waypoints size={16} /></Button>
            <Button variant={agentsDoor ? "outline" : "secondary"} size="icon" $rounded title="Agentes" onClick={toggleAgentsDoor}><Speech size={16} /></Button>
            <Button variant={toolsDoor ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={toggleToolsDoor} disabled={aiKey.length === 0}><Wrench size={16} /></Button>
            <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={isImageSupported === false || aiProvider === "groq" || loading}><ImagePlus size={16} /></Button>
            <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={loading}><AudioWaveform size={16} /></Button>
            <Button variant={listening ? "mic" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir (Ditado)"} onClick={toggleListening} disabled={loading || recording}><Mic size={16} /></Button>
            <Button variant={recording ? "mic" : "secondary"} size="icon" $rounded title={recording ? "Parar Gravação" : "Gravar Áudio"} onClick={recording ? handleStopRecording : handleStartRecording} disabled={loading || listening && !recording}><AudioLines size={16} /></Button>
            <Button variant="secondary" size="icon" $rounded title="Upload de Áudio" onClick={handleUploadClick} disabled={loading || listening || recording}><FileAudio size={16} /></Button>
            <Button variant="secondary" size="icon" $rounded title="Aperfeiçoar Prompt" onClick={improvePrompt} loading={isImproving} disabled={loading || isImproving || !userPrompt.trim()}><Sparkle size={16} /></Button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading}><MessageCirclePlus size={16} /></Button>
            <AIInput id="prompt-input-mobile" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} className="resize-y" disabled={loading} />
            <Button size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loading} disabled={loading || (!userPrompt.trim() && imageCount === 0 && !audioFile)}>
              {!loading && <Send size={16} />}
            </Button>
          </div>
        </div>
        <div className="w-full hidden md:flex items-center gap-2">
          <Button variant="secondary" size="icon" $rounded title="Configurações" onClick={toggleSettingsDoor} disabled={loading}><Settings size={16} /></Button>
          <Button variant={aiProvider === "groq" ? "orange" : "info"} size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Provedor: Groq" : "Provedor: OpenRouter"} disabled={loading}><Waypoints size={16} /></Button>
          <Button variant={agentsDoor ? "outline" : "secondary"} size="icon" $rounded title="Agentes" onClick={toggleAgentsDoor}><Speech size={16} /></Button>
          <Button variant={toolsDoor ? "outline" : "secondary"} size="icon" title="Ferramentas" $rounded onClick={toggleToolsDoor} disabled={aiKey.length === 0}><Wrench size={16} /></Button>
          <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={isImageSupported === false || aiProvider === "groq" || loading}><ImagePlus size={16} /></Button>
          <AIInput id="prompt-input-desktop" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} className="resize-y" disabled={loading} />
          <div className="flex items-center gap-2">
            <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={loading}><AudioWaveform size={16} /></Button>
            <Button variant={listening ? "mic" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir (Ditado)"} onClick={toggleListening} disabled={loading || recording}><Mic size={16} /></Button>
            <Button variant={recording ? "mic" : "secondary"} size="icon" $rounded title={recording ? "Parar Gravação" : "Gravar Áudio"} onClick={recording ? handleStopRecording : handleStartRecording} disabled={loading || listening && !recording}><AudioLines size={16} /></Button>
            <Button variant="secondary" size="icon" $rounded title="Upload de Áudio" onClick={handleUploadClick} disabled={loading || listening || recording}><FileAudio size={16} /></Button>
            <Button variant="secondary" size="icon" $rounded title="Aperfeiçoar Prompt" onClick={improvePrompt} loading={isImproving} disabled={loading || isImproving || !userPrompt.trim()}><Sparkle size={16} /></Button>
            <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading}><MessageCirclePlus size={16} /></Button>
          </div>
          <Button variant="primary" size="icon" $rounded title="Enviar" onClick={handleSendMessage} loading={loading} disabled={loading || (!userPrompt.trim() && imageCount === 0 && !audioFile)}>
            {!loading && <Send size={16} />}
          </Button>
        </div>
      </Paper>
    </>
  )
}

export default AIBar
