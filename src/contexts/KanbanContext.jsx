import { createContext, useContext } from "react"
import { useTasks } from "../hooks/useTasks"
import { useDnd } from "../hooks/useDnd"
import useAIKey from "../hooks/useAIKey"

const KanbanContext = createContext()

export const useKanban = () => {
  const context = useContext(KanbanContext)
  if (!context) throw new Error("useKanban deve ser usado dentro de um KanbanProvider")
  return context
}

export const KanbanProvider = ({ children }) => {
  const tasksApi = useTasks()
  const aiKey = useAIKey()
  const dndApi = useDnd(tasksApi.tasks, tasksApi.setTasks, tasksApi.findTaskContainer, tasksApi.deleteTask)

  const value = {
    ...tasksApi,
    ...dndApi,
    ...aiKey
  }

  return <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>
}
