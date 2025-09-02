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
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="icon" $rounded onClick={() => setIsPickerOpen(true)} disabled={disabled}>
        <DynamicIcon name={value} size={16} />
      </Button>
      <IconPicker isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} onSelect={handleSelect} currentIcon={value} />
    </div>
  )
}

export default IconPickerInput
