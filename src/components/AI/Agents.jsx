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
  const [agentsDefinitions, setAgentsDefinitions] = useState({ backendAgents: [], customAgents: [] })
  useEffect(() => {
    const fetchDefinitions = async () => {
      try {
        const { data } = await listAgents()
        setAgentsDefinitions({ backendAgents: data, customAgents: agents })
      } catch (error) {
        console.error("Failed to load agent definitions:", error)
        setBuiltInAgents([])
      }
    }
    fetchDefinitions()
  }, [])

  const Separator = () => <div className="h-6 w-px bg-bLight dark:bg-bDark mx-1" />

  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-1 py-2 gap-2 rounded-lg shadow-lg max-w-[95%]
      flex flex-wrap items-center justify-center mx-auto`}
    >
      {agentsDefinitions.backendAgents.map(({ name, Icon, description }) => (
        <Button
          key={name}
          variant={selectedAgent === name ? "outline" : "secondary"}
          size="icon"
          $rounded
          title={`${name}: ${description}`}
          onClick={() => onSelectAgent(name)}
          disabled={loading}
        >
          <DynamicIcon name={Icon} size={16} />
        </Button>
      ))}
      {agentsDefinitions.backendAgents.length > 0 && agentsDefinitions.customAgents.length > 0 && <Separator />}
      {agentsDefinitions.customAgents.map(({ name, Icon, description }) => (
        <Button
          key={name}
          variant={selectedAgent === name ? "outline" : "secondary"}
          size="icon"
          $rounded
          title={`${name}: ${description}`}
          onClick={() => onSelectAgent(name)}
          disabled={loading}
        >
          <DynamicIcon name={Icon} size={16} />
        </Button>
      ))}
    </Paper>
  )
}

export default AIAgents
