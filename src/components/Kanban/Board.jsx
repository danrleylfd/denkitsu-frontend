import { DndContext, DragOverlay } from "@dnd-kit/core"

import { useDnd } from "../../contexts/DndContext"
import { useTasks } from "../../contexts/TasksContext"

import { COLUMN_TITLES } from "../../constants"

import KanbanColumn from "./Column"
import TaskCreator from "./TaskCreator"
import TaskCard from "./TaskCard"
import TrashDropZone from "./TrashDropZone"

const KanbanBoard = () => {
  const { sensors, collisionDetectionStrategy, handleDragStart, handleDragOver, handleDragEnd, activeTask } = useDnd()
  const { tasks, setEditingId } = useTasks()
  const onDragStart = (event) => {
    setEditingId(null)
    handleDragStart(event)
  }

  return (
    <div className="w-full flex flex-col py-2 gap-2">
      <TaskCreator />
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={onDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full">
          {Object.keys(COLUMN_TITLES).map((columnKey) => (
            <KanbanColumn key={columnKey} id={columnKey} />
          ))}
        </div>
        <DragOverlay>{activeTask ? <TaskCard task={activeTask} showControls={false} /> : null}</DragOverlay>
        <TrashDropZone />
      </DndContext>
    </div>
  )
}

export default KanbanBoard
