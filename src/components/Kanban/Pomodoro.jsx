import { Link } from "react-router-dom"
import { Timer, Settings, Play, Pause, RefreshCw, Volume2, X } from "lucide-react"

import { usePomodoro } from "../../contexts/PomodoroContext"

import Paper from "../Paper"
import Button from "../Button"

const Pomodoro = ({ onClose }) => {
  const {
    minutes,
    seconds,
    isActive,
    mode,
    cycles,
    associatedTask,
    toggleTimer,
    resetTimer,
    testNotificationSound
  } = usePomodoro()

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/67 backdrop-blur-sm">
      <Paper className="relative flex flex-1 flex-col gap-2 p-2 rounded-lg shadow-lg w-full max-w-md max-h-[95%] border border-solid border-brand-purple">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center">
            <Timer size={24} className="mr-2 text-lightFg-primary dark:text-darkFg-primary"/>
            <h2 className="text-lightFg-primary dark:text-darkFg-primary">Pomodoro</h2>
          </div>
          <Button variant="danger" size="icon" $rounded title="Fechar" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-lightFg-primary dark:text-darkFg-primary mb-4">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <div className="text-lg font-medium text-lightFg-secondary dark:text-darkFg-secondary mb-2 h-10 flex items-center justify-center">
            {associatedTask
              ? (
                  <span className="text-sm font-bold">Foco: [
                    <span className="font-bold text-primary-base uppercase">{associatedTask.content}</span>
                  ]</span>
                )
              : (<span>{mode === "work" ? "Sessão de Trabalho" : "Hora do Intervalo"}</span>)
            }
          </div>
          <div className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">Ciclos Completados: {cycles}</div>
        </div>
        <div className="flex justify-center mb-8 gap-4">
          <Button variant="secondary" size="icon" $rounded title={isActive ? "Pausar" : "Iniciar"} onClick={toggleTimer}>
            {isActive ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <Button variant="secondary" size="icon" $rounded title="Reiniciar" onClick={resetTimer}>
            <RefreshCw size={16} />
          </Button>
          <Button variant="secondary" size="icon" $rounded title="Testar Efeito Sonoro" onClick={testNotificationSound}>
            <Volume2 size={16} />
          </Button>
        </div>
        <div className="bg-lightBg-secondary dark:bg-darkBg-secondary rounded-lg p-4">
          <div className="flex items-center text-sm text-lightFg-secondary dark:text-darkFg-secondary">
            <Settings size={16} className="mr-2" />
            Trabalho: 25 min • Intervalo: 5 min • Pausa longa: 15 min
          </div>
        </div>
      </Paper>
    </div>
  )
}

export default Pomodoro
