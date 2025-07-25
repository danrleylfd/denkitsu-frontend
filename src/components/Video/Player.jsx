import { useRef, useState, useEffect, useCallback } from "react"
import { Play, Pause, Volume2, VolumeX, Expand, RefreshCw, Minimize, Camera } from "lucide-react"

// NOVO: Função para formatar o tempo de segundos para HH:MM:SS ou MM:SS
const formatTime = (timeInSeconds) => {
  const time = Math.round(timeInSeconds)
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = time % 60

  const paddedSeconds = String(seconds).padStart(2, "0")
  const paddedMinutes = String(minutes).padStart(2, "0")

  if (hours > 0) {
    const paddedHours = String(hours).padStart(2, "0")
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`
  }

  return `${paddedMinutes}:${paddedSeconds}`
}


const VideoPlayer = ({ src = "https://www.w3schools.com/html/mov_bbb.mp4", poster = "/thumbnail.png" }) => {
  const videoRef = useRef(null)
  const playerContainerRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  const clickTimeoutRef = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [muted, setMuted] = useState(() => localStorage.getItem("@Denkitsu:muted") === "true")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem("@Denkitsu:volume")
    if (savedVolume !== null) return parseFloat(savedVolume)
    return 1
  })
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  const showControlsTemporarily = useCallback(() => {
    clearTimeout(controlsTimeoutRef.current)
    setControlsVisible(true)
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false)
      }, 2500)
    }
  }, [playing])

  useEffect(() => {
    localStorage.setItem("@Denkitsu:muted", muted)
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])
  useEffect(() => {
    localStorage.setItem("@Denkitsu:repeat", muted)
    if (videoRef.current) videoRef.current.repeat = repeat
  }, [repeat])
  useEffect(() => {
    localStorage.setItem("@Denkitsu:volume", volume)
    if (videoRef.current) videoRef.current.volume = volume
  }, [volume])
  useEffect(() => {
    const handleEnded = () => setPlaying(false)
    const video = videoRef.current
    if (video) {
      video.volume = volume
      video.muted = muted
      video.addEventListener("ended", handleEnded)
    }

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement !== null
      setIsFullscreen(isCurrentlyFullscreen)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
        video?.removeEventListener("ended", handleEnded)
        document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setPlaying(true)
      clearTimeout(controlsTimeoutRef.current)
      setControlsVisible(false)
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }, [])

  const toggleRepeat = () => {
    if (!videoRef.current) return
    const isNowRepeating = !videoRef.current.loop
    videoRef.current.loop = isNowRepeating
    setRepeat(isNowRepeating)
  }
  const toggleMute = () => {
    if (!videoRef.current) return
    const isNowMuted = !videoRef.current.muted
    videoRef.current.muted = isNowMuted
    setMuted(isNowMuted)
  }
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume)
    if (newVolume > 0 && muted) {
      setMuted(false)
    }
  }

  const seek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const handleSeek = (e) => {
    if (!videoRef.current) return
    const newTime = parseFloat(e.target.value)
    seek(newTime)
    setCurrentTime(newTime)
  }
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const handleFullscreen = () => {
    const playerContainer = playerContainerRef.current
    if (!playerContainer) return

    if (!isFullscreen) {
      if (playerContainer.requestFullscreen) {
        playerContainer.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const handleScreenshot = () => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = `screenshot-${new Date().getTime()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleControls = useCallback(() => {
    setControlsVisible(prev => {
      const isNowVisible = !prev
      clearTimeout(controlsTimeoutRef.current)
      if (isNowVisible && playing) {
        controlsTimeoutRef.current = setTimeout(() => {
          setControlsVisible(false)
        }, 2500)
      }
      return isNowVisible
    })
  }, [playing])

  const handleVideoSingleClick = () => {
    clearTimeout(clickTimeoutRef.current)
    clickTimeoutRef.current = setTimeout(() => {
      toggleControls()
    }, 250)
  }

  const handleVideoDoubleClick = () => {
    clearTimeout(clickTimeoutRef.current)
    handleFullscreen()
  }

  const handleKeyDown = useCallback((e) => {
    e.preventDefault()
    showControlsTemporarily()
    switch(e.key) {
      case " ":
        togglePlay()
        break
      case "ArrowRight":
        seek(videoRef.current.currentTime + 5)
        break
      case "ArrowLeft":
        seek(videoRef.current.currentTime - 5)
        break
      case "m":
      case "M":
        toggleMute()
        break
      case "f":
      case "F":
        handleFullscreen()
        break
    }
  }, [togglePlay, showControlsTemporarily])

  return (
    <div
      ref={playerContainerRef}
      tabIndex="0"
      onKeyDown={handleKeyDown}
      className="relative w-full overflow-hidden rounded-lg shadow-[6px_6px_16px_rgba(0,0,0,0.5)] bg-black focus:outline-none aspect-video"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onClick={handleVideoSingleClick}
        onDoubleClick={handleVideoDoubleClick}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}>
        Seu navegador não suporta o elemento de vídeo.
      </video>
      <div
        className={`absolute bottom-0 left-0 z-10 w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-darkFg-primary transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
        onMouseEnter={showControlsTemporarily}
      >
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="relative z-10 mb-2 h-1 w-full accent-primary-base"
        />

        <div className="relative z-10 flex items-center gap-4">
          <button onClick={togglePlay} className="transition-transform hover:scale-110">
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={toggleRepeat} className={`transition-transform hover:scale-110 ${repeat ? "text-primary-base" : "text-darkFg-primary"}`}>
            <RefreshCw size={20} />
          </button>
          <div
            className="group relative flex items-center gap-2"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}>
            <button onClick={toggleMute} className="transition-transform hover:scale-110">
              {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 overflow-hidden">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className={`h-1 origin-left transform accent-primary-base transition-all duration-300 ${
                  showVolumeSlider ? "w-24 scale-x-100 opacity-100" : "w-0 scale-x-0 opacity-0"
                }`}
              />
            </div>
          </div>
            {/* NOVO: Label de tempo adicionada */}
            <span className="text-xs font-mono select-none">
              {`${formatTime(currentTime)} / ${formatTime(duration)} \\ -${formatTime(duration - currentTime)}`}
            </span>
          <div className="flex-1" />
          <button onClick={handleScreenshot} className="transition-transform hover:scale-110">
            <Camera size={20} />
          </button>
          <button onClick={handleFullscreen} className="transition-transform hover:scale-110">
            {isFullscreen ? <Minimize size={20} /> : <Expand size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
