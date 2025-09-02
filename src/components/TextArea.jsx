import { forwardRef } from "react"

const TextArea = forwardRef(({ label, value = "", maxLength, showCounter = true, variant = "primary", ...props }, ref) => {
  const baseClasses = "w-full p-2 rounded-md resize-y"
  const variants = {
    primary: "bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary",
    secondary: "bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-secondary dark:text-darkFg-secondary",
    tertiary: "bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-tertiary dark:text-darkFg-tertiary"
  }
  return (
    <div className={`w-full flex flex-col gap-1`}>
      {label && <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">{label}</label>}
      <textarea ref={ref} value={value} maxLength={maxLength} className={`${baseClasses} ${variants[variant]}`} {...props} />
      {showCounter && maxLength && (
        <small className="text-right text-xs text-lightFg-tertiary dark:text-darkFg-tertiary self-end pr-2">
          {value.length} / {maxLength}
        </small>
      )}
    </div>
  )
})

export default TextArea
