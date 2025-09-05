import { Check, ChevronsUpDown } from "lucide-react"
import * as Select from "@radix-ui/react-select"
import { useModels } from "../../contexts/ModelContext"
import Button from "../Button"

const AIModelSelect = ({ loading, className }) => {
  const { aiProvider, model, freeModels, payModels, groqModels, customModels, setModel } = useModels()
  const triggerClasses = [
    "flex gap-1 w-full items-center rounded-full pr-1 transition-all h-10",
    "bg-lightBg-tertiary text-lightFg-secondary",
    "dark:bg-darkBg-tertiary dark:text-darkFg-secondary",
    "hover:bg-lightBg-secondary dark:hover:bg-darkBg-secondary",
    "focus:outline-none focus:ring-1 focus:ring-primary-base",
    "data-[placeholder]:text-lightFg-tertiary dark:data-[placeholder]:text-darkFg-tertiary",
    className
  ].filter(Boolean).join(" ")

  const renderOptions = (models, provider) => {
    if (!models || models.length === 0) return null
    return (
      <Select.Group>
        <Select.Label className="px-6 py-2 text-sm text-lightFg-tertiary dark:text-darkFg-tertiary">{provider}</Select.Label>
        {models.map((m) => (
          <Select.Item
            key={m.id}
            value={m.id}
            className="relative flex items-center px-6 py-2 rounded-md text-sm text-lightFg-primary dark:text-darkFg-primary cursor-pointer select-none hover:bg-primary-base/10 outline-none data-[highlighted]:bg-primary-base/20">
            <Select.ItemText>
              {m.id.split("/").pop()}
              {m.supports_tools && " 🛠️"}
              {m.supports_images && " 🖼️"}
            </Select.ItemText>
            <Select.ItemIndicator className="absolute left-0 w-6 inline-flex items-center justify-center">
              <Check size={16} />
            </Select.ItemIndicator>
          </Select.Item>
        ))}
      </Select.Group>
    )
  }

  return (
    <Select.Root value={aiProvider === "custom" ? model : undefined} onValueChange={setModel} disabled={loading}>
      <Select.Trigger className={triggerClasses}>
        <div className="flex-1 text-left px-2 text-base">
          <Select.Value placeholder="Selecionar Modelo" />
        </div>
        <Select.Icon asChild>
          <ChevronsUpDown size={16} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" sideOffset={5} className="w-[--radix-select-trigger-width] bg-lightBg-primary dark:bg-darkBg-primary rounded-lg shadow-lg border border-bLight dark:border-bDark z-50">
          <Select.Viewport className="p-2 max-h-[256px] overflow-y-auto">
            {aiProvider === "openrouter" && renderOptions(freeModels, "OpenRouter Gratuito:")}
            {aiProvider === "openrouter" && renderOptions(payModels, "OpenRouter Premium:")}
            {aiProvider === "groq" && renderOptions(groqModels, "Groq Gratuito:")}
            {aiProvider === "custom" && renderOptions(customModels, "Modelos Personalizados:")}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

export default AIModelSelect
