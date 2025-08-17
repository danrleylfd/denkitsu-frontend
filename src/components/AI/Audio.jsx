import { Paperclip, X } from "lucide-react"

import Paper from "../Paper"
import Button from "../Button"

const AIAudio = ({ audioFile, setAudioFile }) => {
  return (
    <Paper className="bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center justify-between gap-2 max-w-[95%] mb-1 mx-auto">
      <div className="flex items-center gap-2 text-lightFg-primary dark:text-darkFg-primary">
        <Paperclip size={16} />
        <span className="text-sm font-mono truncate">{audioFile.name || "gravação.webm"}</span>
      </div>
      <Button variant="danger" size="icon" $rounded title="Cancelar Áudio" onClick={() => setAudioFile(null)}>
        <X size={16} />
      </Button>
    </Paper>
  )
}

export default AIAudio
