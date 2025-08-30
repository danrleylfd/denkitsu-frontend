import { memo } from "react"
import Button from "../Button"

const ToolButton = ({
  toolKey,
  title,
  children,
  disabled,
  onToggle,
  isActive
}) => {

  const handleToggle = () => {
    if (onToggle) onToggle(toolKey)
  }

  return (
    <Button
      $border={isActive ? "outline" : "secondary"}
      variant={isActive ? "outline" : "secondary"}
      size="icon"
      $rounded
      title={title}
      onClick={handleToggle}
      disabled={disabled}
    >
      {children}
    </Button>
  )
}

export default memo(ToolButton)
