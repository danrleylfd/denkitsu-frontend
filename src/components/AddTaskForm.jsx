import { LuPlus, LuSparkles, LuSave, LuTrash2 } from "react-icons/lu"
import { useKanban } from "../contexts/KanbanContext"

import Paper from "./Paper"
import Input from "./Input"
import Button from "./Button"

const AddTaskForm = () => {
  const { aiKey, setAiKey, hasKey, saveKey, removeKey, newTask, setNewTask, addTask, generateTasksWithAI, loading, error } = useKanban()
  return (
    <Paper className="bg-lightBg-primary dark:bg-darkBg-primary">
      <h1 className="text-center text-lightFg-primary dark:text-darkFg-primary">Kanban</h1>
      {error && <p className="text-center text-danger-light">{error}</p>}
      <p className="text-center text-lightFg-secondary dark:text-darkFg-secondary ">Descreva um objetivo e deixe a IA criar as tarefas para você.</p>
      <Input
        name="ai-key"
        type="password"
        autoComplete="new-password"
        placeholder="Digite sua chave de api openrouter.ai"
        value={aiKey}
        onChange={(e) => setAiKey(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && saveKey()}
        disabled={loading}>
        <Button variant="outline" size="icon" $rounded onClick={saveKey} title="Salvar" disabled={!aiKey || loading}>
          <LuSave size={16} />
        </Button>
        <Button variant="danger" size="icon" $rounded onClick={removeKey} title="Excluir" disabled={!aiKey || loading}>
          <LuTrash2 size={16} />
        </Button>
      </Input>
      <Input
        placeholder="Adicionar tarefa ou descrever um objetivo..."
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTask()}
        disabled={loading}>
        <Button variant="outline" size="icon" $rounded onClick={addTask} title="Adicionar" disabled={!newTask || loading}>
          <LuPlus size={16} />
        </Button>
        <Button variant="outline" size="icon" $rounded onClick={() => generateTasksWithAI(aiKey)} title="Gerar Passos" loading={loading} disabled={!newTask}>
          {!loading && <LuSparkles size={16} />}
        </Button>
      </Input>
    </Paper>
  )
}

export default AddTaskForm
