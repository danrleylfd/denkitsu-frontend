import { createContext, useState, useEffect, useCallback, useContext, useMemo } from "react"
import { INITIAL_TASKS } from "../constants"
import { sendMessage } from "../services/aiChat"
import { useAI } from "./AIContext"

const TasksContext = createContext({})

const TasksProvider = ({ children }) => {
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

  const { aiKey } = useAI()

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch (error) {
      console.error("Failed to save tasks to localStorage", error)
    }
  }, [tasks])

  const findTaskContainer = useCallback((taskId) => {
    if (taskId in tasks) return taskId
    return Object.keys(tasks).find((key) => tasks[key].some((task) => task.id === taskId))
  }, [tasks])

  const addTask = useCallback(() => {
    if (!newTask.trim()) return
    const id = `task-${Date.now()}`
    const task = { id, content: newTask.trim() }
    setTasks((prev) => ({ ...prev, todo: [...prev.todo, task] }))
    setNewTask("")
  }, [newTask])

  const generateTasksWithAI = useCallback(async () => {
    const goal = newTask.trim()
    if (!goal) return
    setLoading(true)
    setError(null)
    const extractCodeFromMarkdown = (markdown) => {
      const codeRegex = /^```(\w*)\n([\s\S]+?)\n^```/gm
      const matches = [...markdown.matchAll(codeRegex)]
      return matches.map((match) => match[2].trim()).join("\n\n")
    }
    try {
      const prompt = { role: "user", content: `Objetivo: "${goal}` }
      const data = await sendMessage(null, [prompt], aiKey)
      const content = data?.choices?.[0]?.message?.content
      const codeToCopy = useMemo(() => extractCodeFromMarkdown(content), [content])
      if (data.error) throw new Error(data.error.message)
      const messageContent = codeToCopy() || content
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
  }, [newTask, aiKey])

  const deleteTask = useCallback((taskId) => {
    const container = findTaskContainer(taskId)
    if (container) {
      setTasks((prev) => ({
        ...prev,
        [container]: prev[container].filter((task) => task.id !== taskId)
      }))
    }
  }, [findTaskContainer])

  const updateTask = useCallback((taskId, newContent) => {
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
  }, [findTaskContainer])

  const resetTasks = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setTasks(INITIAL_TASKS)
  }, [])

  const value = {
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

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  )
}

const useTasks = () => {
  const context = useContext(TasksContext)
  if (!context) throw new Error("useTasks deve ser usado dentro de um <TasksProvider>")
  return context
}

export { TasksProvider, useTasks }
