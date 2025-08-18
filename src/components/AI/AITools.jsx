import { useMemo } from "react"
import { Box } from "lucide-react"

import { useAI } from "../../contexts/AIContext"
import { useTools } from "../../contexts/ToolContext" // Importar o novo hook

import { TOOL_DEFINITIONS } from "../../constants/tools"

import Paper from "../Paper"
import ToolButton from "./ToolButton"

const AITools = ({ loading, toolsDoor }) => {
  if (!toolsDoor) return null
  const { aiKey, aiProvider, model, freeModels, payModels, groqModels, stream, handleToolToggle } = useAI()
  const { tools: customTools } = useTools() // Pegar as ferramentas do contexto

  const allModels = [...freeModels, ...payModels, ...groqModels]
  const selectedModel = allModels.find(m => m.id === model)
  const isToolsSupported = selectedModel?.supports_tools ?? false

  const allAvailableTools = useMemo(() => {
    const nativeTools = TOOL_DEFINITIONS.map(tool => ({
      key: tool.key,
      title: tool.title,
      Icon: tool.Icon,
      isCustom: false
    }))

    const userTools = customTools.map(tool => ({
      key: tool.name,
      title: tool.name,
      Icon: Box,
      isCustom: true
    }))

    return [...nativeTools, ...userTools]
  }, [customTools])

  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-1 py-2 gap-2 rounded-lg shadow-lg max-w-[95%]
      grid grid-cols-[repeat(auto-fit,minmax(2rem,1fr))] justify-center justify-items-center mx-auto`}
    >
      {allAvailableTools.map(({ key, title, Icon }) => (
        <ToolButton
          key={key}
          toolKey={key}
          title={title}
          onToggle={handleToolToggle}
          disabled={!isToolsSupported || stream || loading}
        >
          <Icon size={16} />
        </ToolButton>
      ))}
    </Paper>
  )
}

export default AITools
