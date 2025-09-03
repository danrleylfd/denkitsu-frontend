import { createContext, useState, useEffect, useCallback, useContext } from "react"

import { INITIAL_TASKS } from "../constants/tasks"

import { useModels } from "./ModelContext"
import { useNotification } from "./NotificationContext"

import { sendMessage } from "../services/aiChat"

import { storage } from "../utils/storage"

const TasksContext = createContext({})

const TasksProvider = ({ children }) => {
  const STORAGE_KEY = "@Denkitsu:kanban-tasks"
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [newTask, setNewTask] = useState("")
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { aiProvider, aiKey, model, freeModels, payModels, groqModels } = useModels()
  const { notifyError } = useNotification()

  useEffect(() => {
    const loadPersistedTasks = async () => {
      const savedTasks = await storage.local.getItem(STORAGE_KEY)
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks))
        } catch (error) {
          console.error("Falha ao analisar tarefas salvas do storage", error)
          setTasks(INITIAL_TASKS)
        }
      }
    }
    loadPersistedTasks()
  }, [])

  useEffect(() => {
    if (JSON.stringify(tasks) !== JSON.stringify(INITIAL_TASKS)) storage.local.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const findTaskContainer = useCallback(
    (taskId) => {
      if (taskId in tasks) return taskId
      return Object.keys(tasks).find((key) => tasks[key].some((task) => task.id === taskId))
    },
    [tasks]
  )

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
    const extractCodeFromMarkdown = (markdown) => {
      if (typeof markdown !== "string") return null
      const codeRegex = /^```(\w*)\n([\s\S]+?)\n^```/gm
      const matches = [...markdown.matchAll(codeRegex)]
      return matches.length > 0 ? matches.map((match) => match[2].trim()).join("\n\n") : null
    }
    try {
      const userPrompt = { role: "user", content: `Objetivo: "${goal}"` }
      const { data } = await sendMessage(aiKey, aiProvider, model, [...freeModels, ...payModels, ...groqModels], [userPrompt], "Secretário")
      const rawContent = data?.choices?.[0]?.message?.content
      if (typeof rawContent !== "string" || !rawContent.trim()) return notifyError("A resposta da IA veio vazia ou em formato inválido.")
      const content = rawContent.replace(/<think>[\s\S]*?<\/think>/g, "").replaceAll("`","").replace("json\n","")
      const codeBlock = extractCodeFromMarkdown(content)
      const finalContentToParse = codeBlock || content
      let newTasksData
      try {
        newTasksData = JSON.parse(finalContentToParse)
      } catch (e) {
        console.error(e)
        return notifyError("A IA não retornou uma lista de tarefas válida. Tente novamente.")
      }
      if (!Array.isArray(newTasksData)) return notifyError("A IA não retornou uma lista de tarefas válida. Tente novamente.")
      const newTasks = newTasksData.map((taskContent, index) => ({
        id: `task-${Date.now()}-${index}`,
        content: taskContent
      }))
      setTasks((prev) => ({ ...prev, todo: [...prev.todo, ...newTasks] }))
      setNewTask("")
    } catch (err) {
      console.error(err)
      notifyError("Falha ao gerar tarefas. Verifique o formato da resposta da IA.")
    } finally {
      setLoading(false)
    }
  }, [newTask, aiProvider, aiKey, model, freeModels, payModels, groqModels])

  const deleteTask = useCallback(
    (taskId) => {
      const container = findTaskContainer(taskId)
      if (container) {
        setTasks((prev) => ({
          ...prev,
          [container]: prev[container].filter((task) => task.id !== taskId)
        }))
      }
    },
    [findTaskContainer]
  )

  const updateTask = useCallback(
    (taskId, newContent) => {
      const container = findTaskContainer(taskId)
      if (container) {
        setTasks((prev) => ({
          ...prev,
          [container]: prev[container].map((task) => (task.id === taskId ? { ...task, content: newContent } : task))
        }))
      }
      setEditingId(null)
    },
    [findTaskContainer]
  )

  const resetTasks = useCallback(async () => {
    await storage.local.removeItem(STORAGE_KEY)
    setTasks(INITIAL_TASKS)
  }, [])

  const value = {
    tasks,
    setTasks,
    newTask,
    setNewTask,
    loading,
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

export { useTasks }
export default TasksProvider
