import { useCallback, useState } from "react"
import { MdAdd } from "react-icons/md"
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, DragOverlay } from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates, SortableContext, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import SideMenu from "../components/SideMenu"
import Paper from "../components/Paper"
import Input from "../components/Input"
import Button from "../components/Button"

const initialTasks = {
  Tarefas: [],
  Progresso: [],
  Feito: []
}

const SideContentContainer = ({ children }) => (
  <div className="mx-auto flex flex-1 flex-col items-center justify-start gap-2 p-2 bg-cover bg-repeat-y bg-[url('/background.jpg')] bg-brand-purple">
    {children}
  </div>
)

const TaskItem = (({ id, content }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-full rounded-lg border border-solid border-light-border bg-light-cardBg p-4 dark:border-dark-border dark:bg-dark-cardBg">
      {content}
    </div>
  )
})

const Column = ({ id, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <SortableContext items={tasks.map((task) => task.id)} id={id}>
      <div ref={setNodeRef} className={`flex gap-2 h-min w-full md:max-w-[30%] md:min-w-[30%] flex-col rounded-lg bg-light-cardBg p-4 shadow-md dark:bg-dark-cardBg opacity-75 dark:opacity-90`}>
        <h2 className="mb-4 border-b border-light-border pb-2 font-bold text-light-textPrimary dark:border-dark-border dark:text-dark-textPrimary">
          {id.charAt(0).toUpperCase() + id.slice(1)}
        </h2>
        {tasks.map((task) => (
          <TaskItem key={task.id} id={task.id} content={task.content} />
        ))}
        {tasks.length === 0 && <div className={`h-full ${isOver ? "opacity-75 dark:opacity-90" : "opacity-100 dark:opacity-100"}`} />}
      </div>
    </SortableContext>
  )
}

const DeleteZone = () => {
  const { setNodeRef, isOver } = useDroppable({ id: "delete-zone" })
  const baseClasses = "flex w-full md:min-w-[10%] md:max-w-[10%] p-[2.5rem] max-h-[104px] items-center justify-center rounded-lg font-bold transition-all"
  const inactiveClasses = "border-2 border-dashed border-light-textMuted text-light-textMuted"
  const activeClasses = "border-2 border-dashed border-danger-base bg-danger-base/10 text-danger-base"
  return (
    <div ref={setNodeRef} className={`${baseClasses} ${isOver ? activeClasses : inactiveClasses}`}>
      Excluir
    </div>
  )
}

const Todo = () => {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeId, setActiveId] = useState(null)
  const [newTaskContent, setNewTaskContent] = useState("")
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const findColumn = useCallback((id) => {
    if (id in tasks) return id
    const columnId = Object.keys(tasks).find((key) => tasks[key].find((task) => task.id === id))
    return columnId
  }, [tasks])

  const findTask = useCallback((id) => {
    const columnId = findColumn(id)
    if (columnId) return tasks[columnId].find((task) => task.id === id)
    return null
  }, [tasks, findColumn])

  const onDragStart = useCallback((event) => {setActiveId(event.active.id)}, [])

  const handleDeleteTask = useCallback((taskId) => {
    console.log(taskId)
    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks }
      for (const columnId in newTasks) {
        newTasks[columnId] = newTasks[columnId].filter((task) => task.id !== taskId)
      }
      return newTasks
    })
  }, [])

  const onDragEnd = useCallback((event) => {
    const { active, over } = event
    if (!over) return
    const activeId = active.id
    const overId = over.id
    if (overId === "delete-zone") {
      handleDeleteTask(activeId)
      setActiveId(null)
      return
    }
    if (activeId === overId) return
    const activeColumnId = findColumn(activeId)
    const overColumnId = findColumn(overId)
    if (activeColumnId === overColumnId) {
      const oldIndex = tasks[activeColumnId].findIndex((task) => task.id === activeId)
      const newIndex = tasks[overColumnId].findIndex((task) => task.id === overId)
      setTasks((tasks) => ({
        ...tasks,
        [activeColumnId]: arrayMove(tasks[activeColumnId], oldIndex, newIndex)
      }))
    } else {
      setTasks((tasks) => {
        const newTasks = { ...tasks }
        const taskToMove = newTasks[activeColumnId].find((task) => task.id === activeId)
        newTasks[activeColumnId] = newTasks[activeColumnId].filter((task) => task.id !== activeId)
        const overIndex = newTasks[overColumnId].findIndex((task) => task.id === overId)
        const insertIndex = overIndex === -1 ? newTasks[overColumnId].length : overIndex
        newTasks[overColumnId] = [...newTasks[overColumnId].slice(0, insertIndex), taskToMove, ...newTasks[overColumnId].slice(insertIndex)]
        return newTasks
      })
    }
    setActiveId(null)
  }, [findColumn, handleDeleteTask])

  const onDragCancel = useCallback(() => {setActiveId(null)}, [])

  const handleAddTask = useCallback(() => {
    if (newTaskContent.trim() === "") return
    const newId = String(Date.now())
    const newTask = { id: newId, content: newTaskContent.trim() }
    setTasks((prevTasks) => ({
      ...prevTasks,
      Tarefas: [...prevTasks.Tarefas, newTask]
    }))
    setNewTaskContent("")
  }, [newTaskContent])

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTask()
    }
  }
  const activeTask = activeId ? findTask(activeId) : null
  return (
    <SideMenu ContentView={SideContentContainer}>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
        <Paper>
          <Input placeholder="Nova tarefa..." value={newTaskContent} onChange={(e) => setNewTaskContent(e.target.value)} onKeyDown={handleKeyDown}>
            <Button variant="outline" size="icon" $rounded title="Adicionar tarefa" onClick={handleAddTask}>
              <MdAdd size={16} />
            </Button>
          </Input>
        </Paper>
        <div className="mx-auto flex flex-col md:flex-row w-full justify-center gap-2 p-2">
          {Object.entries(tasks).map(([columnId, columnTasks]) => (
            <Column key={columnId} id={columnId} tasks={columnTasks} />
          ))}
          <DeleteZone />
        </div>
        <DragOverlay>
          {activeTask ? <div className="cursor-grabbing rounded-lg border border-dark-border bg-dark-cardBg p-4 opacity-70">{activeTask.content}</div> : null}
        </DragOverlay>
      </DndContext>
    </SideMenu>
  )
}

export default Todo
