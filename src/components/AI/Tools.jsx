import { useMemo } from "react"

import { useAI } from "../../contexts/AIContext"
import { useTools } from "../../contexts/ToolContext"

import { TOOL_DEFINITIONS } from "../../constants/tools"

import Paper from "../Paper"
import ToolButton from "./ToolButton"
import DynamicIcon from "../DynamicIcon"

const AITools = ({ loading, toolsDoor }) => {
  if (!toolsDoor) return null
  // MODIFICADO: Adicionado freeModels, payModels, groqModels para verificar as propriedades do modelo selecionado
  const { aiProvider, aiKey, model, handleToolToggle, freeModels, payModels, groqModels } = useAI()
  const { tools: customTools } = useTools()

  const allAvailableTools = useMemo(() => {
    const allModels = [...freeModels, ...payModels, ...groqModels]
    const selectedModel = allModels.find(m => m.id === model)
    const nativeTools = TOOL_DEFINITIONS.map(tool => {
      let isDisabled = loading
      const isCompoundModel = model?.startsWith("compound-")
      const isGptOssModel = model?.startsWith("openai/gpt-oss-")
      switch (tool.key) {
        case "web":
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
      return {
        key: tool.key,
        title: tool.title,
        Icon: tool.Icon,
        isCustom: false,
        isDisabled: isDisabled
      }
    })
    const userTools = customTools.map(tool => ({
      key: tool.name,
      title: tool.alias || tool.name,
      Icon: tool.icon || "PocketKnife",
      isCustom: true,
      isDisabled: loading || aiKey.length === 0 || !selectedModel?.supports_tools
    }))
    return [...nativeTools, ...userTools]
  }, [customTools, model, loading, aiKey, aiProvider, freeModels, payModels, groqModels]) // MODIFICADO: Adicionadas dependências

  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-1 py-2 gap-2 rounded-lg shadow-lg max-w-[95%]
      grid grid-cols-[repeat(auto-fit,minmax(2rem,1fr))] justify-center justify-items-center mx-auto`}
    >
      {allAvailableTools.map(({ key, title, Icon, isCustom, isDisabled }) => (
        <ToolButton
          key={key}
          toolKey={key}
          title={title}
          onToggle={handleToolToggle}
          disabled={isDisabled}
        >
          {isCustom ? <DynamicIcon name={Icon} size={16} /> : <Icon size={16} />}
        </ToolButton>
      ))}
    </Paper>
  )
}

export default AITools
