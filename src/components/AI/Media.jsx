import { ImagePlus, AudioWaveform, Mic, AudioLines, FileAudio, Mouse } from "lucide-react"
import { useAI } from "../../contexts/AIContext"
import { useModels } from "../../contexts/ModelContext"
import Paper from "../Paper"
import Button from "../Button"

const AIMedia = ({ mediaDoor, onAddImage }) => {
  if (!mediaDoor) return null
  const {
    stream,
    toggleStream,
    autoScroll,
    toggleAutoScroll,
    listening,
    toggleListening,
    recording,
    handleStartRecording,
    handleStopRecording,
    handleUploadClick,
    loadingMessages,
    isImproving,
  } = useAI()
  const { aiProvider, model, freeModels, payModels, groqModels } = useModels()
  const allModels = [...(freeModels || []), ...(payModels || []), ...(groqModels || [])]
  const selectedModel = allModels.find((m) => m.id === model)
  const isImageSupported = selectedModel?.supports_images ?? false

  return (
    <Paper className="grid grid-cols-[repeat(auto-fit,minmax(2rem,1fr))] gap-2 mx-auto px-4 py-2 justify-center justify-items-center">
      <Button $border={stream ? "outline" : "secondary"} variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={loadingMessages || isImproving}>
        <AudioWaveform size={16} />
      </Button>
      <Button $border={autoScroll ? "outline" : "secondary"} variant={autoScroll ? "outline" : "secondary"} size="icon" $rounded title="Rolagem Automática" onClick={toggleAutoScroll} disabled={loadingMessages || isImproving}>
        <Mouse size={16} />
      </Button>
      <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={isImageSupported === false || aiProvider === "groq" || loadingMessages || isImproving}>
        <ImagePlus size={16} />
      </Button>
      <Button variant={listening ? "mic" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir (Ditado)"} onClick={toggleListening} disabled={loadingMessages || isImproving || recording}>
        <Mic size={16} />
      </Button>
      <Button variant={recording ? "mic" : "secondary"} size="icon" $rounded title={recording ? "Parar Gravação" : "Gravar Áudio"} onClick={recording ? handleStopRecording : handleStartRecording} disabled={loadingMessages || isImproving || (listening && !recording)}>
        <AudioLines size={16} />
      </Button>
      <Button variant="secondary" size="icon" $rounded title="Upload de Áudio" onClick={handleUploadClick} disabled={loadingMessages || isImproving || listening || recording}>
        <FileAudio size={16} />
      </Button>
    </Paper>
  )
}

export default AIMedia
