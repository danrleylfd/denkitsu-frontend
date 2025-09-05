import * as Label from "@radix-ui/react-label"

const Input = ({ type = "text", placeholder, value, onChange, leftContent, className, children, ...props }) => {
  const containerClasses = [
    "flex gap-1 w-full items-center rounded-full pr-1 transition-all h-10",
    "bg-lightBg-tertiary text-lightFg-secondary",
    "dark:bg-darkBg-tertiary dark:text-darkFg-secondary",
    "hover:bg-lightBg-secondary dark:hover:bg-darkBg-secondary",
    "focus-within:ring-1 focus-within:ring-primary-base",
    className
  ].filter(Boolean).join(" ")

  const inputClasses = [
    "w-full rounded-full bg-transparent py-2 px-2",
    "text-base placeholder:text-lightFg-tertiary",
    "focus:outline-none",
    "dark:placeholder:text-darkFg-tertiary",
  ].filter(Boolean).join(" ")

  return (
    <Label.Root className={containerClasses}>
      {leftContent}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} className={inputClasses} {...props} />
      {children}
    </Label.Root>
  )
}

export default Input
