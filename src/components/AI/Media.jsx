import { ImagePlus, AudioWaveform, Mic, AudioLines, FileAudio, Mouse } from "lucide-react"

import { useAI } from "../../contexts/AIContext"

import Paper from "../Paper"
import Button from "../Button"

const AIMedia = ({ mediaDoor, onAddImage, loading, isImproving }) => {
  if (!mediaDoor) return null

  const {
    aiProvider,
    model,
    freeModels,
    payModels,
    groqModels,
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
  } = useAI()

  const allModels = [...freeModels, ...payModels, ...groqModels]
  const selectedModel = allModels.find((m) => m.id === model)
  const isImageSupported = selectedModel?.supports_images ?? false

  return (
    <Paper
      className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-1 py-2 gap-2 rounded-lg shadow-lg max-w-[95%]
      grid grid-cols-[repeat(auto-fit,minmax(2rem,1fr))] justify-center justify-items-center mx-auto`}
    >
      <Button variant={stream ? "outline" : "secondary"} size="icon" $rounded title="Streaming" onClick={toggleStream} disabled={loading || isImproving}>
        <AudioWaveform size={16} />
      </Button>
      <Button variant={autoScroll ? "outline" : "secondary"} size="icon" $rounded title="Rolagem Automática" onClick={toggleAutoScroll} disabled={loading || isImproving}>
        <Mouse size={16} />
      </Button>
      <Button variant="secondary" size="icon" $rounded title="Adicionar imagem" onClick={onAddImage} disabled={isImageSupported === false || aiProvider === "groq" || loading || isImproving}>
        <ImagePlus size={16} />
      </Button>
      <Button variant={listening ? "mic" : "secondary"} size="icon" $rounded title={listening ? "Parar de ouvir" : "Ouvir (Ditado)"} onClick={toggleListening} disabled={loading || isImproving || recording}>
        <Mic size={16} />
      </Button>
      <Button variant={recording ? "mic" : "secondary"} size="icon" $rounded title={recording ? "Parar Gravação" : "Gravar Áudio"} onClick={recording ? handleStopRecording : handleStartRecording} disabled={loading || isImproving || (listening && !recording)}>
        <AudioLines size={16} />
      </Button>
      <Button variant="secondary" size="icon" $rounded title="Upload de Áudio" onClick={handleUploadClick} disabled={loading || isImproving || listening || recording}>
        <FileAudio size={16} />
      </Button>
    </Paper>
  )
}

export default AIMedia
