import { LuPlus, LuSparkles, LuBrain } from "react-icons/lu"
import { useAI } from "../contexts/AIContext"
import { useTasks } from "../contexts/TasksContext"

import Paper from "./Paper"
import Input from "./Input"
import Button from "./Button"

const AddTaskForm = () => {
  const { aiProvider, aiProviderToggle } = useAI()
  const { newTask, setNewTask, addTask, generateTasksWithAI, loading, error } = useTasks()
  return (
    <Paper className="bg-lightBg-primary dark:bg-darkBg-primary" data-oid="c7g0gor">
      <h1 className="text-center text-lightFg-primary dark:text-darkFg-primary" data-oid="nt8tj89">
        Kanban
      </h1>
      {error && (
        <p className="text-center text-danger-light" data-oid="9sarjhe">
          {error}
        </p>
      )}
      <p className="text-center text-lightFg-secondary dark:text-darkFg-secondary " data-oid="5d.2lia">
        Descreva um objetivo e deixe a IA gerar o passo a passo para você.
      </p>
      <Input
        placeholder="Adicionar tarefa ou descrever um objetivo..."
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTask()}
        disabled={loading}
        data-oid="tnj1d_l">
        <Button variant="outline" size="icon" $rounded onClick={addTask} title="Adicionar" disabled={!newTask || loading} data-oid="1v9fnji">
          <LuPlus size={16} data-oid="ji06nfj" />
        </Button>
        <Button variant="outline" size="icon" $rounded onClick={generateTasksWithAI} title="Gerar Passos" loading={loading} disabled={!newTask} data-oid="e12f3ac">
          {!loading && <LuSparkles size={16} data-oid="6ye.32q" />}
        </Button>
        <Button
          variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"}
          size="icon"
          $rounded
          onClick={aiProviderToggle}
          title={aiProvider === "groq" ? "Groq" : "OpenRouter"}
          data-oid="7bcvbl9">
          <LuBrain size={16} data-oid="nfjp7v1" />
        </Button>
      </Input>
    </Paper>
  )
}

export default AddTaskForm
