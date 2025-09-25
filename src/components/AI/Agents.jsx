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

  const Separator = () => <div className="h-6 w-px bg-bLight dark:bg-bDark mx-1" />

  return (
    <Paper className="max-w-[99%] flex flex-wrap items-center justify-center gap-2 px-4 py-2 mx-auto">
      {agents.backendAgents.map(({ name, Icon, description, disabled = false }) => (
        <Button
          key={name}
          $border={selectedAgent === name ? "outline" : "secondary"}
          variant={selectedAgent === name ? "outline" : "secondary"}
          size="icon"
          $rounded
          title={`${name}: ${description}`}
          onClick={() => setSelectedAgent(name)}
          disabled={disabled || isDisabled}
        >
          <DynamicIcon name={Icon} size={16} className={selectedAgent === name ? "mr-2" : ""} />
          {selectedAgent === name && (<span>{name}</span>)}
        </Button>
      ))}
      {agents.backendAgents.length > 0 && agents.customAgents.length > 0 && <Separator />}
      {agents.customAgents.map(({ name, Icon, description }) => (
        <Button key={name} title={`${name}: ${description}`} $border={selectedAgent === name ? "outline" : "secondary"} variant={selectedAgent === name ? "outline" : "secondary"} size="icon" $rounded onClick={() => setSelectedAgent(name)} disabled={isDisabled}>
          <DynamicIcon name={Icon} size={16} className={selectedAgent === name ? "mr-2" : ""} />
          {selectedAgent === name && <span>{name}</span>}
        </Button>
      ))}
    </Paper>
  )
}

export default AIAgents
