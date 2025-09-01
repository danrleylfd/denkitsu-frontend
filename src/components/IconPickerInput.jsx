import { useState } from "react"

import DynamicIcon from "./DynamicIcon"
import IconPicker from "./IconPicker"
import Button from "./Button"

const IconPickerInput = ({ value, onChange, disabled }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const handleSelect = (iconName) => {
    onChange(iconName)
    setIsPickerOpen(false)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setIsPickerOpen(true)} disabled={disabled}>
          <DynamicIcon name={value} size={20} className="text-lightFg-primary dark:text-darkFg-primary" />
          <span className="font-mono text-sm text-lightFg-secondary dark:text-darkFg-secondary">Escolher Ícone</span>
        </Button>
      </div>
      <IconPicker isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} onSelect={handleSelect} currentIcon={value} />
    </>
  )
}

export default IconPickerInput
