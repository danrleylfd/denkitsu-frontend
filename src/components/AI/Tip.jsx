import { useState, useEffect, useRef } from "react"
import Marquee from "react-fast-marquee"

import Paper from "../Paper"

const TIPS = [
  "Clique no ícone de cérebro para alternar entre os provedores de IA GROQ & OpenRouter.",
  "Para usar as ferramentas use o provedor OpenRouter e configure as chaves de API nas configurações.",
  "Você pode adicionar até 3 imagens em provedores compatíveis.",
  "As ferramentas exigem um modelo compatível ex: deepseek/deepseek-chat-v3-0324:free.",
  "Pressione Shift + Enter para quebrar a linha no campo de prompt.",
  "Explore diferentes modos de IA nas configurações para tarefas específicas.",
  "Use o ícone de ferramentas para ativar a busca na web, notícias e mais.",
  "Limpe a conversa a qualquer momento clicando no ícone de nova mensagem."
]

const AITip = () => {
  const [tip, setTip] = useState("")
  const tipIndexRef = useRef(0)

  // Efeito para ciclar as dicas
  useEffect(() => {
    tipIndexRef.current = Math.floor(Math.random() * TIPS.length)
    setTip(TIPS[tipIndexRef.current])

    const intervalId = setInterval(() => {
      tipIndexRef.current = (tipIndexRef.current + 1) % TIPS.length
      setTip(TIPS[tipIndexRef.current])
    }, 15000)

    return () => clearInterval(intervalId)
  }, [])

  if (!tip) return null

  return (
    <Paper
      className="bg-lightBg-primary dark:bg-darkBg-primary p-0 h-8 max-w-[95%] mb-2 mx-auto overflow-hidden flex items-center"
    >
      <Marquee
        speed={40}
        direction="right" // Move da esquerda para a direita
        gradient={false}
        pauseOnHover={true}
      >
        <p className="text-xs text-lightFg-primary dark:text-darkFg-primary mx-4">
          {tip}
        </p>
      </Marquee>
    </Paper>
  )
}

export default AITip
