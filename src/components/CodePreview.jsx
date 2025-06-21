import { LuX } from "react-icons/lu"
import Button from "./Button"

const CodePreview = ({ htmlContent, onClose }) => {
  if (!htmlContent) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative flex h-[90%] w-[90%] flex-col rounded-lg bg-white shadow-2xl dark:bg-darkBg-primary">
        <div className="flex items-center justify-between rounded-t-lg bg-lightBg-secondary p-2 dark:bg-darkBg-secondary">
          <h3 className="font-bold text-lightFg-primary dark:text-darkFg-primary">Modo Apresentação</h3>
          <Button variant="danger" size="icon" $rounded onClick={onClose}>
            <LuX size={16} />
          </Button>
        </div>
        <iframe
          srcDoc={htmlContent}
          title="Denkitsu Canva Preview"
          sandbox="allow-scripts allow-same-origin"
          className="h-full w-full flex-1 rounded-b-lg border-none"
        />
      </div>
    </div>
  )
}

export default CodePreview
