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
  const textRef = useRef(null)

  // Efeito para ciclar as dicas a cada 12 segundos
  useEffect(() => {
    tipIndexRef.current = Math.floor(Math.random() * TIPS.length)
    setTip(TIPS[tipIndexRef.current])

    const intervalId = setInterval(() => {
      tipIndexRef.current = (tipIndexRef.current + 1) % TIPS.length
      setTip(TIPS[tipIndexRef.current])
    }, 12000) // Troca a dica a cada 12 segundos

    return () => clearInterval(intervalId)
  }, [])

  // Efeito para aplicar a animação de letreiro
  useEffect(() => {
    const text = textRef.current
    // O contêiner pai é o 'Paper', que já tem 'overflow-hidden'
    const container = text?.parentElement

    if (container && text) {
      const textWidth = text.scrollWidth // Usa scrollWidth para obter a largura real do conteúdo
      const containerWidth = container.offsetWidth

      // Adiciona ou remove a classe de animação
      if (textWidth > containerWidth) {
        const speed = 75 // pixels por segundo, um pouco mais rápido
        const duration = textWidth / speed
        text.style.animationDuration = `${duration}s`
        text.classList.add("animate-marquee")
      } else {
        text.classList.remove("animate-marquee")
      }
    }
  }, [tip]) // Reavalia sempre que a dica muda

  if (!tip) return null

  return (
    <Paper className="bg-lightBg-primary dark:bg-darkBg-primary p-0 h-8 max-w-[95%] mb-2 mx-auto overflow-hidden">
      <p ref={textRef} className="text-xs text-center text-lightFg-primary dark:text-darkFg-primary will-change-transform py-1.5 whitespace-nowrap">
        {tip}
      </p>
    </Paper>
  )
}

export default AITip
