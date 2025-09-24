import { usePomodoro } from "../contexts/PomodoroContext"
import KanbanBoard from "../components/Kanban/Board"
import Pomodoro from "../components/Kanban/Pomodoro"

const Kanban = () => {
  const { associatedTask, stopFocusSession } = usePomodoro()

  return (
    <>
      <KanbanBoard />
      {associatedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <Pomodoro onClose={stopFocusSession} />
        </div>
      )}
    </>
  )
}

export default Kanban
