import { useRef, useState, useEffect } from "react"
import { LuPlay, LuPause, LuVolume2, LuVolumeX, LuExpand, LuRefreshCw } from "react-icons/lu"

const CustomVideoPlayer = ({ src = "https://www.w3schools.com/html/mov_bbb.mp4", poster = "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217" }) => {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [muted, setMuted] = useState(() => localStorage.getItem("muted") === "true")
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem("volume")
    if (savedVolume !== null) return parseFloat(savedVolume)
    return 1
  })
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  useEffect(() => {
    localStorage.setItem("muted", muted)
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])
  useEffect(() => {
    localStorage.setItem("repeat", muted)
    if (videoRef.current) videoRef.current.repeat = repeat
  }, [repeat])
  useEffect(() => {
    localStorage.setItem("volume", volume)
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
    return () => video?.removeEventListener("ended", handleEnded)
  }, [])
  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setPlaying(true)
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }
  const toggleRepeat = () => {
    if(!videoRef.current) return
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
  const handleSeek = (e) => {
    if (!videoRef.current) return
    const newTime = parseFloat(e.target.value)
    videoRef.current.currentTime = newTime
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
    if (!videoRef.current) return
    if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen()
  }
  return (
    <div className="relative w-full sm:max-w-lg md:max-w-xl overflow-hidden rounded-2xl shadow-lg">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-auto min-w-[45rem] w-full max-w-[45rem] cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      >Seu navegador não suporta o elemento de vídeo.</video>
      <div className="absolute bottom-0 left-0 z-10 w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-dark-textPrimary">
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
            {playing ? <LuPause size={20} /> : <LuPlay size={20} />}
          </button>
          <button onClick={toggleRepeat} className={`transition-transform hover:scale-110 ${repeat ? "text-primary-base" : "text-dark-textPrimary"}`}>
            <LuRefreshCw size={20} />
          </button>
          <div
            className="group relative flex items-center gap-2"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button onClick={toggleMute} className="transition-transform hover:scale-110">
              {muted || volume === 0 ? <LuVolumeX size={20} /> : <LuVolume2 size={20} />}
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
          <div className="flex-1" />
          <button onClick={handleFullscreen} className="transition-transform hover:scale-110">
            <LuExpand size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomVideoPlayer
