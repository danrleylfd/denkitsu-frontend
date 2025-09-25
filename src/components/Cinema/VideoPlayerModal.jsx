import { memo } from "react"
import { X } from "lucide-react"

import Paper from "../Paper"
import Button from "../Button"
import VideoPlayer from "../Video/Player"

const VideoPlayerModal = memo(({ video, onClose }) => {
  if (!video) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}>
      <Paper className="relative flex flex-1 flex-col gap-2 p-2 rounded-lg shadow-lg w-full h-full max-w-[95%] max-h-[95%] border border-solid border-brand-purple">
        <div className="flex items-center justify-between border-b border-bLight dark:border-bDark pt-1 px-2">
          <h5 className="font-bold text-lightFg-primary dark:text-darkFg-primary truncate" title={video.name}>
            {video.name}
          </h5>
          <Button variant="danger" size="icon" $rounded onClick={onClose} title="Fechar Player">
            <X size={16} />
          </Button>
        </div>
        <VideoPlayer src={video.url} poster={video.thumbnail} />
      </Paper>
    </div>
  )
})

export default VideoPlayerModal
