import { AGENTS_DEFINITIONS } from "../../constants/agents"

import { useAgents } from "../../contexts/AgentContext"

import Paper from "../Paper"
import Button from "../Button"
import DynamicIcon from "../DynamicIcon"

const AIAgents = ({ loading, selectedAgent, onSelectAgent, agentsDoor }) => {
  if (!agentsDoor) return null
  const { agents: customAgents } = useAgents()
  const allAgents = [
    ...AGENTS_DEFINITIONS.map(agent => ({ ...agent, isCustom: false })),
    ...customAgents.map(agent => ({
      value: agent.name,
      Icon: agent.icon,
      description: agent.description,
      isCustom: true
    }))
  ]

  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-1 py-2 gap-2 rounded-lg shadow-lg max-w-[95%]
      grid grid-cols-[repeat(auto-fit,minmax(2rem,1fr))] justify-center justify-items-center mx-auto`}
    >
      {allAgents.map(({ value, Icon, description, isCustom }) => (
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
