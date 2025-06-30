import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import TaskCard from "./TaskCard"
import { COLUMN_TITLES } from "../constants"
import { useTasks } from "../contexts/TasksContext"

const Column = ({ id }) => {
  const { tasks } = useTasks()
  const { setNodeRef } = useDroppable({ id })
  const columnTasks = tasks[id] || []

  return (
    <div
      className="bg-lightBg-primary dark:bg-darkBg-primary p-2 rounded-xl shadow-[6px_6px_16px_rgba(0,0,0,0.5)] flex flex-col gap-2 min-h-[250px] max-h-max opacity-75 dark:opacity-90"
      data-oid="fka8dv8">
      <h3 className="px-1 text-lightFg-primary dark:text-darkFg-primary" data-oid="9r3b40k">
        {COLUMN_TITLES[id]}
      </h3>
      <div ref={setNodeRef} className="flex flex-col gap-2" data-oid="is9u.9f">
        <SortableContext items={columnTasks.map((t) => t.id)} strategy={verticalListSortingStrategy} data-oid="0kh38qq">
          {columnTasks.map((task) => (
            <TaskCard key={task.id} task={task} data-oid="ynbcww7" />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

export default Column
