import { Plus, Sparkle, Brain } from "lucide-react"

import { useAI } from "../../contexts/AIContext"
import { useTasks } from "../../contexts/TasksContext"

import Paper from "../Paper"
import Input from "../Input"
import Button from "../Button"

const TaskCreator = () => {
  const { aiProvider, aiProviderToggle } = useAI()
  const { newTask, setNewTask, addTask, generateTasksWithAI, loading } = useTasks()
  return (
    <Paper className="bg-lightBg-primary dark:bg-darkBg-primary">
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
          title={aiProvider === "groq" ? "Groq" : "OpenRouter"}>
          <Brain size={16} />
        </Button>
      </Input>
    </Paper>
  )
}

export default TaskCreator
