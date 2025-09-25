import { useMemo } from "react"

import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"
import { useModels } from "../../contexts/ModelContext"
import { useTools } from "../../contexts/ToolContext"

import Paper from "../Paper"
import ToolButton from "./ToolButton"
import DynamicIcon from "../DynamicIcon"

const AITools = ({ toolsDoor }) => {
  const { signed } = useAuth()
  if (!signed || !toolsDoor) return null

  const { loadingMessages, isImproving } = useAI()
  const { aiProvider, aiKey, model, freeModels, payModels, groqModels, loadingModels } = useModels()
  const { tools, activeTools, handleToolToggle } = useTools()

  const { internalTools, backendTools, customTools } = useMemo(() => {
    const allModels = [...freeModels, ...payModels, ...groqModels]
    const selectedModel = allModels.find(m => m.id === model)
    const processTool = (tool) => {
      let isDisabled = loadingMessages || isImproving || loadingModels
      const isCompoundModel = model?.startsWith("compound-")
      const isGptOssModel = model?.startsWith("openai/gpt-oss-")
      switch (tool.name) {
        case "web":
          if (aiProvider === "groq") isDisabled = isDisabled || !isCompoundModel
          else isDisabled = isDisabled || aiKey.length === 0 || !selectedModel?.supports_tools
          break
        case "browser_search":
          isDisabled = isDisabled || aiKey.length === 0 || !isGptOssModel
          break
        case "code_interpreter":
          isDisabled = isDisabled || aiKey.length === 0 || (!isCompoundModel && !isGptOssModel)
          break
        default:
          isDisabled = isDisabled || aiKey.length === 0 || !selectedModel?.supports_tools
          break
      }
      return { ...tool, isDisabled }
    }
    return {
      internalTools: tools.internalTools.map(processTool),
      backendTools: tools.backendTools.map(processTool),
      customTools: tools.customTools.map(tool => ({
        ...tool,
        isDisabled: loadingMessages || isImproving || loadingModels || aiKey.length === 0 || !selectedModel?.supports_tools
      }))
    }
  }, [tools, model, loadingMessages || isImproving, loadingModels, aiKey, aiProvider, freeModels, payModels, groqModels])

  const Separator = () => <div className="h-6 w-px bg-bLight dark:bg-bDark mx-1" />

  return (
    <Paper className="max-w-[99%] flex flex-wrap items-center justify-center gap-2 px-4 py-2 mx-auto">
      {internalTools.map(({ name, title, Icon, isDisabled }) => (
        <ToolButton key={name} toolKey={name} title={title} onToggle={handleToolToggle} isActive={activeTools.has(name)} disabled={isDisabled}>
          <DynamicIcon name={Icon} size={16} />
        </ToolButton>
      ))}
      {(internalTools.length > 0 && backendTools.length > 0) && <Separator />}
      {backendTools.map(({ name, title, Icon, isDisabled }) => (
        <ToolButton key={name} toolKey={name} title={title} onToggle={handleToolToggle} isActive={activeTools.has(name)} disabled={isDisabled}>
          <DynamicIcon name={Icon} size={16} />
        </ToolButton>
      ))}
      {((internalTools.length > 0 || backendTools.length > 0) && customTools.length > 0) && <Separator />}
      {customTools.map(({ name, title, Icon, isDisabled }) => (
        <ToolButton key={name} toolKey={name} title={title} onToggle={handleToolToggle} isActive={activeTools.has(name)} disabled={isDisabled}>
          <DynamicIcon name={Icon} size={16} />
        </ToolButton>
      ))}
    </Paper>
  )
}

export default AITools
