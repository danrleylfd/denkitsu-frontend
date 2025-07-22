import { memo } from "react"
import { X } from "lucide-react"

import Button from "../Button"

const Lousa = ({ content, toggleLousa }) => {
  if (!content) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative flex w-[90%] h-[95%] flex-col rounded-lg bg-white shadow-2xl dark:bg-darkBg-primary">
        <div className="flex items-center justify-between rounded-t-lg bg-lightBg-secondary p-2 dark:bg-darkBg-secondary">
          <h3 className="font-bold text-lightFg-primary dark:text-darkFg-primary">Lousa</h3>
          <Button variant="danger" size="icon" $rounded onClick={() => toggleLousa(null)}><X size={16} /></Button>
        </div>
        <iframe srcDoc={content} title="Lousa" sandbox="allow-scripts allow-same-origin" className="w-full h-full flex-1 rounded-b-lg border-none outline-none m-0 p-0 box-border" />
      </div>
    </div>
  )
}

export default memo(Lousa)
