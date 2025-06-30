import { useRef, useState, useEffect } from "react"
import { LuPlay, LuPause, LuVolume2, LuVolumeX, LuExpand, LuRefreshCw } from "react-icons/lu"

const Player = ({ src = "https://www.w3schools.com/html/mov_bbb.mp4", poster = "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217" }) => {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [muted, setMuted] = useState(() => localStorage.getItem("@Denkitsu:muted") === "true")
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem("@Denkitsu:volume")
    if (savedVolume !== null) return parseFloat(savedVolume)
    return 1
  })
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
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
    <div className="relative w-full overflow-hidden rounded-lg shadow-[6px_6px_16px_rgba(0,0,0,0.5)]" data-oid="-8jz:6p">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-auto sm:min-w-[45rem] w-full cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        data-oid="i.d0olj">
        Seu navegador não suporta o elemento de vídeo.
      </video>
      <div className="absolute bottom-0 left-0 z-10 w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-darkFg-primary" data-oid=".h3nzl_">
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="relative z-10 mb-2 h-1 w-full accent-primary-base"
          data-oid="6xcq-lo"
        />

        <div className="relative z-10 flex items-center gap-4" data-oid="-dh8a.i">
          <button onClick={togglePlay} className="transition-transform hover:scale-110" data-oid="dwdj84d">
            {playing ? <LuPause size={20} data-oid="qu8z.8r" /> : <LuPlay size={20} data-oid="k2nsfrb" />}
          </button>
          <button onClick={toggleRepeat} className={`transition-transform hover:scale-110 ${repeat ? "text-primary-base" : "text-darkFg-primary"}`} data-oid="o3fhazm">
            <LuRefreshCw size={20} data-oid="9m7uvy9" />
          </button>
          <div
            className="group relative flex items-center gap-2"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
            data-oid="i8dg_ee">
            <button onClick={toggleMute} className="transition-transform hover:scale-110" data-oid="skx2ftk">
              {muted || volume === 0 ? <LuVolumeX size={20} data-oid="qik0x_a" /> : <LuVolume2 size={20} data-oid="t0h73rd" />}
            </button>
            <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 overflow-hidden" data-oid=":b7ib_9">
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
                data-oid="cr9t.-n"
              />
            </div>
          </div>
          <div className="flex-1" data-oid="5mhk388" />
          <button onClick={handleFullscreen} className="transition-transform hover:scale-110" data-oid="rw_jab2">
            <LuExpand size={20} data-oid="2_v06:y" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Player
