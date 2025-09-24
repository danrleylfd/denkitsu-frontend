import { useState } from "react"
import { Pencil, Trash, Check, X, GripVertical, Play, Timer } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { useTasks } from "../../contexts/TasksContext"
import { usePomodoro } from "../../contexts/PomodoroContext"

const TaskCard = ({ task, showControls = true }) => {
  const { updateTask, deleteTask, editingId, setEditingId } = useTasks()
  const { startPomodoroForTask, associatedTask, isActive } = usePomodoro()
  const [editedContent, setEditedContent] = useState(task.content)
  const isEditing = task.id === editingId
  const isAssociated = associatedTask?.id === task.id && isActive

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
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
      <div
        ref={setNodeRef}
        style={style}
        className="bg-lightBg-secondary dark:bg-darkBg-secondary p-3 rounded-lg shadow-lg flex flex-col gap-2 ring-2 ring-primary-base">
        <input
          type="text"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="bg-transparent text-lightFg-primary dark:text-darkFg-primary w-full focus:outline-none"
        />

        <div className="flex items-center justify-end gap-2">
          <button onClick={handleCancel} className="text-primary-base hover:text-primary-light active:text-primary-dark p-1 transition-colors">
            <X size={18} />
          </button>
          <button onClick={handleSave} className="text-green-base hover:text-green-light active:text-green-dark p-1 transition-colors">
            <Check size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-lg shadow-lg text-sm flex items-center gap-2 ${isAssociated ? "bg-primary-base/20 ring-2 ring-primary-base" : "bg-lightBg-secondary dark:bg-darkBg-secondary"}`}>
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -ml-1">
        <GripVertical className="text-lightFg-tertiary dark:text-darkFg-tertiary" size={16} />
      </button>
      <span className="flex-1 text-lightFg-secondary dark:text-darkFg-secondary break-all">
        {task.content}
      </span>
      {showControls && (
        <div className="flex items-center gap-1">
          {task.pomodoros > 0 && (
            <div className="flex items-center gap-1 text-xs text-lightFg-tertiary dark:text-darkFg-tertiary mr-1" title={`${task.pomodoros} pomodoros concluídos`}>
              <span>{task.pomodoros}</span>
              <Timer size={16} />
            </div>
          )}
          <button onClick={() => startPomodoroForTask(task)} className="text-primary-base hover:text-primary-light active:text-primary-dark p-1 transition-colors">
            <Timer size={16} />
          </button>
          <button
            onClick={() => setEditingId(task.id)}
            className="text-primary-base hover:text-primary-light active:text-primary-dark p-1 transition-colors">
            <Pencil size={16} />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="text-red-base hover:text-red-light active:text-red-dark p-1 transition-colors">
            <Trash size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default TaskCard
