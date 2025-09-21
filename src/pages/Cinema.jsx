import { useState, useCallback, useEffect } from "react"
import { FolderSearch } from "lucide-react"
import { useNotification } from "../contexts/NotificationContext"
import Button from "../components/Button"
import InitialScreen from "../components/Cinema/InitialScreen"
import Breadcrumbs from "../components/Cinema/Breadcrumbs"
import VideoItem from "../components/Cinema/VideoItem"
import FolderItem from "../components/Cinema/FolderItem"
import VideoPlayerModal from "../components/Cinema/VideoPlayerModal"

const Cinema = () => {
  const [rootHandle, setRootHandle] = useState(null)
  const [currentPath, setCurrentPath] = useState("")
  const [items, setItems] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { notifyError } = useNotification()

  const loadDirectoryContent = useCallback(async () => {
    if (!rootHandle) return
    setIsLoading(true)
    try {
      let currentHandle = rootHandle
      if (currentPath) {
        const pathParts = currentPath.split("/")
        for (const part of pathParts) {
          currentHandle = await currentHandle.getDirectoryHandle(part)
        }
      }

      const folders = []
      const videos = []
      for await (const entry of currentHandle.values()) {
        if (entry.kind === "directory") {
          folders.push({ name: entry.name, type: "folder" })
        } else if (entry.kind === "file" && entry.name.match(/\.(mp4|webm|mov|mkv|avi)$/i)) {
          videos.push({ name: entry.name, type: "video", handle: entry })
        }
      }

      folders.sort((a, b) => a.name.localeCompare(b.name))
      videos.sort((a, b) => a.name.localeCompare(b.name))

      setItems([...folders, ...videos])
    } catch (error) {
      console.error("Erro ao ler o diretório:", error)
      notifyError("Não foi possível acessar o conteúdo da pasta.")
      setCurrentPath("") // Volta para a raiz em caso de erro
    } finally {
      setIsLoading(false)
    }
  }, [rootHandle, currentPath, notifyError])

  useEffect(() => {
    loadDirectoryContent()
  }, [loadDirectoryContent])


  const handleSelectFolder = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      notifyError("Seu navegador não suporta esta funcionalidade. Tente usar Chrome ou Edge.")
      return
    }
    try {
      const dirHandle = await window.showDirectoryPicker()
      setRootHandle(dirHandle)
      setCurrentPath("")
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Erro ao selecionar a pasta:", error)
        notifyError("Não foi possível carregar os vídeos da pasta.")
      }
    }
  }, [notifyError])

  const handleItemClick = async (item) => {
    if (item.type === "folder") {
      setCurrentPath(prev => prev ? `${prev}/${item.name}` : item.name)
    } else {
      try {
        const file = await item.handle.getFile()
        const url = URL.createObjectURL(file)
        setSelectedVideo({ ...item, url })
      } catch (error) {
        console.error("Erro ao obter arquivo do handle:", error)
        notifyError("Não foi possível carregar o arquivo de vídeo.")
      }
    }
  }

  const handleBreadcrumbNavigate = (path) => {
    setCurrentPath(path)
  }

  return (
    <>
      {!rootHandle ? (
        <InitialScreen onSelectFolder={handleSelectFolder} isLoading={isLoading} />
      ) : (
        <>
          <div className="flex justify-between items-center flex-shrink-0">
            <Breadcrumbs path={currentPath} onNavigate={handleBreadcrumbNavigate} rootName={rootHandle.name} />
            <Button onClick={handleSelectFolder} variant="secondary" $rounded>
              <FolderSearch className="mr-2" size={16} />
              Trocar Pasta
            </Button>
          </div>
          {isLoading ? (
             <div className="flex-1 flex items-center justify-center">
               <Button variant="outline" $rounded loading disabled />
             </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
              {items.map((item) =>
                item.type === "folder"
                  ? <FolderItem key={item.name} folder={item} onSelect={handleItemClick} />
                  : <VideoItem key={item.name} video={item} onSelect={handleItemClick} />
              )}
            </div>
          )}
        </>
      )}
      <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </>
  )
}

export default Cinema
