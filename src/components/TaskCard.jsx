import { useState } from "react"
import { LuTrash2, LuPenTool, LuCheck, LuX, LuGripVertical } from "react-icons/lu"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useKanban } from "../contexts/KanbanContext"

const TaskCard = ({ task, showControls = true }) => {
  const { updateTask, deleteTask, editingId, setEditingId } = useKanban()
  const [editedContent, setEditedContent] = useState(task.content)
  const isEditing = task.id === editingId

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
    disabled: isEditing
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1
  }

  const handleSave = () => {
    if (editedContent.trim()) updateTask(task.id, editedContent.trim())
  }

  const handleCancel = () => {
    setEditedContent(task.content)
    setEditingId(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave()
    if (e.key === "Escape") handleCancel()
  }

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="bg-light-cardBg dark:bg-dark-cardBg p-3 rounded-lg shadow-[6px_6px_16px_rgba(0,0,0,0.5)] flex flex-col gap-2 ring-2 ring-primary-base">
        <input
          type="text"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="bg-transparent w-full focus:outline-none"
        />
        <div className="flex items-center justify-end gap-2">
          <button onClick={handleCancel} className="p-1 text-danger-light hover:text-danger-base transition-colors"><LuX size={18} /></button>
          <button onClick={handleSave} className="p-1 text-success-light hover:text-success-base transition-colors"><LuCheck size={18} /></button>
        </div>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-light-cardBg dark:bg-dark-cardBg p-3 rounded-lg shadow-[6px_6px_16px_rgba(0,0,0,0.5)] text-sm flex items-center gap-2">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -ml-1">
        <LuGripVertical className="text-light-textMuted dark:text-dark-textMuted" size={16} />
      </button>
      <span className="flex-1 text-light-secondaryText dark:text-dark-secondaryText break-all">{task.content}</span>
      {showControls && (
        <div className="flex items-center gap-1">
          <button onClick={() => setEditingId(task.id)} className="p-1 hover:text-primary-base transition-colors"><LuPenTool size={16} /></button>
          <button onClick={() => deleteTask(task.id)} className="p-1 hover:text-danger-base transition-colors"><LuTrash2 size={16} /></button>
        </div>
      )}
    </div>
  )
}

export default TaskCard
