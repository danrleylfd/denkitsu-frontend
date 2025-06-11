import { useState, useEffect } from "react"
import { LuTimer, LuSettings, LuPlay, LuPause, LuRefreshCw, LuSun, LuMoon } from "react-icons/lu"

import { useTheme } from "../../contexts/ThemeContext"

import SideMenu from "../../components/SideMenu"
import Button from "../../components/Button"

import {
  SideContentContainer,
  PomodoroCard,
  PomoHeader,
  HeaderInfo,
  TimerIcon,
  TitleContainer,
  Title,
  Subtitle,
  DisplaySection,
  TimeText,
  ModeText,
  CyclesText,
  Controls,
  SettingsInfo,
  SettingsTextContainer,
  SettingsIcon
} from "./styles"

const Pomodoro = () => {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState("work")
  const [cycles, setCycles] = useState(0)
  const { theme, toggleTheme } = useTheme()

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
        localStorage.setItem(
          "pomodoroState",
          JSON.stringify({
            minutes,
            seconds,
            mode,
            cycles,
            isActive
          })
        )
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

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, minutes, seconds, mode, cycles])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setMode("work")
    setMinutes(25)
    setSeconds(0)
    setCycles(0)
    localStorage.removeItem("pomodoroState")
  }

  return (
    <SideMenu ContentView={SideContentContainer}>
      <PomodoroCard>
        <PomoHeader>
          <HeaderInfo>
            <TimerIcon>
              <LuTimer />
            </TimerIcon>
            <TitleContainer>
              <Title>Temporizador Pomodoro</Title>
              <Subtitle>by Denkitsu</Subtitle>
            </TitleContainer>
          </HeaderInfo>
          <Button variant={theme === "light" ? "warning" : "outline"} size="icon" $rounded title="Alternar tema" onClick={toggleTheme}>
            {theme === "light" ? <LuMoon size={16} /> : <LuSun size={16} />}
          </Button>
        </PomoHeader>
        <DisplaySection>
          <TimeText>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </TimeText>
          <ModeText>{mode === "work" ? "Sessão de Trabalho" : "Hora do Intervalo"}</ModeText>
          <CyclesText>Ciclos Completados: {cycles}</CyclesText>
        </DisplaySection>

        <Controls>
          <Button variant="secondary" size="icon" $rounded title={isActive ? "Pause" : "Play"} onClick={toggleTimer}>
            {isActive ? <LuPause size={16} /> : <LuPlay size={16} />}
          </Button>
          <Button variant="secondary" size="icon" $rounded title="Reiniciar" onClick={resetTimer}>
            <LuRefreshCw size={16} />
          </Button>
        </Controls>

        <SettingsInfo>
          <SettingsTextContainer>
            <SettingsIcon>
              <LuSettings />
            </SettingsIcon>
            <span>Trabalho: 25 minutos • Intervalo: 5 minutos</span>
          </SettingsTextContainer>
        </SettingsInfo>
      </PomodoroCard>
    </SideMenu>
  )
}

export default Pomodoro
