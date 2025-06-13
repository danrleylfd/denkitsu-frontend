import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import TaskCard from "./TaskCard"
import { COLUMN_TITLES } from "../constants"
import { useKanban } from "../contexts/KanbanContext"

const Column = ({ id }) => {
  const { tasks } = useKanban()
  const { setNodeRef } = useDroppable({ id })
  const columnTasks = tasks[id] || []

  return (
    <div className="bg-light-cardBg dark:bg-dark-cardBg p-2 rounded-xl shadow-inner flex flex-col gap-2 min-h-[250px] max-h-max opacity-75 dark:opacity-90">
      <h3 className="px-1 text-light-color dark:text-dark-secondaryText">{COLUMN_TITLES[id]}</h3>
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

export default Column
