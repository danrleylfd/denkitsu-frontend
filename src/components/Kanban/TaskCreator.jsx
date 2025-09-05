import { Plus, Sparkle, Brain, Waypoints, } from "lucide-react"

import { useModels } from "../../contexts/ModelContext"
import { useTasks } from "../../contexts/TasksContext"

import Paper from "../Paper"
import Input from "../Input"
import Button from "../Button"

const TaskCreator = () => {
  const { aiProvider, aiProviderToggle } = useModels()
  const { newTask, setNewTask, addTask, generateTasksWithAI, loading } = useTasks()
  return (
    <Paper className="p-4">
      <h1 className="text-center text-lightFg-primary dark:text-darkFg-primary">Kanban</h1>
      <p className="text-center text-lightFg-secondary dark:text-darkFg-secondary">Descreva um objetivo e deixe a IA gerar o passo a passo para você.</p>
      <Input
        placeholder="Adicionar tarefa ou descrever um objetivo..."
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTask()}
        disabled={loading}>
        <Button variant="outline" size="icon" $rounded onClick={addTask} title="Adicionar" disabled={!newTask || loading}>
          <Plus size={16} />
        </Button>
        <Button variant="outline" size="icon" $rounded onClick={generateTasksWithAI} title="Gerar Passos" loading={loading} disabled={!newTask}>
          {!loading && <Sparkle size={16} />}
        </Button>
        <Button
          variant={aiProvider === "groq" ? "warning" : "info"}
          size="icon"
          $rounded
          onClick={aiProviderToggle}
          title={aiProvider === "groq" ? "Provedor: Groq" : "Provedor: OpenRouter"}
        >
          <Waypoints size={16} />
        </Button>
      </Input>
    </Paper>
  )
}

export default TaskCreator
