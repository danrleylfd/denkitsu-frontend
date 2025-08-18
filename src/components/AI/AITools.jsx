import { useMemo } from "react"
import { Shapes } from "lucide-react" // Usaremos Shapes como um ícone mais adequado

import { useAI } from "../../contexts/AIContext"
import { useTools } from "../../contexts/ToolContext"

import { TOOL_DEFINITIONS } from "../../constants/tools"

import Paper from "../Paper"
import ToolButton from "./ToolButton"

const AITools = ({ loading, toolsDoor }) => {
  if (!toolsDoor) return null
  const { aiKey, aiProvider, model, freeModels, payModels, groqModels, stream, handleToolToggle } = useAI()
  const { tools: customTools } = useTools()

  const allModels = [...freeModels, ...payModels, ...groqModels]
  const selectedModel = allModels.find(m => m.id === model)
  const isToolsSupported = selectedModel?.supports_tools ?? false

  const allAvailableTools = useMemo(() => {
    const nativeTools = TOOL_DEFINITIONS.map(tool => {
      let isDisabled = !isToolsSupported || stream || loading
      if (tool.key === "web") isDisabled = isDisabled || aiProvider === "groq" || aiKey.length === 0
      return {
        key: tool.key,
        title: tool.title,
        Icon: tool.Icon,
        isDisabled: isDisabled
      }
    })
    const userTools = customTools.map(tool => ({
      key: tool.name,
      title: tool.alias || tool.name,
      Icon: Shapes,
      isDisabled: !isToolsSupported || stream || loading
    }))
    return [...nativeTools, ...userTools]
  }, [customTools, isToolsSupported, stream, loading, aiProvider, aiKey])

  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-1 py-2 gap-2 rounded-lg shadow-lg max-w-[95%]
      grid grid-cols-[repeat(auto-fit,minmax(2rem,1fr))] justify-center justify-items-center mx-auto`}
    >
      {allAvailableTools.map(({ key, title, Icon, isDisabled }) => (
        <ToolButton
          key={key}
          toolKey={key}
          title={title}
          onToggle={handleToolToggle}
          disabled={isDisabled}
        >
          <Icon size={16} />
        </ToolButton>
      ))}
    </Paper>
  )
}

export default AITools
