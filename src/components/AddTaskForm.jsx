import { LuPlus, LuSparkles } from "react-icons/lu"
import { useKanban } from "../contexts/KanbanContext"
import Input from "./Input"
import Button from "./Button"

const AddTaskForm = () => {
  const { newTask, setNewTask, addTask, generateTasksWithAI, loading, error } = useKanban()
  return (
    <header className="flex flex-col gap-2 w-full">
      <h1 className="text-center">KanKan</h1>
      {error && <p className="text-center text-danger-light">{error}</p>}
      <p className="text-center text-light-secondaryText dark:text-dark-secondaryText">Descreva um objetivo e deixe a IA criar as tarefas para você.</p>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Adicionar tarefa ou descrever um objetivo..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          disabled={loading}
        >
          <Button variant="outline" size="icon" $rounded onClick={addTask} title="Adicionar" loading={loading} disabled={!newTask}>
            {!loading && <LuPlus size={16}/>}
          </Button>
          <Button variant="outline" size="icon" $rounded onClick={generateTasksWithAI} title="Gerar Passos" loading={loading} disabled={!newTask}>
            {!loading && <LuSparkles size={16}/>}
          </Button>
        </Input>
      </div>
    </header>
  )
}

export default AddTaskForm
