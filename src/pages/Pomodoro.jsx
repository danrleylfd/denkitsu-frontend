import { useState, useEffect } from "react"
import { Timer, Settings, Play, Pause, RefreshCw } from "lucide-react"

import SideMenu from "../components/SideMenu"
import Button from "../components/Button"

const ContentView = ({ children }) => <main className="flex justify-center items-center p-2 gap-2 min-h-screen w-full">{children}</main>

const Pomodoro = () => {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState("work")
  const [cycles, setCycles] = useState(0)
  useEffect(() => {
    const savedState = localStorage.getItem("pomodoroState")
    if (savedState) {
      const { minutes, seconds, mode, cycles, isActive } = JSON.parse(savedState)
      setMinutes(minutes)
      setSeconds(seconds)
      setMode(mode)
      setCycles(cycles)
      setIsActive(isActive)
    }
  }, [])

  useEffect(() => {
    let interval
    if (isActive) {
      interval = setInterval(() => {
        localStorage.setItem("pomodoroState", JSON.stringify({ minutes, seconds, mode, cycles, isActive }))
        if (seconds === 0) {
          if (minutes === 0) {
            const notification = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3")
            notification.play()
            if (mode === "work") {
              setMode("break")
              setMinutes(5)
              setCycles((c) => c + 1)
            } else {
              setMode("work")
              setMinutes(25)
            }
          } else {
            setMinutes(minutes - 1)
            setSeconds(59)
          }
        } else {
          setSeconds(seconds - 1)
        }
      }, 1000)
    }
    return () => interval && clearInterval(interval)
  }, [isActive, minutes, seconds, mode, cycles])

  const toggleTimer = () => setIsActive(!isActive)
  const resetTimer = () => {
    setIsActive(false)
    setMode("work")
    setMinutes(25)
    setSeconds(0)
    setCycles(0)
    localStorage.removeItem("pomodoroState")
  }

  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
      <div className="bg-white dark:bg-zinc-900 shadow-[6px_6px_16px_rgba(0,0,0,0.5)] p-4 rounded-lg w-full max-w-96 transition-colors opacity-75 dark:opacity-90">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <span className="w-8 h-8 text-zinc-700 dark:text-zinc-100 mr-2 flex items-center justify-center">
              <Timer size={24} />
            </span>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Pomodoro</h1>
              <h2 className="text-xl font-bold text-zinc-700 dark:text-zinc-300">by Denkitsu</h2>
            </div>
          </div>
        </div>
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <div className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">{mode === "work" ? "Sessão de Trabalho" : "Hora do Intervalo"}</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Ciclos Completados: {cycles}</div>
        </div>
        <div className="flex justify-center mb-8 gap-4">
          <Button variant="secondary" size="icon" $rounded title={isActive ? "Pause" : "Play"} onClick={toggleTimer}>
            {isActive ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <Button variant="secondary" size="icon" $rounded title="Reiniciar" onClick={resetTimer}>
            <RefreshCw size={16} />
          </Button>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center text-sm text-zinc-700 dark:text-zinc-300">
            <span className="w-4 h-4 mr-2 flex items-center justify-center">
              <Settings size={16} />
            </span>
            <span>Trabalho: 25 minutos • Intervalo: 5 minutos</span>
          </div>
        </div>
      </div>
    </SideMenu>
  )
}

export default Pomodoro
