import { useState, useEffect } from "react"
import Paper from "./Paper"

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
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * TIPS.length)
    setTip(TIPS[randomIndex])
  }, [])
  if (!tip) return null
  return (
    <Paper className="bg-lightBg dark:bg-darkBg">
      <p className="text-center text-xs text-lightFg-tertiary dark:text-darkFg-tertiary px-4 py-1">{tip}</p>
    </Paper>
  )
}

export default AITip
