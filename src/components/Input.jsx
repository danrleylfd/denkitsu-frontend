const Input = ({ type = "text", placeholder, value, onChange, containerClassName, className, children, ...props }) => {
  const containerClasses = [
    "flex w-full items-center rounded-full border pr-1",
    "border-light-border bg-light-inputBg",
    "text-light-textPrimary",
    "dark:border-dark-border dark:bg-dark-inputBg dark:text-dark-textPrimary",
    containerClassName
  ].filter(Boolean).join(" ")

  const inputClasses = [
    "w-full rounded-full bg-transparent py-2 px-2",
    "text-base placeholder:text-light-textMuted",
    "focus:outline-none",
    "dark:placeholder:text-dark-textMuted",
    className
  ].filter(Boolean).join(" ")
  return (
    <div className={containerClasses}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputClasses}
        {...props}
      />
      {children}
    </div>
  )
}

export default Input
