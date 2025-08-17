import { BarChart2, Rss, Code, Presentation, Shield, GraduationCap, Lightbulb, Newspaper, ListTree, Bot, Speech } from "lucide-react"

import Paper from "../Paper"
import Button from "../Button"

const AIAgents = ({ loading, selectedAgent, onSelectAgent, agentsDoor }) => {
  if (!agentsDoor) return null

  const agentOptions = [
    { value: "Padrão", icon: <Bot size={16} /> },
    { value: "Analista", icon: <BarChart2 size={16} /> },
    { value: "Blogueiro", icon: <Rss size={16} /> },
    { value: "Desenvolvedor", icon: <Code size={16} /> },
    { value: "Lousa", icon: <Presentation size={16} /> },
    { value: "Prompter", icon: <Lightbulb size={16} /> },
    { value: "Redator", icon: <Newspaper size={16} /> },
    { value: "Secretário", icon: <ListTree size={16} /> },
    { value: "Transcritor", icon: <Speech size={16} /> },
  ]

  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-1 py-2 gap-2 rounded-lg shadow-lg max-w-[95%]
      grid grid-cols-[repeat(auto-fit,minmax(2.25rem,1fr))] justify-center justify-items-center mx-auto`}
    >
      {agentOptions.map((agent) => (
        <Button key={agent.value} variant={selectedAgent === agent.value ? "outline" : "secondary"} size="icon" $rounded title={agent.value} onClick={() => onSelectAgent(agent.value)} disabled={loading}>
          {agent.icon}
        </Button>
      ))}
    </Paper>
  )
}

export default AIAgents
