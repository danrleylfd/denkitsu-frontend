import { useState, useRef, useEffect, useCallback } from "react"
import { X, Play, Pause, Send } from "lucide-react"

import Paper from "../Paper"
import Button from "../Button"

const formatTime = (time) => {
  if (isNaN(time)) return "00:00"
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

const AIAudio = ({ audioFile, onSend, onCancel }) => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioSrc, setAudioSrc] = useState("")

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile)
      setAudioSrc(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [audioFile])

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime)
  }

  const handleAudioEnd = () => setIsPlaying(false)

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play()
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleSeek = (e) => {
    if (audioRef.current) {
      audioRef.current.currentTime = e.target.value
    }
  }

  return (
    <Paper className="flex items-center justify-between gap-2 px-4 py-2 mb-1 mx-auto">
      <audio
        ref={audioRef}
        src={(audioSrc && audioSrc.length > 0) ? audioSrc : null}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnd}
        hidden
      />
      <div className="flex items-center gap-2 flex-grow min-w-0">
        <Button variant="secondary" size="icon" $rounded title={isPlaying ? "Pausar" : "Ouvir"} onClick={togglePlay}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </Button>
        <div className="flex flex-col flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 accent-primary-base"
            />
            <span className="text-xs font-mono text-lightFg-secondary dark:text-darkFg-secondary">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="danger" size="icon" $rounded title="Cancelar Áudio" onClick={onCancel}>
          <X size={16} />
        </Button>
        <Button variant="primary" size="icon" $rounded title="Enviar Áudio" onClick={onSend}>
          <Send size={16} />
        </Button>
      </div>
    </Paper>
  )
}

export default AIAudio
