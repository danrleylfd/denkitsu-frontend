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

  // Efeito para ciclar as dicas de tempos em tempos
  useEffect(() => {
    // Define a primeira dica
    tipIndexRef.current = Math.floor(Math.random() * TIPS.length)
    setTip(TIPS[tipIndexRef.current])

    // Inicia o intervalo para trocar a dica
    const intervalId = setInterval(() => {
      tipIndexRef.current = (tipIndexRef.current + 1) % TIPS.length
      setTip(TIPS[tipIndexRef.current])
    }, 15000) // Troca a cada 15 segundos

    // Limpa o intervalo ao desmontar o componente
    return () => clearInterval(intervalId)
  }, [])

  if (!tip) return null

  return (
    <Paper
      // O contêiner que "corta" o texto que transborda
      className="bg-lightBg-primary dark:bg-darkBg-primary p-0 h-8 max-w-[95%] mb-2 mx-auto overflow-hidden flex items-center">
      <p
        // A chave `key` força o React a remontar o <p> quando a dica muda,
        // o que reinicia a animação CSS do zero para a nova dica.
        key={tip}
        className="animacao-letreiro-puro text-xs text-lightFg-primary dark:text-darkFg-primary will-change-transform">
        {tip}
      </p>
    </Paper>
  )
}

export default AITip
