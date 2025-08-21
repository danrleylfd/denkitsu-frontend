import { AGENTS_DEFINITIONS } from "../../constants/agents"

import { useAgents } from "../../contexts/AgentContext"

import Paper from "../Paper"
import Button from "../Button"
import DynamicIcon from "../DynamicIcon"

const AIAgents = ({ loading, selectedAgent, onSelectAgent, agentsDoor }) => {
  if (!agentsDoor) return null
  const { agents } = useAgents()
  const builtInAgents = AGENTS_DEFINITIONS.map(agent => ({ ...agent, isCustom: false }))
  const customAgents = agents.map(agent => ({
    value: agent.name,
    Icon: agent.icon,
    description: agent.description,
    isCustom: true
  }))

  const Separator = () => <div className="h-6 w-px bg-bLight dark:bg-bDark mx-1" />

  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-1 py-2 gap-2 rounded-lg shadow-lg max-w-[95%]
      flex flex-wrap items-center justify-center mx-auto`}
    >
      {builtInAgents.map(({ value, Icon, description, isCustom }) => (
        <Button
          key={value}
          variant={selectedAgent === value ? "outline" : "secondary"}
          size="icon"
          $rounded
          title={`${value}: ${description}`}
          onClick={() => onSelectAgent(value)}
          disabled={loading}
        >
          {isCustom ? <DynamicIcon name={Icon} size={16} /> : <Icon size={16} />}
        </Button>
      ))}
      {builtInAgents.length > 0 && customAgents.length > 0 && <Separator />}
      {customAgents.map(({ value, Icon, description, isCustom }) => (
        <Button
          key={value}
          variant={selectedAgent === value ? "outline" : "secondary"}
          size="icon"
          $rounded
          title={`${value}: ${description}`}
          onClick={() => onSelectAgent(value)}
          disabled={loading}
        >
          {isCustom ? <DynamicIcon name={Icon} size={16} /> : <Icon size={16} />}
        </Button>
      ))}
    </Paper>
  )
}

export default AIAgents
