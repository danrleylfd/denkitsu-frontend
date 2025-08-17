import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"

import { useTasks } from "../../contexts/TasksContext"

import { COLUMN_TITLES } from "../../constants/tasks"

import TaskCard from "./TaskCard"

const KanbanColumn = ({ id }) => {
  const { tasks } = useTasks()
  const { setNodeRef } = useDroppable({ id })
  const columnTasks = tasks[id] || []
  return (
    <div className="bg-lightBg-primary dark:bg-darkBg-primary p-2 rounded-xl shadow-[6px_6px_16px_rgba(0,0,0,0.5)] flex flex-col gap-2 min-h-[250px] max-h-max opacity-75 dark:opacity-90">
      <h3 className="px-1 text-lightFg-primary dark:text-darkFg-primary">{COLUMN_TITLES[id]}</h3>
      <div ref={setNodeRef} className="flex flex-col gap-2">
        <SortableContext items={columnTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {columnTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

export default KanbanColumn
