import { useMemo } from "react"
import { ChevronsUpDown } from "lucide-react"

const PromptSelector = ({ prompts, selectedPrompt, onSelectPrompt, disabled, className = "" }) => {
  const getModeName = (content) => {
    const firstLine = content.trim().split("\n")[0]
    return firstLine.replace("## ", "").trim()
  }

  const availablePrompts = useMemo(() => {
    return prompts.slice(1).map((prompt) => ({
      name: getModeName(prompt.content),
      content: prompt.content
    }))
  }, [prompts])

  const handleChange = (e) => {
    const selectedContent = e.target.value
    onSelectPrompt(selectedContent)
  }

  const selectClasses = [
    "appearance-none rounded-md border-none bg-lightBg-secondary dark:bg-darkBg-secondary px-2 py-2 text-sm text-lightFg-secondary dark:text-darkFg-secondary focus:outline-none focus:ring-2 focus:ring-primary-base w-max",
    className
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className="relative">
      <select value={selectedPrompt || ""} onChange={handleChange} disabled={disabled} className={selectClasses}>
        <option value="" disabled>
          Modo...
        </option>
        {availablePrompts.map((prompt) => (
          <option key={prompt.name} value={prompt.content}>
            {prompt.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-lightFg-tertiary dark:text-darkFg-tertiary">
        <ChevronsUpDown size={16} />
      </div>
    </div>
  )
}

export default PromptSelector
