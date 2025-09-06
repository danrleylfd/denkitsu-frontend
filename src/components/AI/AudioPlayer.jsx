import { useState } from "react"

import { playBase64Audio, downloadBase64Audio } from "../../utils/audio"

import Button from "../Button"
import DynamicIcon from "../DynamicIcon"

const AudioPlayer = ({ audioData, format = "wav", className = "" }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePlay = async () => {
    if (isPlaying || isLoading) return

    setIsLoading(true)
    try {
      setIsPlaying(true)
      await playBase64Audio(audioData, format)
    } catch (error) {
      console.error("Erro ao reproduzir áudio:", error)
    } finally {
      setIsPlaying(false)
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    downloadBase64Audio(audioData, `audio-${Date.now()}`, format)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        $rounded
        onClick={handlePlay}
        disabled={isLoading || isPlaying}
        className="flex items-center gap-1"
      >
        <DynamicIcon
          name={isPlaying ? "Volume2" : "Play"}
          className="w-4 h-4 mr-1"
        />
        {isPlaying ? "Reproduzindo..." : (isLoading ? "Carregando..." : "Ouvir")}
      </Button>

      <Button
        variant="secondary"
        size="sm"
        $rounded
        onClick={handleDownload}
        className="flex items-center gap-1"
      >
        <DynamicIcon name="Download" className="w-4 h-4 mr-1" />
        Baixar
      </Button>
    </div>
  )
}

export default AudioPlayer
