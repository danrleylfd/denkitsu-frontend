const Spinner = () => (
  <div className="h-4 w-4 animate-spin-fast rounded-full border-2 border-solid border-transparent border-t-current" />
)

const Button = ({
  type = "button",
  variant = "primary",
  size = "sm",
  $rounded = false,
  $squared = false,
  loading = false,
  disabled = false,
  children,
  ...props
}) => {
  const baseClasses = "relative flex select-none items-center justify-center font-bold uppercase transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50"
  const variantClasses = {
    primary: "bg-primary-base hover:bg-primary-light active:bg-primary-dark text-white",
    secondary: "bg-transparent hover:bg-lightBtnBg-light active:bg-lightBtnBg-dark dark:hover:bg-darkBtnBg-light dark:active:bg-darkBtnBg-dark text-lightFg-primary dark:text-darkFg-primary",
    outline: "bg-transparent hover:bg-primary-light active:bg-primary-dark text-primary-base hover:text-white active:text-white",
    success: "bg-transparent hover:bg-success-light active:bg-success-dark text-success-base hover:text-white active:text-white",
    warning: "bg-transparent hover:bg-warning-light active:bg-warning-dark text-warning-base hover:text-white active:text-white",
    danger: "bg-transparent hover:bg-danger-light active:bg-danger-dark text-danger-base hover:text-white active:text-white"
  }
  const sizeClasses = {
    icon: "h-8 px-2 text-xs",
    sm: "h-8 px-4 text-xs",
    md: "h-9 px-6 text-base",
    lg: "h-10 px-8 text-base"
  }
  const getBorderClasses = () => {
    if ($rounded) return "rounded-full"
    if ($squared) return "rounded-none"
    return "rounded-md"
  }
  return (
    <div className="flex justify-center">
      <button
        {...props}
        type={type}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${loading ? sizeClasses.icon : sizeClasses[size]}
          ${getBorderClasses()}
          ${loading ? "pointer-events-none opacity-70" : ""}
        `}
        disabled={loading || disabled}
      >
        {loading && <Spinner />} {children}
      </button>
    </div>
  )
}

export default Button
