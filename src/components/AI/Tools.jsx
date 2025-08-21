import { useMemo } from "react"

import { useAI } from "../../contexts/AIContext"
import { useTools } from "../../contexts/ToolContext"

import { TOOL_DEFINITIONS } from "../../constants/tools"

import Paper from "../Paper"
import ToolButton from "./ToolButton"
import DynamicIcon from "../DynamicIcon"

const AITools = ({ loading, toolsDoor }) => {
  if (!toolsDoor) return null
  const { aiProvider, aiKey, model, handleToolToggle, freeModels, payModels, groqModels } = useAI()
  const { tools: customTools } = useTools()
  const { internalTools, backendTools, userTools } = useMemo(() => {
    const allModels = [...freeModels, ...payModels, ...groqModels]
    const selectedModel = allModels.find(m => m.id === model)
    const internalToolKeys = new Set(["webSearch", "browserSearch", "codeExecution"])
    const processTool = (tool) => {
      let isDisabled = loading
      const isCompoundModel = model?.startsWith("compound-")
      const isGptOssModel = model?.startsWith("openai/gpt-oss-")
      switch (tool.key) {
        case "webSearch":
          if (aiProvider === "groq") isDisabled = isDisabled || !isCompoundModel
          else isDisabled = isDisabled || aiKey.length === 0 || !selectedModel?.supports_tools
          break
        case "browserSearch":
          isDisabled = isDisabled || !isGptOssModel
          break
        case "codeExecution":
          isDisabled = isDisabled || (!isCompoundModel && !isGptOssModel)
          break
        default:
          isDisabled = isDisabled || aiKey.length === 0 || !selectedModel?.supports_tools
          break
      }
      return { ...tool, isDisabled }
    }
    const nativeTools = TOOL_DEFINITIONS.map(processTool)
    return {
      internalTools: nativeTools.filter(t => internalToolKeys.has(t.key)),
      backendTools: nativeTools.filter(t => !internalToolKeys.has(t.key)),
      userTools: customTools.map(tool => ({
        key: tool.name,
        title: tool.alias || tool.name,
        Icon: tool.icon || "PocketKnife",
        isCustom: true,
        isDisabled: loading || aiKey.length === 0 || !selectedModel?.supports_tools
      }))
    }
  }, [customTools, model, loading, aiKey, aiProvider, freeModels, payModels, groqModels])

  const Separator = () => <div className="h-6 w-px bg-bLight dark:bg-bDark mx-1" />

  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-1 py-2 gap-2 rounded-lg shadow-lg max-w-[95%]
      flex flex-wrap items-center justify-center mx-auto`}
    >
      {internalTools.map(({ key, title, Icon, isDisabled }) => (
        <ToolButton key={key} toolKey={key} title={title} onToggle={handleToolToggle} disabled={isDisabled}>
          <Icon size={16} />
        </ToolButton>
      ))}
      {(internalTools.length > 0 && backendTools.length > 0) && <Separator />}
      {backendTools.map(({ key, title, Icon, isDisabled }) => (
        <ToolButton key={key} toolKey={key} title={title} onToggle={handleToolToggle} disabled={isDisabled}>
          <Icon size={16} />
        </ToolButton>
      ))}
      {(backendTools.length > 0 && userTools.length > 0) && <Separator />}
      {userTools.map(({ key, title, Icon, isCustom, isDisabled }) => (
        <ToolButton key={key} toolKey={key} title={title} onToggle={handleToolToggle} disabled={isDisabled}>
          {isCustom ? <DynamicIcon name={Icon} size={16} /> : <Icon size={16} />}
        </ToolButton>
      ))}
    </Paper>
  )
}

export default AITools
