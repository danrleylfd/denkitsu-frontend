import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { KeyboardSensor, PointerSensor, useSensor, useSensors, closestCorners, rectIntersection } from "@dnd-kit/core"
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable"
import { INITIAL_TASKS } from "../constants"
import { sendMessage } from "../services/aiChat"
import { useAI } from "./AIContext"

const KanbanContext = createContext()

export const useKanban = () => {
  const context = useContext(KanbanContext)
  if (!context) throw new Error("useKanban deve ser usado dentro de um KanbanProvider")
  return context
}

export const KanbanProvider = ({ children }) => {
  const STORAGE_KEY = "kanban-tasks"
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = window.localStorage.getItem(STORAGE_KEY)
      return savedTasks ? JSON.parse(savedTasks) : INITIAL_TASKS
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error)
      return INITIAL_TASKS
    }
  })

  const [newTask, setNewTask] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch (error) {
      console.error("Failed to save tasks to localStorage", error)
    }
  }, [tasks])

  const findTaskContainer = (taskId) => {
    if (taskId in tasks) return taskId
    return Object.keys(tasks).find((key) => tasks[key].some((task) => task.id === taskId))
  }

  const addTask = () => {
    if (!newTask.trim()) return
    const id = `task-${Date.now()}`
    const task = { id, content: newTask.trim() }
    setTasks((prev) => ({ ...prev, todo: [...prev.todo, task] }))
    setNewTask("")
  }

  const { aiKey } = useAI()

  const generateTasksWithAI = async () => {
    const goal = newTask.trim()
    if (!goal) return
    setLoading(true)
    setError(null)
    try {
      const prompt = { role: "user", content: `Objetivo: "${goal}` }
      const data = await sendMessage(null, [prompt], aiKey)
      if (data.error) throw new Error(data.error.message)

      const messageContent = data?.choices?.[0]?.message?.content
      if (!messageContent) throw new Error("Serviço temporariamente indisponível.")

      const newTasks = JSON.parse(messageContent).map((content, index) => ({
        id: `task-${Date.now()}-${index}`,
        content
      }))

      setTasks((prev) => ({ ...prev, todo: [...prev.todo, ...newTasks] }))
      setNewTask("")
    } catch (err) {
      setError(err.message || "Falha ao gerar tarefas. Verifique o formato da resposta da IA.")
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = (taskId) => {
    const container = findTaskContainer(taskId)
    if (container) {
      setTasks((prev) => ({
        ...prev,
        [container]: prev[container].filter((task) => task.id !== taskId)
      }))
    }
  }

  const updateTask = (taskId, newContent) => {
    const container = findTaskContainer(taskId)
    if (container) {
      setTasks((prev) => ({
        ...prev,
        [container]: prev[container].map((task) =>
          task.id === taskId ? { ...task, content: newContent } : task
        )
      }))
    }
    setEditingId(null)
  }

  const resetTasks = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setTasks(INITIAL_TASKS)
  }

  // Lógica do useDnd
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

  const tasksApi = {
    tasks,
    setTasks,
    newTask,
    setNewTask,
    loading,
    error,
    editingId,
    setEditingId,
    findTaskContainer,
    addTask,
    generateTasksWithAI,
    deleteTask,
    updateTask,
    resetTasks
  }

  const dndApi = {
    activeTask,
    isOverTrash,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    collisionDetectionStrategy
  }

  const value = {
    ...tasksApi,
    ...dndApi
  }

  return <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>
}
