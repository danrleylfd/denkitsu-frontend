import { Trash } from "lucide-react"
import { useDroppable } from "@dnd-kit/core"

import { useDnd } from "../../contexts/DndContext"

const TrashDropZone = () => {
  const { activeTask, isOverTrash } = useDnd()
  const { setNodeRef } = useDroppable({ id: "trash" })

  const baseClasses = "fixed bottom-0 left-0 right-0 z-10 p-6 bg-zinc-900/80 backdrop-blur-sm transition-transform duration-300 ease-in-out"
  const draggingClasses = !!activeTask ? "translate-y-0" : "translate-y-full"
  const contentBaseClasses = "flex items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors duration-200"
  const contentOverClasses = isOverTrash ? "border-red-500 bg-red-500/20 text-red-400" : "border-zinc-600 text-zinc-400"

  return (
    <div ref={setNodeRef} className={`${baseClasses} ${draggingClasses}`}>
      <div className={`${contentBaseClasses} ${contentOverClasses}`}>
        <Trash size={24} className="mr-3" />
        <span>Arraste a tarefa aqui para excluir</span>
      </div>
    </div>
  )
}

export default TrashDropZone
