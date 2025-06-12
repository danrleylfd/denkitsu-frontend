import { useState } from "react"
import { LuTrash2, LuPenTool, LuPlus, LuSparkles, LuCheck, LuX, LuGripVertical } from "react-icons/lu"

import { sendMessage } from "../services/aiChat"

import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  rectIntersection
} from "@dnd-kit/core"
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

const TaskCard = ({ task, onDelete, onUpdate, isEditing, setEditingId, showControls = true }) => {
  const [editedContent, setEditedContent] = useState(task.content)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task
    },
    disabled: isEditing
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1
  }

  const handleSave = () => {
    if (editedContent.trim()) {
      onUpdate(task.id, editedContent.trim())
    }
    setEditingId(null)
  }

  const handleCancel = () => {
    setEditedContent(task.content)
    setEditingId(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave()
    if (e.key === "Escape") handleCancel()
  }

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="bg-white dark:bg-zinc-700 p-3 rounded-lg shadow-lg flex flex-col gap-2 ring-2 ring-blue-500">
        <input
          type="text"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="bg-transparent w-full focus:outline-none text-sm"
        />
        <div className="flex items-center justify-end gap-2">
          <button onClick={handleCancel} className="p-1 text-red-500 hover:text-red-700 transition-colors">
            <LuX size={18} />
          </button>
          <button onClick={handleSave} className="p-1 text-green-500 hover:text-green-700 transition-colors">
            <LuCheck size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg shadow-sm text-sm flex items-center gap-2">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -ml-1">
        <LuGripVertical className="text-zinc-400" size={16} />
      </button>

      <span className="flex-1">{task.content}</span>

      {showControls && (
        <div className="flex items-center gap-1">
          <button onClick={() => setEditingId(task.id)} className="p-1 hover:text-blue-500 transition-colors">
            <LuPenTool size={16} />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 hover:text-red-500 transition-colors">
            <LuTrash2 size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

const Column = ({ id, title, tasks, onDeleteTask, onUpdateTask, editingId, setEditingId }) => {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div className="bg-zinc-200/50 dark:bg-zinc-900/50 p-4 rounded-xl shadow-inner flex flex-col gap-4 min-h-[250px] w-full">
      <h2 className="text-lg font-bold text-zinc-600 dark:text-zinc-300 px-1">{title}</h2>
      <div ref={setNodeRef} className="flex flex-col gap-3">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
              onUpdate={onUpdateTask}
              isEditing={task.id === editingId}
              setEditingId={setEditingId}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

const TrashZone = ({ isDragging, isOver }) => {
  const { setNodeRef } = useDroppable({ id: "trash" });

  const baseClasses = "fixed bottom-0 left-0 right-0 z-10 p-6 bg-zinc-900/80 backdrop-blur-sm transition-transform duration-300 ease-in-out";
  const draggingClasses = isDragging ? "translate-y-0" : "translate-y-full";

  const contentBaseClasses = "flex items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors duration-200";
  const contentOverClasses = isOver ? "border-red-500 bg-red-500/20 text-red-400" : "border-zinc-600 text-zinc-400";

  return (
    <div ref={setNodeRef} className={`${baseClasses} ${draggingClasses}`}>
      <div className={`${contentBaseClasses} ${contentOverClasses}`}>
        <LuTrash2 size={24} className="mr-3" />
        <span>Arraste a tarefa aqui para excluir</span>
      </div>
    </div>
  );
};

const INITIAL_TASKS = {
  todo: [
    { id: "task-1", content: "Listar Tarefas" }
  ],
  inProgress: [],
  review: [],
  done: []
}

const COLUMN_TITLES = {
  todo: "A Fazer",
  inProgress: "Em Progresso",
  review: "Revisão",
  done: "Concluído"
}

const KanbanApp = () => {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [newTask, setNewTask] = useState("")
  const [activeTask, setActiveTask] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [isOverTrash, setIsOverTrash] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const findContainer = (id) => {
    if (id in tasks) return id
    return Object.keys(tasks).find((key) => tasks[key].some((task) => task.id === id))
  }

  const handleAddTask = () => {
    if (!newTask.trim()) return
    const id = `task-${Date.now()}`
    const task = { id, content: newTask.trim() }
    setTasks((prev) => ({ ...prev, todo: [...prev.todo, task] }))
    setNewTask("")
  }

  const handleMagicAddTask = async () => {
    const goal = newTask.trim();
    if (!goal) return;
    setLoading(true)
    try {
      const prompt = { role: "user", content: `Divida o seguinte objetivo em uma lista de tarefas pequenas e acionáveis. Responda APENAS com um array JSON de strings, onde cada string é uma tarefa. Objetivo: "${goal}"` }
      const data = await sendMessage(null, [prompt])
      if (data.error) return setError(data.error.message)
      const message = data?.choices?.[0]?.message
      if (!message) return setError("Serviço temporariamente indisponível.")
      setContent(message.content)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  };

  const handleDeleteTask = (id) => {
    const container = findContainer(id)
    if (container) {
      setTasks((prev) => ({
        ...prev,
        [container]: prev[container].filter((task) => task.id !== id)
      }))
    }
  }

  const handleUpdateTask = (id, newContent) => {
    const container = findContainer(id);
    if (container) {
        setTasks((prev) => ({
            ...prev,
            [container]: prev[container].map((task) =>
                task.id === id ? { ...task, content: newContent } : task
            ),
        }));
    }
  };


  const handleDragStart = (event) => {
    const { active } = event
    if (active.data.current?.type === "Task") {
      setActiveTask(active.data.current.task)
    }
    setEditingId(null);
    setIsOverTrash(false);
  }

  const handleDragOver = (event) => {
    const { active, over } = event

    setIsOverTrash(over?.id === 'trash')

    if (!over || active.id === over.id) return
    const activeContainer = findContainer(active.id)
    const overContainer = findContainer(over.id)
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
        newOverItems = [ ...overItems.slice(0, newIndex), taskToMove, ...overItems.slice(newIndex) ]
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
      handleDeleteTask(activeTask.id)
    } else {
      const activeContainer = findContainer(active.id)
      const overContainer = findContainer(over?.id)
      if (activeContainer && overContainer && activeContainer === overContainer && over) {
        setTasks((prev) => {
          const activeIndex = prev[activeContainer].findIndex((t) => t.id === active.id)
          const overIndex = prev[overContainer].findIndex((t) => t.id === over.id)
          return {
            ...prev,
            [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex)
          }
        })
      }
    }
    setActiveTask(null)
    setIsOverTrash(false);
  }

  const collisionDetectionStrategy = (args) => {
    const trashContainer = args.droppableContainers.find(container => container.id === 'trash');
    const otherContainers = args.droppableContainers.filter(container => container.id !== 'trash');

    if (trashContainer && activeTask) {
        const trashCollisions = rectIntersection({ ...args, droppableContainers: [trashContainer] });
        if (trashCollisions.length > 0) {
            return trashCollisions;
        }
    }

    return closestCorners({ ...args, droppableContainers: otherContainers });
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="max-w-7xl mx-auto pb-40">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-center mb-2">Quadro Kanban com IA</h1>
          {error && <p className="text-center text-zinc-500 dark:text-zinc-400">{error}</p>}
          <p className="text-center text-zinc-500 dark:text-zinc-400">Descreva um objetivo e deixe a IA criar as tarefas para você.</p>
          <div className="flex items-center gap-2 mt-6 max-w-2xl mx-auto">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              placeholder="Adicionar tarefa ou descrever um objetivo..."
              className="flex-1 p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              disabled={loading}
            />
            <button
              onClick={handleAddTask}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:ring-offset-zinc-950 font-semibold disabled:bg-zinc-500 disabled:cursor-not-allowed">
              <LuPlus size={18} /> Adicionar
            </button>
            <button
              onClick={handleMagicAddTask}
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:ring-offset-zinc-950 font-semibold disabled:bg-zinc-500 disabled:cursor-not-allowed">
              {loading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <LuSparkles size={18} />
              )}
               {loading ? 'Criando...' : '✨ Adicionar Mágico'}
            </button>
          </div>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.keys(tasks).map((columnKey) => (
              <Column
                key={columnKey}
                id={columnKey}
                title={COLUMN_TITLES[columnKey]}
                tasks={tasks[columnKey]}
                onDeleteTask={handleDeleteTask}
                onUpdateTask={handleUpdateTask}
                editingId={editingId}
                setEditingId={setEditingId}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                showControls={false}
              />
            ) : null}
          </DragOverlay>
          <TrashZone isDragging={!!activeTask} isOver={isOverTrash} />
        </DndContext>
      </div>
    </main>
  )
}

export default KanbanApp
