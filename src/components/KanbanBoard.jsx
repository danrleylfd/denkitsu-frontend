import { DndContext, DragOverlay } from "@dnd-kit/core"

import { useDnd } from "../contexts/DndContext"
import { useTasks } from "../contexts/TasksContext"

import { COLUMN_TITLES } from "../constants"
import Column from "./Column"
import TaskCard from "./TaskCard"
import TrashZone from "./TrashZone"
import AddTaskForm from "./AddTaskForm"

const KanbanBoard = () => {
  const { sensors, collisionDetectionStrategy, handleDragStart, handleDragOver, handleDragEnd, activeTask } = useDnd()
  const { tasks, setEditingId } = useTasks()
  const onDragStart = (event) => {
    setEditingId(null)
    handleDragStart(event)
  }

  return (
    <div className="w-full flex flex-col py-2 gap-2" data-oid=":h.08l6">
      <AddTaskForm data-oid="sur0x04" />
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={onDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        data-oid="sjffybg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full" data-oid="jktj108">
          {Object.keys(COLUMN_TITLES).map((columnKey) => (
            <Column key={columnKey} id={columnKey} data-oid="mtgjb--" />
          ))}
        </div>
        <DragOverlay data-oid="yu2s19v">{activeTask ? <TaskCard task={activeTask} showControls={false} data-oid="a1mcbg0" /> : null}</DragOverlay>
        <TrashZone data-oid="._wy7v-" />
      </DndContext>
    </div>
  )
}

export default KanbanBoard
