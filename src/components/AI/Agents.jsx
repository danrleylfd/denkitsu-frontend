import { useAI } from "../../contexts/AIContext"
import { useAgents } from "../../contexts/AgentContext"

import Paper from "../Paper"
import Button from "../Button"
import DynamicIcon from "../DynamicIcon"

const AIAgents = ({ selectedAgent, onSelectAgent, agentsDoor }) => {
  if (!agentsDoor) return null
  const { loadingMessages, isImproving } = useAI()
  const { agents } = useAgents()

  const Separator = () => <div className="h-6 w-px bg-bLight dark:bg-bDark mx-1" />

  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-1 py-2 gap-2 rounded-lg shadow-lg max-w-[95%]
      flex flex-wrap items-center justify-center mx-auto`}
    >
      {agents.backendAgents.map(({ name, Icon, description }) => (
        <Button
          key={name}
          $border={selectedAgent === name ? "outline" : "secondary"}
          variant={selectedAgent === name ? "outline" : "secondary"}
          size="icon"
          $rounded
          title={`${name}: ${description}`}
          onClick={() => onSelectAgent(name)}
          disabled={loadingMessages || isImproving}
        >
          <DynamicIcon name={Icon} size={16} />
        </Button>
      ))}
      {agents.backendAgents.length > 0 && agents.customAgents.length > 0 && <Separator />}
      {agents.customAgents.map(({ name, Icon, description }) => (
        <Button
          key={name}
          $border={selectedAgent === name ? "outline" : "secondary"}
          variant={selectedAgent === name ? "outline" : "secondary"}
          size="icon"
          $rounded
          title={`${name}: ${description}`}
          onClick={() => onSelectAgent(name)}
          disabled={loadingMessages || isImproving}
        >
          <DynamicIcon name={Icon} size={16} />
        </Button>
      ))}
    </Paper>
  )
}

export default AIAgents
