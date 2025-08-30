import { useAuth } from "../../contexts/AuthContext"
import { useAgents } from "../../contexts/AgentContext"
import { useAI } from "../../contexts/AIContext"
import Paper from "../Paper"
import Button from "../Button"
import DynamicIcon from "../DynamicIcon"

const AIAgents = ({ agentsDoor }) => {
  const { signed } = useAuth()
  if (!signed || !agentsDoor) return null
  const { agents, selectedAgent, setSelectedAgent, loadingAgents } = useAgents()
  const { loadingMessages, isImproving } = useAI()

  const isDisabled = loadingMessages || isImproving || loadingAgents

  const allAgents = [...agents.backendAgents, ...agents.customAgents]
  const activeAgent = allAgents.find((agent) => agent.name === selectedAgent)

  const Separator = () => <div className="h-6 w-px bg-bLight dark:bg-bDark mx-1" />

  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-1 py-2 gap-2 rounded-lg shadow-lg max-w-[95%]
      flex flex-wrap items-center justify-center mx-auto`}
    >
      {activeAgent && (
        <div className="flex items-center justify-center gap-2 text-lightFg-primary dark:text-darkFg-primary">
          <DynamicIcon name={activeAgent.Icon} size={16} />
          <span className="font-bold text-sm select-none">{activeAgent.name}</span>
        </div>
      )}
      {agents.backendAgents.map(({ name, Icon, description }) => (
        <Button
          key={name}
          $border={selectedAgent === name ? "outline" : "secondary"}
          variant={selectedAgent === name ? "outline" : "secondary"}
          size="icon"
          $rounded
          title={`${name}: ${description}`}
          onClick={() => setSelectedAgent(name)}
          disabled={isDisabled}
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
          onClick={() => setSelectedAgent(name)}
          disabled={isDisabled}
        >
          <DynamicIcon name={Icon} size={16} />
        </Button>
      ))}
    </Paper>
  )
}

export default AIAgents
