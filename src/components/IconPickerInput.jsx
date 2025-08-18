import { useState } from "react"

import DynamicIcon from "./DynamicIcon"
import IconPicker from "./IconPicker"

const IconPickerInput = ({ value, onChange, disabled }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const handleSelect = (iconName) => {
    onChange(iconName)
    setIsPickerOpen(false)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">Ícone:</span>
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          disabled={disabled}
          className="flex items-center gap-2 p-2 rounded-full bg-lightBg-tertiary hover:bg-lightBg-secondary dark:bg-darkBg-tertiary dark:hover:bg-darkBg-secondary transition-colors"
        >
          <DynamicIcon name={value} size={20} className="text-lightFg-primary dark:text-darkFg-primary" />
          <span className="font-mono text-sm text-lightFg-secondary dark:text-darkFg-secondary">{value}</span>
        </button>
      </div>

      <IconPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelect}
        currentIcon={value}
      />
    </>
  )
}

export default IconPickerInput
