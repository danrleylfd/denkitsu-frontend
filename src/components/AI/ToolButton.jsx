import { useState, useEffect, useCallback, memo } from "react"
import Button from "../Button"

const ToolButton = ({
  toolKey,
  title,
  children,
  disabled,
  onToggle
}) => {
  const storageKey = `@Denkitsu:${toolKey}`

  const [isActive, setIsActive] = useState(() => {
    try {
      const storedValue = localStorage.getItem(storageKey)
      return storedValue ? JSON.parse(storedValue) === true : false
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(isActive))
      if (onToggle) onToggle(toolKey, isActive)
    } catch (error) {
      console.error(`Falha ao salvar o estado da ferramenta ${toolKey}`, error)
    }
  }, [isActive, toolKey, onToggle])

  useEffect(() => {
    if (onToggle) onToggle(toolKey, isActive)
  }, [toolKey, isActive, onToggle])


  const handleToggle = useCallback(() => {
    setIsActive(prev => !prev)
  }, [])

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
