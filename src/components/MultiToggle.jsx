import { useState, useEffect, useRef, useCallback } from "react"

import Button from "./Button"

const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const MultiToggle = ({ options = [], value, onChange, className = "", itemsPerRow = 10, activeVariant = "primary" }) => {
  const [thumbStyle, setThumbStyle] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const [visualValue, setVisualValue] = useState(value)
  const containerRef = useRef(null)
  const optionRefs = useRef({})
  const prevValue = usePrevious(value)

  const updateThumbPosition = useCallback(() => {
    const selectedOptionRef = optionRefs.current[value]
    const containerEl = containerRef.current
    if (selectedOptionRef && containerEl) {
      const optionRect = selectedOptionRef.getBoundingClientRect()
      const containerRect = containerEl.getBoundingClientRect()
      setThumbStyle({
        top: optionRect.top - containerRect.top,
        left: optionRect.left - containerRect.left,
        width: optionRect.width,
        height: optionRect.height,
      })
    }
  }, [value])

  useEffect(() => {
    const currentOptionEl = optionRefs.current[value]
    const prevOptionEl = optionRefs.current[prevValue]
    const containerEl = containerRef.current
    if (!currentOptionEl || !containerEl || prevValue === undefined || prevValue === value) {
      updateThumbPosition()
      setVisualValue(value)
      return
    }
    const containerRect = containerEl.getBoundingClientRect()
    const prevRect = prevOptionEl.getBoundingClientRect()
    const currentRect = currentOptionEl.getBoundingClientRect()
    const stretchLeft = Math.min(prevRect.left, currentRect.left) - containerRect.left
    const stretchTop = Math.min(prevRect.top, currentRect.top) - containerRect.top
    const stretchRight = Math.max(prevRect.right, currentRect.right) - containerRect.left
    const stretchBottom = Math.max(prevRect.bottom, currentRect.bottom) - containerRect.top
    const stretchWidth = stretchRight - stretchLeft
    const stretchHeight = stretchBottom - stretchTop
    setThumbStyle({
      top: stretchTop,
      left: stretchLeft,
      width: stretchWidth,
      height: stretchHeight,
    })
    const shrinkTimeout = setTimeout(() => {
      updateThumbPosition()
      setVisualValue(value)
    }, 150)
    return () => {
      clearTimeout(shrinkTimeout)
    }
  }, [value, prevValue, updateThumbPosition])

  useEffect(() => {
    const handleResize = () => updateThumbPosition()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [updateThumbPosition])

  const thumbVariantClasses = {
    primary: "bg-primary-base",
    "gradient-orange": "bg-gradient-to-br from-red-500 to-yellow-500",
    "gradient-blue": "bg-gradient-to-br from-blue-500 to-cyan-400",
    "gradient-green": "bg-gradient-to-br from-emerald-500 to-lime-400",
    "gradient-red": "bg-gradient-to-br from-red-500 to-pink-500",
    "gradient-yellow": "bg-gradient-to-br from-yellow-400 to-amber-500",
    "gradient-pink": "bg-gradient-to-br from-pink-500 to-fuchsia-500",
    "gradient-purple": "bg-gradient-to-br from-purple-500 to-violet-700",
    "gradient-rainbow": "bg-gradient-rainbow",
    success: "bg-success-base",
    warning: "bg-warning-base",
    danger: "bg-danger-base",
  }

  const chunkedOptions = []
  for (let i = 0; i < options.length; i += itemsPerRow) {
    chunkedOptions.push(options.slice(i, i + itemsPerRow))
  }

  return (
    <div ref={containerRef} className={`relative p-1 rounded-xl bg-lightBg-tertiary dark:bg-darkBg-tertiary ${className}`}>
      <div
        className={`absolute rounded-full transition-all ease-in-out duration-300 ${
          thumbVariantClasses[activeVariant] || thumbVariantClasses.primary
        }`}
        style={thumbStyle}
      />
      <div className="flex flex-col gap-1">
        {chunkedOptions.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-1">
            {row.map((option) => (
              <Button
                key={option.label}
                ref={(el) => (optionRefs.current[option.value] = el)}
                onClick={() => onChange(option.value)}
                variant="secondary"
                size="icon"
                $rounded
                title={option.label}
                className={`
                  !normal-case !font-semibold !text-sm z-10 !bg-transparent
                  transition-colors duration-150
                  ${visualValue === option.value
                    ? "!text-white"
                    : "!text-lightFg-secondary dark:!text-darkFg-secondary"
                  }`}
              >
                {option.icon && option.icon}
              </Button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MultiToggle
