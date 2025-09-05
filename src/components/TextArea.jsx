import { forwardRef, useState, useRef, useEffect } from "react"
import * as Label from "@radix-ui/react-label"

const TextArea = forwardRef(({ label, value = "", maxLength, showCounter = true, variant = "primary", suggestions = [], className, textAreaClassName, ...props }, ref) => {
  const [filtered, setFiltered] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleChange = (e) => {
    const inputValue = e.target.value
    if (props.onChange) props.onChange(e)

    if (suggestions.length > 0 && inputValue.trim().length > 0) {
      const filteredSuggestions = suggestions.filter((item) =>
        item.toLowerCase().includes(inputValue.toLowerCase())
      )
      setFiltered(filteredSuggestions)
      setShowSuggestions(filteredSuggestions.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSelect = (suggestion) => {
    if (props.onChange) {
      props.onChange({ target: { value: suggestion } })
    }
    setShowSuggestions(false)
    if (ref && ref.current) {
      ref.current.focus()
    }
  }


  const labelTextClasses = "text-xs font-bold text-lightFg-secondary dark:text-darkFg-secondary"
  const counterClasses = "text-right text-xs text-lightFg-tertiary dark:text-darkFg-tertiary self-end pr-2"

  const baseTextAreaClasses = "w-full p-2 rounded-md resize-y transition-all focus:outline-none"
  const variants = {
    primary: "bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-secondary hover:bg-lightBg-secondary dark:hover:bg-darkBg-secondary focus:ring-1 focus:ring-primary-base",
    secondary: "bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-secondary dark:text-darkFg-secondary hover:bg-lightBg-secondary dark:hover:bg-darkBg-secondary focus:ring-1 focus:ring-primary-base",
    tertiary: "bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-tertiary dark:text-darkFg-tertiary hover:bg-lightBg-secondary dark:hover:bg-darkBg-secondary focus:ring-1 focus:ring-primary-base"
  }
  const finalTextAreaClasses = `${baseTextAreaClasses} ${variants[variant]} ${textAreaClassName || ""}`

  return (
    <Label.Root ref={containerRef} className={`w-full flex flex-col gap-1 relative ${className || ""}`}>
      {label && <span className={labelTextClasses}>{label}</span>}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute bottom-full left-0 w-full mb-2 bg-lightBg-primary dark:bg-darkBg-primary border border-bLight dark:border-bDark rounded-md shadow-lg z-50 max-h-32 overflow-auto">
          {filtered.map((item, index) => (
            <li
              key={index}
              className="p-2 cursor-pointer hover:bg-lightBg-secondary dark:hover:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary"
              onClick={() => handleSelect(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
      <textarea ref={ref} value={value} maxLength={maxLength} className={finalTextAreaClasses} {...props} onChange={handleChange} />
      {showCounter && maxLength && (
        <small className={counterClasses}>
          {value.length} / {maxLength}
        </small>
      )}
    </Label.Root>
  )
})

export default TextArea
