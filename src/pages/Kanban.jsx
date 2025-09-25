import { usePomodoro } from "../contexts/PomodoroContext"
import KanbanBoard from "../components/Kanban/Board"
import Pomodoro from "../components/Kanban/Pomodoro"

const Kanban = () => {
  const { associatedTask, stopFocusSession } = usePomodoro()

  return (
    <div className="flex flex-1 flex-col gap-2 my-2 overflow-y-auto">
      <KanbanBoard />
      {associatedTask && <Pomodoro onClose={stopFocusSession} />}
    </div>
  )
}

export default Kanban
