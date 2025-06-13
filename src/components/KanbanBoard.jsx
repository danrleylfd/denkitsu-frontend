import { DndContext, DragOverlay } from "@dnd-kit/core"
import { useKanban } from "../contexts/KanbanContext"
import { COLUMN_TITLES } from "../constants"
import Column from "./Column"
import TaskCard from "./TaskCard"
import TrashZone from "./TrashZone"
import AddTaskForm from "./AddTaskForm"

const KanbanBoard = () => {
  const { tasks, sensors, collisionDetectionStrategy, handleDragStart, handleDragOver, handleDragEnd, activeTask, setEditingId } = useKanban()

  const onDragStart = (event) => {
    setEditingId(null)
    handleDragStart(event)
  }

  return (
    <div className="w-full flex flex-col py-2 gap-2">
      <AddTaskForm />
      <DndContext sensors={sensors} collisionDetection={collisionDetectionStrategy} onDragStart={onDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-full">
          {Object.keys(COLUMN_TITLES).map((columnKey) => (
            <Column key={columnKey} id={columnKey} />
          ))}
        </div>
        <DragOverlay>{activeTask ? <TaskCard task={activeTask} showControls={false} /> : null}</DragOverlay>
        <TrashZone />
      </DndContext>
    </div>
  )
}

export default KanbanBoard
