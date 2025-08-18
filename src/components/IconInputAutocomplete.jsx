import { useState, useRef, useEffect, useCallback } from "react"
import { iconNames } from "../utils/icons"
import Input from "./Input"
import DynamicIcon from "./DynamicIcon"

const IconInputAutocomplete = ({ value, onChange, placeholder, disabled }) => {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleChange = (e) => {
    const term = e.target.value
    setInputValue(term)
    onChange(term)

    if (term.trim().length > 1) {
      const filtered = iconNames
        .filter(name => name.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 50)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSelect = (name) => {
    setInputValue(name)
    onChange(name)
    setShowSuggestions(false)
  }

  const handleClickOutside = useCallback((event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setShowSuggestions(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [handleClickOutside])

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        disabled={disabled}
        autoComplete="off"
        leftContent={
          <div className="pl-2">
            <DynamicIcon name={value} size={16} className="text-lightFg-secondary dark:text-darkFg-secondary" />
          </div>
        }
      />
      {showSuggestions && (
        <ul className="absolute top-full mt-2 w-full min-h-24 max-h-48 overflow-y-auto bg-lightBg-secondary dark:bg-darkBg-secondary border border-bLight dark:border-bDark rounded-md shadow-lg z-20">
          {suggestions.map(name => (
            <li
              key={name}
              onClick={() => handleSelect(name)}
              className="flex items-center gap-2 p-2 cursor-pointer hover:bg-lightBg-tertiary dark:hover:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary"
            >
              <DynamicIcon name={name} size={16} />
              <span className="text-sm">{name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default IconInputAutocomplete
