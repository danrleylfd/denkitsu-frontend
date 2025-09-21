const Paper = ({ node, variant="primary", className = "", children, ...props }) => {
  const baseClasses = "w-full max-w-[95%] rounded-lg shadow-lg opacity-80 dark:opacity-90"
  const variants = {
    primary: "bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary",
    secondary: "bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary",
    tertiary: "bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-tertiary dark:text-darkFg-tertiary"
  }
  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}

export default Paper
