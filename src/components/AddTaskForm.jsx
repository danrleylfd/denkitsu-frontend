import { LuPlus, LuSparkles } from "react-icons/lu"
import { useKanban } from "../contexts/KanbanContext"
import Input from "./Input"
import Button from "./Button"

const AddTaskForm = () => {
  const { newTask, setNewTask, addTask, generateTasksWithAI, loading, error } = useKanban()

  return (
    <header className="mb-8">
      <h1 className="text-center mb-2">KanKan</h1>
      {error && <p className="text-center text-danger-light">{error}</p>}
      <p className="text-center text-light-secondaryText dark:text-dark-secondaryText">Descreva um objetivo e deixe a IA criar as tarefas para você.</p>
      <div className="flex items-center gap-2 mt-6 max-w-2xl mx-auto">
        <Input
          placeholder="Adicionar tarefa ou descrever um objetivo..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          disabled={loading}
        >
          <Button variant="outline" size="icon" $rounded onClick={addTask} title="Adicionar" loading={loading}>
            <LuPlus size={16}/>
          </Button>
          <Button variant="outline" size="icon" $rounded onClick={generateTasksWithAI} title="Gerar Passos" loading={loading}>
            <LuSparkles size={16}/>
          </Button>
        </Input>
        {/* <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Adicionar tarefa ou descrever um objetivo..."
          className="flex-1 p-3 rounded-lg border bg-light-inputBg dark:bg-dark-inputBg border-light-border dark:border-dark-border focus:ring-2 focus:ring-primary-base focus:outline-none transition-shadow"
          disabled={loading}
        /> */}
        {/* <button
          onClick={addTask}
          disabled={loading}
          className="flex items-center gap-2 bg-primary-base text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-base dark:ring-offset-dark-background font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          <LuPlus size={18} /> Adicionar
        </button> */}
        {/* <button
          onClick={generateTasksWithAI}
          disabled={loading}
          className="flex items-center gap-2 bg-brand-purple text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple dark:ring-offset-dark-background font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin-fast"></div> : <LuSparkles size={18} />}
          {loading ? "Criando..." : "Gerar Passos"}
        </button> */}
      </div>
    </header>
  )
}

export default AddTaskForm
