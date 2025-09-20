import { memo } from "react"
import { X } from "lucide-react"
import Button from "../Button"
import VideoPlayer from "../Video/Player"

const VideoPlayerModal = memo(({ video, onClose }) => {
  if (!video) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className="flex flex-col gap-2 bg-lightBg-primary dark:bg-darkBg-primary rounded-lg shadow-2xl w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-bLight dark:border-bDark pt-1 px-2">
          <h5 className="font-bold text-lightFg-primary dark:text-darkFg-primary truncate" title={video.name}>
            {video.name}
          </h5>
          <Button variant="danger" size="icon" $rounded onClick={onClose} title="Fechar Player">
            <X size={16} />
          </Button>
        </div>
        <VideoPlayer src={video.url} poster={video.thumbnail} />
      </div>
    </div>
  )
})

export default VideoPlayerModal
