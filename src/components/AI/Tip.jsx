import { useState, useEffect, useRef } from "react"
import Paper from "../Paper"

const TIPS = [
  "Pressione Shift + Enter para quebrar a linha no campo de prompt.",
  "Clique no ícone de cérebro para alternar entre os provedores de IA.",
  "Você pode adicionar até 3 imagens em provedores compatíveis.",
  "Explore diferentes modos de IA nas configurações para tarefas específicas.",
  "Use o ícone de ferramentas para ativar a busca na web, notícias e mais.",
  "Limpe a conversa a qualquer momento clicando no ícone de nova mensagem."
]

const AITip = () => {
  const [tip, setTip] = useState("")
  const tipIndexRef = useRef(0)
  const containerRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    tipIndexRef.current = Math.floor(Math.random() * TIPS.length)
    setTip(TIPS[tipIndexRef.current])

    const intervalId = setInterval(() => {
      tipIndexRef.current = (tipIndexRef.current + 1) % TIPS.length
      setTip(TIPS[tipIndexRef.current])
    }, 12000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const text = textRef.current
    if (container && text) {
      const textWidth = text.offsetWidth
      const containerWidth = container.offsetWidth
      text.classList.remove("animate-marquee")
      container.classList.remove("justify-center")
      if (textWidth > containerWidth) {
        const speed = 60
        const duration = textWidth / speed
        text.style.animationDuration = `${duration}s`
        text.classList.add("animate-marquee")
      } else {
        container.classList.add("justify-center")
      }
    }
  }, [tip])
  if (!tip) return null
  return (
    <Paper ref={containerRef} className="bg-lightBg-primary dark:bg-darkBg-primary p-0 flex items-center overflow-hidden whitespace-nowrap h-8 max-w-[95%] mb-2 mx-auto">
      <p ref={textRef} className="text-xs text-lightFg-primary dark:text-darkFg-primary px-3 will-change-transform">{tip}</p>
    </Paper>
  )
}

export default AITip
