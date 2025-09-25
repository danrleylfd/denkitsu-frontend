import { memo } from "react"
import { X } from "lucide-react"

import Paper from "../Paper"
import Button from "../Button"

const Lousa = ({ content, toggleLousa }) => {
  if (!content) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/67 backdrop-blur-sm">
      <Paper className="relative flex flex-1 flex-col gap-2 p-2 rounded-lg shadow-lg w-full h-full max-w-[95%] max-h-[95%] border border-solid border-brand-purple">
        <div className="flex justify-between items-center">
          <h3 className="text-lightFg-primary dark:text-darkFg-primary">Lousa</h3>
          <Button variant="danger" size="icon" $rounded onClick={toggleLousa}>
            <X size={16} />
          </Button>
        </div>
        <iframe srcDoc={content} title="Lousa" sandbox="allow-scripts allow-same-origin" className="w-full h-full flex-1 rounded-b-lg border-none outline-none m-0 p-0 box-border" />
      </Paper>
    </div>
  )
}

export default memo(Lousa)
