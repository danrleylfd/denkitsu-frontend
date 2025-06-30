import { useState } from "react"
import { LuTrash2, LuPenTool, LuCheck, LuX, LuGripVertical } from "react-icons/lu"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useTasks } from "../contexts/TasksContext"

const TaskCard = ({ task, showControls = true }) => {
  const { updateTask, deleteTask, editingId, setEditingId } = useTasks()
  const [editedContent, setEditedContent] = useState(task.content)
  const isEditing = task.id === editingId

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
        className="bg-lightBg-secondary dark:bg-darkBg-secondary p-3 rounded-lg shadow-[6px_6px_16px_rgba(0,0,0,0.5)] flex flex-col gap-2 ring-2 ring-primary-base"
        data-oid="wksby0h">
        <input
          type="text"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="bg-transparent text-lightFg-primary dark:text-darkFg-primary w-full focus:outline-none"
          data-oid="fxc8psj"
        />

        <div className="flex items-center justify-end gap-2" data-oid="o.ikjvh">
          <button onClick={handleCancel} className="text-primary-base hover:text-primary-light active:text-primary-dark p-1 transition-colors" data-oid="cqpd47s">
            <LuX size={18} data-oid="0o4fyb1" />
          </button>
          <button onClick={handleSave} className="text-success-base hover:text-success-light active:text-success-dark p-1 transition-colors" data-oid="8vitk2q">
            <LuCheck size={18} data-oid="51dlitb" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-lightBg-secondary dark:bg-darkBg-secondary p-3 rounded-lg shadow-[6px_6px_16px_rgba(0,0,0,0.5)] text-sm flex items-center gap-2"
      data-oid="kulrtzd">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -ml-1" data-oid=".2e0818">
        <LuGripVertical className="text-lightFg-tertiary dark:text-darkFg-tertiary" size={16} data-oid="5.9uxfd" />
      </button>
      <span className="flex-1 text-lightFg-secondary dark:text-darkFg-secondary  break-all" data-oid="4167nj_">
        {task.content}
      </span>
      {showControls && (
        <div className="flex items-center gap-1" data-oid="8tn8-ep">
          <button
            onClick={() => setEditingId(task.id)}
            className="text-primary-base hover:text-primary-light active:text-primary-dark p-1 transition-colors"
            data-oid="4k-.bsa">
            <LuPenTool size={16} data-oid="t5k:r2n" />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="text-danger-base hover:text-danger-light active:text-danger-dark p-1 transition-colors"
            data-oid="nfvh358">
            <LuTrash2 size={16} data-oid="43julhc" />
          </button>
        </div>
      )}
    </div>
  )
}

export default TaskCard
