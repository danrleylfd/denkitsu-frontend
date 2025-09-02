import { useState, useEffect, useRef, useCallback } from "react"
import Marquee from "react-fast-marquee"
import { Info } from "lucide-react"

import Paper from "../Paper"
import Button from "../Button"

const TIPS = [
  "Alterne entre os provedores de IA Groq & OpenRouter",
  "Configure as chaves de API dos provedores nas configurações para desbloquear a análise de imagens e as ferramentas",
  "Explore diferentes Agentes de IA nas configurações para tarefas específicas",
  "Descreva como Denkitsu deve se comportar em configurações",
  "Salve seu UID do Genshin no prompt personalizado, assim toda vez que precisar de uma analise, só precisará mencionar o nome do personagem",
  "A análise de imagens exige um modelo compatível ex: qwen/qwen2.5-vl-72b-instruct:free. Máximo 3 imagens.",
  "Use as ferramentas para contextualizar o Denkitsu",
  "As ferramentas exigem um modelo compatível ex: deepseek/deepseek-chat-v3-0324:free",
  "Pressione Ctrl + Enter para enviar o prompt",
  "Para usar os comandos ative as ferramentas necessárias e digite # e uma lista de comandos aparecerá",
  "Limpe a conversa a qualquer momento clicando no ícone de nova mensagem",
  "Entregue a ferramenta Buscar Notícias ao Agente Redator e veja a mágica acontecer",
  "Experimente também entregar as ferramentas de cotação albion e cripto ao Agente Analista",
  "A Transcrição funciona melhor com o Agente Transcritor",
  "🛠️🖼️📄 | Indica que o modelo é compatível com 🛠️ ferramentas / 🖼️ visão computacional / 📄 upload de arquivos",
]

const AITip = ({ toggleFeaturesDoor }) => {
  const [tip, setTip] = useState("")
  const tipIndexRef = useRef(0)
  const intervalIdRef = useRef(null)
  const advanceToNextTip = useCallback(() => {
    clearInterval(intervalIdRef.current)
    const newIndex = (tipIndexRef.current + 1) % TIPS.length
    tipIndexRef.current = newIndex
    setTip(TIPS[newIndex])
    intervalIdRef.current = setInterval(advanceToNextTip, 15000)
  }, [])
  useEffect(() => {
    tipIndexRef.current = 0
    setTip(TIPS[tipIndexRef.current])
    intervalIdRef.current = setInterval(advanceToNextTip, 15000)
    return () => clearInterval(intervalIdRef.current)
  }, [advanceToNextTip])
  if (!tip) return null
  return (
    <Paper onClick={advanceToNextTip} className="bg-lightBg-primary dark:bg-darkBg-primary px-2 py-2 h-8 max-w-[95%] mb-1 mx-auto overflow-hidden flex items-center justify-between">
      <Button variant="secondary" size="icon" $rounded title="Recursos" onClick={(e) => { e.stopPropagation(); toggleFeaturesDoor() }}>
        <Info size={16} />
      </Button>
      <div className="flex-grow overflow-hidden">
        <Marquee speed={50} direction="left" pauseOnHover={true} gradient={false}>
          <p className="text-xs text-lightFg-primary dark:text-darkFg-primary pr-2">{tip}</p>
        </Marquee>
      </div>
    </Paper>
  )
}

export default AITip
