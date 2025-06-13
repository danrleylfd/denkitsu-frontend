import { useState, useEffect } from "react" // Importamos o useEffect
import { INITIAL_TASKS } from "../constants"
import { sendMessage } from "../services/aiChat"

const STORAGE_KEY = "kanban-tasks"

export const useTasks = () => {
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

  const generateTasksWithAI = async () => {
    const goal = newTask.trim()
    if (!goal) return
    setLoading(true)
    setError(null)
    try {
      const prompt = { role: "user", content: `Divida o seguinte objetivo em uma lista de tarefas pequenas e acionáveis. Responda APENAS com um array JSON de strings, onde cada string é uma tarefa. Objetivo: "${goal}". Proibido markdown` }
      const data = await sendMessage(null, [prompt])
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


  return {
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
}
