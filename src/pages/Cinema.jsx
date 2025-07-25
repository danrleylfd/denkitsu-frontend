import { useState, useCallback, memo } from "react"
import { FolderSearch, X, Film } from "lucide-react"
import SideMenu from "../components/SideMenu"
import Button from "../components/Button"
import Paper from "../components/Paper"
import { useNotification } from "../contexts/NotificationContext"

const ContentView = ({ children }) => (
  <main className="flex flex-1 flex-col justify-center items-center p-2 gap-2 w-full min-h-dvh ml-[3.5rem] md:ml-auto">
    {children}
  </main>
)

const DvdCover = memo(({ video, onSelect }) => (
  <button
    onClick={() => onSelect(video)}
    className="w-full h-64 flex flex-col items-center justify-center bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-lg shadow-lg p-4 text-center cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-primary-base/20 focus:outline-none focus:ring-2 focus:ring-primary-base"
  >
    <Film className="w-16 h-16 text-primary-base mb-4" />
    <p className="font-bold text-lightFg-primary dark:text-darkFg-primary break-words">
      {video.name}
    </p>
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
        className="relative bg-darkBg-primary p-4 rounded-lg shadow-2xl w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="danger"
          size="icon"
          $rounded
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10"
          title="Fechar Player"
        >
          <X size={16} />
        </Button>
        <video
          src={video.url}
          controls
          autoPlay
          className="w-full h-full max-h-[80vh] rounded"
        >
          Seu navegador não suporta a tag de vídeo.
        </video>
        <p className="text-darkFg-primary mt-2 text-center font-semibold">{video.name}</p>
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
      notifyError("Seu navegador não suporta a API de Acesso ao Sistema de Arquivos. Tente usar um navegador como Chrome ou Edge.")
      return
    }

    setIsLoading(true)
    setVideos([])
    setDirectoryName("")

    try {
      const dirHandle = await window.showDirectoryPicker()
      const videoFiles = []

      const traverseDirectory = async (directoryHandle) => {
        for await (const entry of directoryHandle.values()) {
          if (entry.kind === "file") {
            const file = await entry.getFile()
            if (file.type.startsWith("video/")) {
              videoFiles.push({
                name: file.name,
                url: URL.createObjectURL(file),
              })
            }
          } else if (entry.kind === "directory") {
            await traverseDirectory(entry)
          }
        }
      }

      await traverseDirectory(dirHandle)

      setVideos(videoFiles)
      setDirectoryName(dirHandle.name)
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Erro ao selecionar a pasta:", error)
        notifyError("Não foi possível carregar os vídeos da pasta selecionada.")
      }
    } finally {
      setIsLoading(false)
    }
  }, [notifyError])

  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-brand-purple">
      <div className="w-full h-full flex flex-col gap-4 p-4">
        {videos.length === 0 ? (
          <Paper className="flex flex-col items-center justify-center h-96">
            <h1 className="text-2xl font-bold mb-4 text-lightFg-primary dark:text-darkFg-primary">Cinema Local</h1>
            <p className="mb-6 text-lightFg-secondary dark:text-darkFg-secondary">Selecione uma pasta do seu computador para listar os vídeos.</p>
            <Button onClick={handleSelectFolder} variant="primary" $rounded loading={isLoading}>
              <FolderSearch className="mr-2" size={20} />
              {isLoading ? "Escaneando..." : "Selecionar Pasta"}
            </Button>
          </Paper>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-lightFg-primary dark:text-darkFg-primary">Pasta: {directoryName}</h2>
              <Button onClick={handleSelectFolder} variant="secondary" $rounded>
                <FolderSearch className="mr-2" size={16} />
                Trocar Pasta
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {videos.map((video) => (
                <DvdCover key={video.url} video={video} onSelect={setSelectedVideo} />
              ))}
            </div>
          </>
        )}
      </div>
      <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </SideMenu>
  )
}

export default Cinema
