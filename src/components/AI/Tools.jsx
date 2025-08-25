// src/components/AI/AITools.jsx

import { useMemo, useState, useEffect } from "react"

import { useAI } from "../../contexts/AIContext"
import { useTools } from "../../contexts/ToolContext"
import { listTools } from "../../services/aiChat"

import Paper from "../Paper"
import ToolButton from "./ToolButton"
import DynamicIcon from "../DynamicIcon"

const AITools = ({ loading, toolsDoor }) => {
  if (!toolsDoor) return null

  const { aiProvider, aiKey, model, handleToolToggle, freeModels, payModels, groqModels } = useAI()
  const { tools } = useTools()
  const [toolDefinitions, setToolDefinitions] = useState({ internalTools: [], backendTools: [], customTools: [] })

  useEffect(() => {
    const fetchDefinitions = async () => {
      try {
        const { data } = await listTools()
        setToolDefinitions({ ...data, customTools: tools })
      } catch (error) {
        console.error("Failed to load tool definitions:", error)
      }
    }
    fetchDefinitions()
  }, [])

  const { internalTools, backendTools, userTools } = useMemo(() => {
    const allModels = [...freeModels, ...payModels, ...groqModels]
    const selectedModel = allModels.find(m => m.id === model)
    const processTool = (tool) => {
      let isDisabled = loading
      const isCompoundModel = model?.startsWith("compound-")
      const isGptOssModel = model?.startsWith("openai/gpt-oss-")
      switch (tool.name) {
        case "web":
          if (aiProvider === "groq") isDisabled = isDisabled || !isCompoundModel
          else isDisabled = isDisabled || aiKey.length === 0 || !selectedModel?.supports_tools
          break
        case "browser_search":
          isDisabled = isDisabled || !isGptOssModel
          break
        case "code_interpreter":
          isDisabled = isDisabled || (!isCompoundModel && !isGptOssModel)
          break
        default:
          isDisabled = isDisabled || aiKey.length === 0 || !selectedModel?.supports_tools
          break
      }
      return { ...tool, isDisabled }
    }
    return {
      internalTools: toolDefinitions.internalTools.map(processTool),
      backendTools: toolDefinitions.backendTools.map(processTool),
      customTools: tools.map(tool => ({
        ...tool,
        isDisabled: loading || aiKey.length === 0 || !selectedModel?.supports_tools
      }))
    }
  }, [toolDefinitions, tools, model, loading, aiKey, aiProvider, freeModels, payModels, groqModels])

  const Separator = () => <div className="h-6 w-px bg-bLight dark:bg-bDark mx-1" />

  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-1 py-2 gap-2 rounded-lg shadow-lg max-w-[95%]
      flex flex-wrap items-center justify-center mx-auto`}
    >
      {internalTools.map(({ name, title, Icon, isDisabled }) => (
        <ToolButton key={name} toolKey={name} title={title} onToggle={handleToolToggle} disabled={isDisabled}>
          <DynamicIcon name={Icon} size={16} />
        </ToolButton>
      ))}
      {(internalTools.length > 0 && backendTools.length > 0) && <Separator />}
      {backendTools.map(({ name, title, Icon, isDisabled }) => (
        <ToolButton key={name} toolKey={name} title={title} onToggle={handleToolToggle} disabled={isDisabled}>
          <DynamicIcon name={Icon} size={16} />
        </ToolButton>
      ))}
      {((internalTools.length > 0 || backendTools.length > 0) && userTools.length > 0) && <Separator />}
      {userTools.map(({ name, title, Icon, isDisabled }) => (
        <ToolButton key={name} toolKey={name} title={title} onToggle={handleToolToggle} disabled={isDisabled}>
          <DynamicIcon name={Icon} size={16} />
        </ToolButton>
      ))}
    </Paper>
  )
}

export default AITools
