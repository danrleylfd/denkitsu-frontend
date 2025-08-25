import { useState, useEffect } from "react"

// import { AGENTS_DEFINITIONS } from "../../constants/agents"

import { listAgents } from "../../services/aiChat"

import { useAgents } from "../../contexts/AgentContext"

import Paper from "../Paper"
import Button from "../Button"
import DynamicIcon from "../DynamicIcon"

const AIAgents = ({ loading, selectedAgent, onSelectAgent, agentsDoor }) => {
  if (!agentsDoor) return null
  const { agents } = useAgents()
  const [builtInAgents, setBuiltInAgents] = useState([])
  useEffect(() => {
    const fetchDefinitions = async () => {
      try {
        const { data: definitions = [] } = await listAgents()
        setBuiltInAgents(definitions)
        console.log(builtInAgents[0])
      } catch (error) {
        console.error("Failed to load agent definitions:", error)
        setBuiltInAgents([])
      }
    }
    fetchDefinitions()
  }, [])
  // const builtInAgents = AGENTS_DEFINITIONS.map(agent => ({ ...agent, isCustom: false }))
  const customAgents = agents.map(agent => ({
    ...agent,
    isCustom: true
  }))

  const Separator = () => <div className="h-6 w-px bg-bLight dark:bg-bDark mx-1" />

  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-1 py-2 gap-2 rounded-lg shadow-lg max-w-[95%]
      flex flex-wrap items-center justify-center mx-auto`}
    >
      {builtInAgents.map(({ name, Icon, description, isCustom }) => (
        <Button
          key={name}
          variant={selectedAgent === name ? "outline" : "secondary"}
          size="icon"
          $rounded
          title={`${name}: ${description}`}
          onClick={() => onSelectAgent(name)}
          disabled={loading}
        >
          {isCustom ? <DynamicIcon name={Icon} size={16} /> : <Icon size={16} />}
        </Button>
      ))}
      {builtInAgents.length > 0 && customAgents.length > 0 && <Separator />}
      {customAgents.map(({ name, Icon, description, isCustom }) => (
        <Button
          key={name}
          variant={selectedAgent === name ? "outline" : "secondary"}
          size="icon"
          $rounded
          title={`${name}: ${description}`}
          onClick={() => onSelectAgent(name)}
          disabled={loading}
        >
          {isCustom ? <DynamicIcon name={Icon} size={16} /> : <Icon size={16} />}
        </Button>
      ))}
    </Paper>
  )
}

export default AIAgents
