import { memo } from "react"
import { X } from "lucide-react"

import Button from "../Button"
import Markdown from "../Markdown"
import Paper from "../Paper"

const FileViewer = memo(({ file, onClose }) => {
  if (!file) return null

  const getLanguage = (path) => {
    const extension = path.split(".").pop()
    if (["js", "jsx", "ts", "tsx"].includes(extension)) return "javascript"
    return extension
  }

  const markdownContent = "```" + `${getLanguage(file.path)}\n${file.content}` + "\n```"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <Paper className="flex flex-col h-full max-h-[95%]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-2 pl-4 border-b border-bLight dark:border-bDark flex-shrink-0">
          <h3 className="font-mono font-bold text-lightFg-primary dark:text-darkFg-primary">{file.path}</h3>
          <Button variant="danger" size="icon" $rounded onClick={onClose}><X size={16} /></Button>
        </div>
        <div className="flex-1 overflow-auto p-4"><Markdown content={markdownContent} /></div>
      </Paper>
    </div>
  )
})

export default FileViewer
