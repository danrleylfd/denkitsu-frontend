import { useState, useCallback, memo } from "react"
import { FolderSearch, X, Film, Loader2, AlertTriangle } from "lucide-react"

import { useNotification } from "../contexts/NotificationContext"

import SideMenu from "../components/SideMenu"
import Button from "../components/Button"
import VideoPlayer from "../components/Video/Player"

const ContentView = ({ children }) => (
  <main className="flex-1 w-full h-dvh overflow-y-auto ml-[3.5rem] bg-lightBg-primary dark:bg-darkBg-primary p-4">
    {children}
  </main>
)

const extractVideoThumbnail = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    const url = URL.createObjectURL(file)
    video.muted = true
    video.playsInline = true
    video.crossOrigin = "anonymous"
    video.preload = "metadata"
    video.src = url
    const cleanup = () => {
      URL.revokeObjectURL(url)
      video.remove()
    }
    video.onloadeddata = () => {
      video.currentTime = 1
    }
    video.onseeked = () => {
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.7) // Qualidade de 70%
      cleanup()
      resolve(thumbnailUrl)
    }
    video.onerror = (err) => {
      console.error("Erro no vídeo:", err)
      cleanup()
      reject(new Error("Não foi possível carregar o arquivo de vídeo."))
    }
  })
}

const DvdCover = memo(({ video, onSelect }) => (
  <button
    onClick={() => onSelect(video)}
    className="group relative w-full aspect-[2/3] bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-base/20 focus:outline-none focus:ring-2 focus:ring-primary-base"
  >
    {video.thumbnail === null && (
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-lightFg-tertiary dark:text-darkFg-tertiary animate-spin" />
      </div>
    )}
    {video.thumbnail && video.thumbnail !== "error" && (
      <img src={video.thumbnail} alt={video.name} className="absolute inset-0 w-full h-full object-cover" />
    )}
    {video.thumbnail === "error" && (
       <div className="absolute inset-0 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-danger-base" />
      </div>
    )}
    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
      <p className="font-bold text-white text-sm break-words text-left leading-tight">
        {video.name}
      </p>
    </div>
  </button>
))

const VideoPlayerModal = memo(({ video, onClose }) => {
  if (!video) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-2 bg-lightBg-primary dark:bg-darkBg-primary rounded-lg shadow-2xl w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-bLight dark:border-bDark pt-1 px-2">
          <h5 className="font-bold text-lightFg-primary dark:text-darkFg-primary truncate" title={video.name}>
            {video.name}
          </h5>
          <Button variant="danger" size="icon" $rounded onClick={onClose} title="Fechar Player">
            <X size={16} />
          </Button>
        </div>
        <VideoPlayer src={video.url} />
      </div>
    </div>
  )
})

const Cinema = () => {
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [directoryName, setDirectoryName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { notifyError } = useNotification()

  const handleSelectFolder = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      notifyError("Seu navegador não suporta esta funcionalidade. Tente usar Chrome ou Edge.")
      return
    }
    setIsLoading(true)
    setVideos([])
    setDirectoryName("")
    try {
      const dirHandle = await window.showDirectoryPicker()
      setDirectoryName(dirHandle.name)
      const filesToProcess = []
      const traverseDirectory = async (directoryHandle) => {
        for await (const entry of directoryHandle.values()) {
          if (entry.kind === "file" && entry.name.match(/\.(mp4|webm|mov|mkv|avi)$/i)) {
            filesToProcess.push(await entry.getFile())
          } else if (entry.kind === "directory") {
            await traverseDirectory(entry)
          }
        }
      }
      await traverseDirectory(dirHandle)
      const initialVideos = filesToProcess.map(file => ({
        id: `${file.name}-${file.lastModified}`,
        name: file.name,
        url: URL.createObjectURL(file),
        thumbnail: null,
      })).sort((a, b) => a.name.localeCompare(b.name))
      setVideos(initialVideos)
      setIsLoading(false)
      const CONCURRENT_WORKERS = 4
      const queue = [...filesToProcess]
      const worker = async () => {
        while (queue.length > 0) {
          const file = queue.shift()
          if (!file) continue
          const videoId = `${file.name}-${file.lastModified}`
          try {
            const thumbnailUrl = await extractVideoThumbnail(file)
            setVideos(currentVideos =>
              currentVideos.map(v => v.id === videoId ? { ...v, thumbnail: thumbnailUrl } : v)
            )
          } catch (error) {
            console.error(`Falha ao gerar thumbnail para ${file.name}:`, error)
            setVideos(currentVideos =>
              currentVideos.map(v => v.id === videoId ? { ...v, thumbnail: "error" } : v)
            )
          }
        }
      }
      for (let i = 0; i < CONCURRENT_WORKERS; i++) {
        worker()
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Erro ao selecionar a pasta:", error)
        notifyError("Não foi possível carregar os vídeos da pasta.")
      }
      setIsLoading(false)
    }
  }, [notifyError])

  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
      <div className="w-full h-full flex flex-col gap-2">
        {videos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
           <FolderSearch className="w-24 h-24 text-lightFg-tertiary dark:text-darkFg-tertiary mb-6" />
            <h1 className="text-3xl font-bold mb-2 text-lightFg-primary dark:text-darkFg-primary">Seu Cinema Particular</h1>
            <p className="mb-8 text-lightFg-secondary dark:text-darkFg-secondary max-w-md">Selecione uma pasta em seu computador para carregar e assistir aos seus vídeos locais.</p>
            <Button onClick={handleSelectFolder} variant="primary" $rounded loading={isLoading}>
              {isLoading ? "Escaneando..." : "Selecionar Pasta de Vídeos"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col w-full h-full">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold text-lightFg-primary dark:text-darkFg-primary truncate" title={directoryName}>
                Pasta: {directoryName}
              </h2>
              <Button onClick={handleSelectFolder} variant="secondary" $rounded>
                <FolderSearch className="mr-2" size={16} />
                Trocar Pasta
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2">
              {videos.map((video) => (
                <DvdCover key={video.id} video={video} onSelect={setSelectedVideo} />
              ))}
            </div>
          </div>
        )}
      </div>
      <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </SideMenu>
  )
}

export default Cinema
