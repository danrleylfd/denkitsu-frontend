import { forwardRef } from "react"

const Spinner = ({isIcon}) => (<div className={`h-4 w-4 animate-spin-fast rounded-full border-2 border-solid border-transparent border-t-current ${isIcon ? "mr-2" : "mr-0"}`} />)

const Button = forwardRef(({
  type = "button",
  variant = "primary",
  size = "sm",
  $rounded = false,
  $squared = false,
  $border = "secondary",
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}, ref) => {
  const baseClasses = "relative flex select-none items-center justify-center font-bold uppercase transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 w-fit self-center"
  const variantClasses = {
    primary: "border border-solid bg-primary-base hover:bg-primary-light active:bg-primary-dark text-white transform transition-transform hover:scale-105 active:scale-95",
    mic: "border border-solid bg-red-base hover:bg-red-light active:bg-red-dark text-white transform transition-transform hover:scale-105 active:scale-95",
    secondary: "border border-solid bg-transparent hover:bg-lightBtnBg-light active:bg-lightBtnBg-dark dark:hover:bg-darkBtnBg-light dark:active:bg-darkBtnBg-dark text-lightFg-primary dark:text-darkFg-primary  transform transition-transform hover:scale-105 active:scale-95 transform transition-transform hover:scale-105 active:scale-95",
    outline: "border border-solid bg-transparent hover:bg-primary-light active:bg-primary-dark text-primary-base hover:text-white active:text-white transform transition-transform hover:scale-105 active:scale-95",
    info: "border border-solid bg-transparent hover:bg-blue-light active:bg-blue-dark text-blue-base hover:text-white active:text-white transform transition-transform hover:scale-105 active:scale-95",
    success: "border border-solid bg-transparent hover:bg-green-light active:bg-green-dark text-green-base hover:text-white active:text-white transform transition-transform hover:scale-105 active:scale-95",
    warning: "border border-solid bg-transparent hover:bg-amber-light active:bg-amber-dark text-amber-base hover:text-white active:text-white transform transition-transform hover:scale-105 active:scale-95",
    danger: "border border-solid bg-transparent hover:bg-red-light active:bg-red-dark text-red-base hover:text-white active:text-white transform transition-transform hover:scale-105 active:scale-95",
    orange: "border border-solid bg-transparent hover:bg-orange-light active:bg-orange-dark text-orange-base hover:text-white active:text-white transform transition-transform hover:scale-105 active:scale-95",
    deep_orange: "border border-solid bg-transparent hover:bg-deep_orange-light active:bg-deep_orange-dark text-deep_orange-base hover:text-white active:text-white transform transition-transform hover:scale-105 active:scale-95",
    pink: "border border-solid bg-transparent hover:bg-pink-light active:bg-pink-dark text-pink-base hover:text-white active:text-white transform transition-transform hover:scale-105 active:scale-95",
  }
  const sizeClasses = {
    icon: "h-8 px-2 text-xs",
    xs: "h-6 px-2 text-xs",
    sm: "h-8 px-4 text-xs",
    md: "h-9 px-6 text-base",
    lg: "h-10 px-8 text-base"
  }
  const getBorderClasses = () => {
    let borderClasses = []
    if ($rounded && !$squared) borderClasses.push("rounded-full")
    if ($squared && !$rounded) borderClasses.push("rounded-md")
    if ($border === "secondary") borderClasses.push("border-transparent")
    if ($border === "outline") borderClasses.push("border-primary-base")
    return borderClasses.join(" ")
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
      {loading && <Spinner isIcon={size === "icon"} />} {children}
    </button>
  )
})

export default Button
