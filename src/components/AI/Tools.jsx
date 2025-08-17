import { useMemo } from "react"

import { useAI } from "../../contexts/AIContext"

import { TOOL_DEFINITIONS } from "../../constants/tools"

import Paper from "../Paper"
import ToolButton from "./ToolButton"

const AITools= ({ loading, toolsDoor }) => {
  if (!toolsDoor) return null
  const { aiKey, aiProvider, model, freeModels, payModels, groqModels, stream, handleToolToggle, } = useAI()
  const allModels = [...freeModels, ...payModels, ...groqModels]
  const selectedModel = allModels.find(m => m.id === model)
  const isToolsSupported = selectedModel?.supports_tools ?? false
  const tools = useMemo(() => {
    return TOOL_DEFINITIONS.map(tool => {
      let isDisabled = false
      if (tool.key === "web") isDisabled = aiProvider === "groq" || aiKey.length === 0 || !isToolsSupported
      else isDisabled = !isToolsSupported || stream
      return { ...tool, isDisabled }
    })
  }, [isToolsSupported, aiProvider, loading, stream])

  //grid grid-cols-5 sm:grid-cols-9
  //md:flex md:static md:mx-auto md:left-auto md:translate-x-0 md:bottom-auto
  //absolute z-20 left-1/2 -translate-x-1/2 bottom-full
  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-2 py-2 gap-2 rounded-lg shadow-lg
      max-w-[95%]
      grid grid-cols-5 sm:grid-cols-9
      md:flex static mx-auto left-auto translate-x-0 bottom-auto`}
    >
      {tools.map(({ key, title, Icon, isDisabled }) => (
        <ToolButton key={key} toolKey={key} title={title} onToggle={handleToolToggle} disabled={isDisabled}>
          <Icon size={16} />
        </ToolButton>
      ))}
    </Paper>
  )
}

export default AITools
