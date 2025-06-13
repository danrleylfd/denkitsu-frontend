import { useState } from "react"
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  rectIntersection
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable"

export const useDnd = (tasks, setTasks, findTaskContainer, deleteTask) => {
  const [activeTask, setActiveTask] = useState(null)
  const [isOverTrash, setIsOverTrash] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event) => {
    const { active } = event
    if (active.data.current?.type === "Task") {
      setActiveTask(active.data.current.task)
    }
    setIsOverTrash(false)
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    setIsOverTrash(over?.id === "trash")

    if (!over || active.id === over.id) return

    const activeContainer = findTaskContainer(active.id)
    const overContainer = findTaskContainer(over.id)

    if (!activeContainer || !overContainer || activeContainer === overContainer) return

    setTasks((prev) => {
      const activeItems = prev[activeContainer]
      const overItems = prev[overContainer]
      const activeIndex = activeItems.findIndex((t) => t.id === active.id)
      const overIndex = overItems.findIndex((t) => t.id === over.id)
      const taskToMove = activeItems[activeIndex]

      let newOverItems
      if (over.id in prev) {
        newOverItems = [...overItems, taskToMove]
      } else {
        const newIndex = overIndex >= 0 ? overIndex : overItems.length
        newOverItems = [...overItems.slice(0, newIndex), taskToMove, ...overItems.slice(newIndex)]
      }

      return {
        ...prev,
        [activeContainer]: activeItems.filter((t) => t.id !== active.id),
        [overContainer]: newOverItems
      }
    })
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (over?.id === "trash" && activeTask) {
      deleteTask(activeTask.id)
    } else {
      const activeContainer = findTaskContainer(active.id)
      const overContainer = findTaskContainer(over?.id)

      if (activeContainer && overContainer && activeContainer === overContainer && over) {
        setTasks((prev) => {
          const activeIndex = prev[activeContainer].findIndex((t) => t.id === active.id)
          const overIndex = prev[overContainer].findIndex((t) => t.id === over.id)
          if (activeIndex !== overIndex) {
            return {
              ...prev,
              [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex)
            }
          }
          return prev
        })
      }
    }
    setActiveTask(null)
    setIsOverTrash(false)
  }

  const collisionDetectionStrategy = (args) => {
    if (activeTask && args.droppableContainers.find(c => c.id === "trash")) {
      const trashCollision = rectIntersection({ ...args, droppableContainers: args.droppableContainers.filter(c => c.id === "trash") })
      if (trashCollision.length > 0) return trashCollision
    }
    return closestCorners({ ...args, droppableContainers: args.droppableContainers.filter(c => c.id !== "trash") })
  }

  return {
    activeTask,
    isOverTrash,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    collisionDetectionStrategy
  }
}
