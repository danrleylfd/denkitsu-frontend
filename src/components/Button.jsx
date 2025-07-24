import { forwardRef } from "react"

const Spinner = () => <div className="h-4 w-4 animate-spin-fast rounded-full border-2 border-solid border-transparent border-t-current" />

const Button = forwardRef(({
  type = "button",
  variant = "primary",
  size = "sm",
  $rounded = false,
  $squared = false,
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}, ref) => {
  const baseClasses = "relative flex select-none items-center justify-center font-bold uppercase transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 w-fit self-center"
  const variantClasses = {
    primary: "bg-primary-base hover:bg-primary-light active:bg-primary-dark text-white transform transition-transform hover:scale-105 active:scale-95",
    secondary:
      "bg-transparent hover:bg-lightBtnBg-light active:bg-lightBtnBg-dark dark:hover:bg-darkBtnBg-light dark:active:bg-darkBtnBg-dark text-lightFg-primary dark:text-darkFg-primary  transform transition-transform hover:scale-105 active:scale-95 transform transition-transform hover:scale-105 active:scale-95",
    outline:
      "bg-transparent hover:bg-primary-light active:bg-primary-dark text-primary-base hover:text-white active:text-white transform transition-transform hover:scale-105 active:scale-95",
    success:
      "bg-transparent hover:bg-success-light active:bg-success-dark text-success-base hover:text-white active:text-white transform transition-transform hover:scale-105 active:scale-95",
    warning:
      "bg-transparent hover:bg-warning-light active:bg-warning-dark text-warning-base hover:text-white active:text-white transform transition-transform hover:scale-105 active:scale-95",
    danger:
      "bg-transparent hover:bg-danger-light active:bg-danger-dark text-danger-base hover:text-white active:text-white transform transition-transform hover:scale-105 active:scale-95",
    "gradient-orange":
      "text-white bg-gradient-orange-animated transform transition-transform hover:scale-105 active:scale-95",
    "gradient-blue":
      "text-white bg-gradient-blue-animated transform transition-transform hover:scale-105 active:scale-95",
    "gradient-green":
      "text-white bg-gradient-green-animated transform transition-transform hover:scale-105 active:scale-95",
    "gradient-red":
      "text-white bg-gradient-red-animated transform transition-transform hover:scale-105 active:scale-95",
    "gradient-yellow":
      "text-white bg-gradient-yellow-animated transform transition-transform hover:scale-105 active:scale-95",
    "gradient-pink":
      "text-white bg-gradient-pink-animated transform transition-transform hover:scale-105 active:scale-95",
    "gradient-purple":
      "text-white bg-gradient-purple-animated transform transition-transform hover:scale-105 active:scale-95",
    "gradient-rainbow":
      "text-white bg-gradient-rainbow transform transition-all hover:scale-105 active:scale-95",
  }
  const sizeClasses = {
    icon: "h-8 px-2 text-xs",
    xs: "h-6 px-2 text-xs",
    sm: "h-8 px-4 text-xs",
    md: "h-9 px-6 text-base",
    lg: "h-10 px-8 text-base"
  }
  const getBorderClasses = () => {
    if ($rounded) return "rounded-full"
    if ($squared) return "rounded-md"
    return "rounded-none"
  }
  return (
    <button
      ref={ref}
      {...props}
      type={type}
      className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${loading ? sizeClasses.icon : sizeClasses[size]}
          ${getBorderClasses()}
          ${loading ? "pointer-events-none opacity-70" : ""}
          ${className}
        `}
      disabled={loading || disabled}>
      {loading && <Spinner />} {children}
    </button>
  )
})

export default Button
