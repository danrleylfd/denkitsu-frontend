import { createContext, useState, useEffect, useContext, useCallback } from "react"
import { useTasks } from "./TasksContext"
import { storage } from "../utils/storage"

const PomodoroContext = createContext({})

const WORK_MINUTES = 25
const SHORT_BREAK_MINUTES = 5
const LONG_BREAK_MINUTES = 15
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"

const PomodoroProvider = ({ children }) => {
  const STORAGE_KEY = "@Denkitsu:pomodoroState"
  const { setTasks, updateTaskPomodoros, updateTaskPomodoroProgress } = useTasks()

  const [timeRemaining, setTimeRemaining] = useState(WORK_MINUTES * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState("work")
  const [cycles, setCycles] = useState(0)
  const [associatedTask, setAssociatedTask] = useState(null)

  const saveState = useCallback(async (stateToSave) => {
    await storage.local.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
  }, [])

  useEffect(() => {
    const loadPomodoroState = async () => {
      const savedStateJSON = await storage.local.getItem(STORAGE_KEY)
      if (savedStateJSON) {
        try {
          const savedState = JSON.parse(savedStateJSON)
          setTimeRemaining(savedState.timeRemaining)
          setMode(savedState.mode)
          setCycles(savedState.cycles)
          setAssociatedTask(savedState.associatedTask || null)
          // Se o timer estava ativo quando a página foi fechada, mantém ele ativo
          if (savedState.isActive) {
            setIsActive(true)
          }
        } catch (error) {
          console.error("Falha ao analisar o estado do pomodoro:", error)
        }
      }
    }
    loadPomodoroState()
  }, [])

  useEffect(() => {
    let interval = null
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1)
      }, 1000)
    } else if (isActive && timeRemaining === 0) {
      const notification = new Audio(NOTIFICATION_SOUND_URL)
      notification.play()

      if (mode === "work") {
        if (associatedTask) {
          updateTaskPomodoros(associatedTask.id)
        }
        const newCycles = cycles + 1
        setCycles(newCycles)
        setMode("break")
        setTimeRemaining((newCycles % 4 === 0 ? LONG_BREAK_MINUTES : SHORT_BREAK_MINUTES) * 60)
      } else {
        setMode("work")
        setTimeRemaining(WORK_MINUTES * 60)
      }
    }

    // Apenas salva o estado no storage, não na tarefa, durante a contagem
    const currentState = { timeRemaining, mode, cycles, isActive, associatedTask }
    saveState(currentState)

    return () => clearInterval(interval)
  }, [isActive, timeRemaining, mode, cycles, associatedTask, saveState, updateTaskPomodoros])

  const toggleTimer = () => setIsActive(prev => !prev)

  const resetTimer = () => {
    setIsActive(false)
    if (associatedTask) {
      updateTaskPomodoroProgress(associatedTask.id, null)
    }
    setMode("work")
    setTimeRemaining(WORK_MINUTES * 60)
    setCycles(0)
    setAssociatedTask(null)
    storage.local.removeItem(STORAGE_KEY)
  }

  const startPomodoroForTask = (task) => {
    setAssociatedTask(task)
    setMode("work")

    if (task.pomodoroProgress && task.pomodoroProgress > 0) {
      setTimeRemaining(task.pomodoroProgress)
    } else {
      setTimeRemaining(WORK_MINUTES * 60)
    }

    setIsActive(true)

    setTasks(prev => {
      const sourceColumn = Object.keys(prev).find(col => prev[col].some(t => t.id === task.id))

      if (sourceColumn === "todo") {
        const taskToMove = prev.todo.find(t => t.id === task.id)
        const newTodo = prev.todo.filter(t => t.id !== task.id)
        const newInProgress = [{ ...taskToMove, pomodoroProgress: null }, ...prev.inProgress]
        return { ...prev, todo: newTodo, inProgress: newInProgress }
      } else {
        // Limpa o progresso salvo ao iniciar/retomar
        updateTaskPomodoroProgress(task.id, null)
      }
      return prev
    })
  }

  const stopFocusSession = () => {
    setIsActive(false)
    if (associatedTask && timeRemaining > 0) {
      updateTaskPomodoroProgress(associatedTask.id, timeRemaining)
    }
    setAssociatedTask(null)
  }

  const testNotificationSound = () => {
    const notification = new Audio(NOTIFICATION_SOUND_URL)
    notification.play().catch(err => console.error("Falha ao tocar o som de notificação:", err))
  }

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  const value = {
    minutes,
    seconds,
    isActive,
    mode,
    cycles,
    associatedTask,
    toggleTimer,
    resetTimer,
    startPomodoroForTask,
    stopFocusSession,
    testNotificationSound
  }

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  )
}

const usePomodoro = () => {
  const context = useContext(PomodoroContext)
  if (!context) {
    throw new Error("usePomodoro must be used within a PomodoroProvider")
  }
  return context
}

export { usePomodoro }
export default PomodoroProvider
