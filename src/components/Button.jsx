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
    primary: "bg-primary-base text-white active:bg-primary-dark hover:bg-primary-light",
    secondary: "bg-transparent text-light-textPrimary active:bg-light-btnBg-dark hover:bg-light-btnBg-light dark:text-dark-textPrimary dark:active:bg-dark-btnBg-dark dark:hover:bg-dark-btnBg-base",
    outline: "bg-transparent text-primary-base active:bg-primary-dark active:text-white hover:bg-primary-light hover:text-white",
    success: "bg-transparent text-success-base active:bg-success-dark active:text-white hover:bg-success-base hover:text-white",
    warning: "bg-transparent text-warning-base active:bg-warning-dark active:text-white hover:bg-warning-base hover:text-white",
    danger: "bg-transparent text-danger-base active:bg-danger-dark active:text-white hover:bg-danger-base hover:text-white"
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
