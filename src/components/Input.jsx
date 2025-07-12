const Input = ({ type = "text", placeholder, value, onChange, containerClassName, leftContent, rightContent, className, children, ...props }) => {
  const containerClasses = [
    "flex gap-1 w-full items-center rounded-full pr-1 my-1",
    "bg-lightBg-tertiary",
    "text-lightFg-primary",
    "dark:bg-darkBg-tertiary dark:text-darkFg-primary",
    containerClassName
  ]
    .filter(Boolean)
    .join(" ")

  const inputClasses = [
    "w-full rounded-full bg-transparent py-2 px-2",
    "text-base placeholder:text-lightFg-tertiary",
    "focus:outline-none",
    "dark:placeholder:text-darkFg-tertiary",
    className
  ]
    .filter(Boolean)
    .join(" ")
  return (
    <div className={containerClasses}>
      {leftContent}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} className={inputClasses} {...props} />
      {children}
    </div>
  )
}

export default Input
