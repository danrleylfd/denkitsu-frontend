import { useState, useEffect, memo } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { extractVideoThumbnail } from "../../utils/cinema"

const VideoItem = memo(({ video, onSelect }) => {
  const [thumbnail, setThumbnail] = useState(null) // null: loading, "error": error, string: url

  useEffect(() => {
    let isMounted = true
    const generateThumbnail = async () => {
      try {
        const file = await video.handle.getFile()
        const thumbUrl = await extractVideoThumbnail(file)
        if (isMounted) {
          setThumbnail(thumbUrl)
        }
      } catch (error) {
        console.error(`Falha ao gerar thumbnail para ${video.name}:`, error)
        if (isMounted) {
          setThumbnail("error")
        }
      }
    }

    generateThumbnail()

    return () => {
      isMounted = false
    }
  }, [video.handle, video.name])

  return (
    <button
      onClick={() => onSelect({ ...video, thumbnail })}
      className="group relative w-full aspect-[2/3] bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-base/20 focus:outline-none focus:ring-2 focus:ring-primary-base">
      {thumbnail === null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-lightFg-tertiary dark:text-darkFg-tertiary animate-spin" />
        </div>
      )}
      {thumbnail && thumbnail !== "error" && (
        <img src={thumbnail} alt={video.name} className="absolute inset-0 w-full h-full object-cover" />
      )}
      {thumbnail === "error" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-base" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <p className="font-bold text-white text-sm break-words text-left leading-tight">
          {video.name}
        </p>
      </div>
    </button>
  )
})

export default VideoItem
