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
  const [animation, setAnimation] = useState({ duration: 0, className: "" })
  const tipIndexRef = useRef(0)
  const paperRef = useRef(null)
  const paragraphRef = useRef(null)

  // Efeito para ciclar as dicas
  useEffect(() => {
    // Define a primeira dica aleatoriamente
    tipIndexRef.current = Math.floor(Math.random() * TIPS.length)
    setTip(TIPS[tipIndexRef.current])

    const intervalId = setInterval(() => {
      tipIndexRef.current = (tipIndexRef.current + 1) % TIPS.length
      setTip(TIPS[tipIndexRef.current])
    }, 12000) // Troca a dica a cada 12 segundos para dar tempo à animação

    return () => clearInterval(intervalId)
  }, [])

  // Efeito para controlar a animação
  useEffect(() => {
    const paperElement = paperRef.current
    const pElement = paragraphRef.current

    if (paperElement && pElement) {
      const containerWidth = paperElement.offsetWidth
      const textWidth = pElement.scrollWidth

      if (textWidth > containerWidth) {
        const speed = 70 // pixels por segundo
        const duration = textWidth / speed
        setAnimation({
          duration: `${duration}s`,
          className: "animate-letreiro" // Usa a classe CSS definida em global.css
        })
      } else {
        // Se o texto couber, remove a animação e centraliza
        setAnimation({
          duration: 0,
          className: "text-center w-full"
        })
      }
    }
  }, [tip]) // Re-executa sempre que a dica mudar

  if (!tip) return null

  return (
    <Paper
      ref={paperRef}
      className="bg-lightBg-primary dark:bg-darkBg-primary p-0 h-8 max-w-[95%] mb-2 mx-auto overflow-hidden flex items-center"
    >
      <p
        ref={paragraphRef}
        className={`text-xs text-lightFg-primary dark:text-darkFg-primary whitespace-nowrap ${animation.className}`}
        style={{ animationDuration: animation.duration }}
      >
        {tip}
      </p>
    </Paper>
  )
}

export default AITip
