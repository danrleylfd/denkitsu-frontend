import { AGENTS_DEFINITIONS } from "../../constants/agents"

import Paper from "../Paper"
import Button from "../Button"

const AIAgents = ({ loading, selectedAgent, onSelectAgent, agentsDoor }) => {
  if (!agentsDoor) return null
  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-1 py-2 gap-2 rounded-lg shadow-lg max-w-[95%]
      grid grid-cols-[repeat(auto-fit,minmax(2rem,1fr))] justify-center justify-items-center mx-auto`}
    >
      {AGENTS_DEFINITIONS.map(({ value, Icon }) => (
        <Button key={value} variant={selectedAgent === value ? "outline" : "secondary"} size="icon" $rounded title={value} onClick={() => onSelectAgent(value)} disabled={loading}>
          <Icon size={16} />
        </Button>
      ))}
    </Paper>
  )
}

export default AIAgents
