import { useState } from "react"
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, DragOverlay } from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates, SortableContext, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import SideMenu from "../../components/SideMenu"
import Paper from "../../components/Paper"
import Input from "../../components/Input"
import Button from "../../components/Button"

import { SideContentContainer, Container, ColumnContainer, TaskItemContainer } from "./styles"

const initialTasks = {
  Tarefas: [],
  Fazendo: [],
  Feito: []
}

const TaskItem = ({ id, content }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1
  }

  return (
    <TaskItemContainer ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {content}
    </TaskItemContainer>
  )
}

const Column = ({ id, tasks, handleDeleteTask }) => {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <SortableContext items={tasks.map((task) => task.id)} id={id}>
      <ColumnContainer ref={setNodeRef} isOver={isOver}>
        <h2>{id.charAt(0).toUpperCase() + id.slice(1)}</h2>
        {tasks.map((task) => (
          <TaskItem key={task.id} id={task.id} content={task.content} />
        ))}
        {tasks.length === 0 && <div style={{ height: "100%", opacity: isOver ? 0.7 : 1 }} />}
      </ColumnContainer>
    </SortableContext>
  )
}

const DeleteZone = () => {
  const { setNodeRef, isOver } = useDroppable({ id: "delete-zone" })

  return (
    <div
      ref={setNodeRef}
      style={{
        width: "10%",
        height: "50px",
        backgroundColor: isOver ? "#ffcccc" : "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "20px",
        borderRadius: "8px",
        border: isOver ? "2px dashed #cc0000" : "2px dashed #ccc",
        color: isOver ? "#cc0000" : "#666",
        fontWeight: "bold",
        transition: "all 0.2s ease-in-out"
      }}>
      Excluir
    </div>
  )
}

const Todo = () => {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeId, setActiveId] = useState(null)
  const [newTaskContent, setNewTaskContent] = useState("")
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )
  const findColumn = (id) => {
    if (id in tasks) return id
    const columnId = Object.keys(tasks).find((key) => tasks[key].find((task) => task.id === id))
    return columnId
  }
  const findTask = (id) => {
    const columnId = findColumn(id)
    if (columnId) return tasks[columnId].find((task) => task.id === id)
    return null
  }
  const onDragStart = (event) => setActiveId(event.active.id)
  const onDragEnd = (event) => {
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
  }
  const onDragCancel = () => setActiveId(null)
  const handleAddTask = () => {
    if (newTaskContent.trim() === "") return
    const newId = String(Date.now())
    const newTask = { id: newId, content: newTaskContent.trim() }
    setTasks((prevTasks) => ({
      ...prevTasks,
      Tarefas: [...prevTasks.Tarefas, newTask]
    }))
    setNewTaskContent("")
  }
  const handleDeleteTask = (taskId) => {
    console.log(taskId)
    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks }
      for (const columnId in newTasks) {
        newTasks[columnId] = newTasks[columnId].filter((task) => task.id !== taskId)
      }
      return newTasks
    })
  }
  const activeTask = activeId ? findTask(activeId) : null
  return (
    <SideMenu ContentView={SideContentContainer}>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
        <Paper>
          <Input placeholder="Nova tarefa..." value={newTaskContent} onChange={(e) => setNewTaskContent(e.target.value)}>
            <Button variant="outline" $rounded onClick={handleAddTask}>
              Adicionar
            </Button>
          </Input>
        </Paper>
        <Container>
          {Object.entries(tasks).map(([columnId, columnTasks]) => (
            <Column key={columnId} id={columnId} tasks={columnTasks} />
          ))}
          <DeleteZone />
        </Container>
        <DragOverlay>{activeTask ? <TaskItemContainer style={{ opacity: 0.7 }}>{activeTask.content}</TaskItemContainer> : null}</DragOverlay>
      </DndContext>
    </SideMenu>
  )
}

export default Todo
