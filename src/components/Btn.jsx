const Spinner = () => (
  <div className="h-4 w-4 animate-spin-fast rounded-full border-2 border-solid border-transparent border-t-current" />
)

const Button = ({
  type = "button",
  variant = "primary",
  size = "sm",
  $rounded = false,
  $squared = false,
  $triangular = false,
  loading = false,
  disabled = false,
  children,
  ...props
}) => {
  const baseClasses = "relative flex select-none items-center justify-center font-bold uppercase transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50"

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white",
    secondary: "bg-transparent hover:bg-gray-200 active:bg-gray-300 text-gray-800",
    outline: "bg-transparent hover:bg-blue-500 active:bg-blue-700 text-blue-600 hover:text-white active:text-white",
    success: "bg-transparent hover:bg-green-500 active:bg-green-700 text-green-600 hover:text-white active:text-white",
    warning: "bg-transparent hover:bg-yellow-500 active:bg-yellow-700 text-yellow-600 hover:text-white active:text-white",
    danger: "bg-transparent hover:bg-red-500 active:bg-red-700 text-red-600 hover:text-white active:text-white"
  }

  const sizeClasses = {
    icon: "h-8 px-2 text-xs",
    sm: "h-8 px-4 text-xs",
    md: "h-9 px-6 text-base",
    lg: "h-10 px-8 text-base"
  }

  const getShapeClasses = () => {
    if ($triangular) return "[clip-path:polygon(50%_0%,0%_100%,100%_100%)] text-white w-8 h-8 rounded-sm"
    if ($rounded) return "rounded-full"
    if ($squared) return "rounded-none"
    return "rounded-md"
  }

  return (
    <button
      {...props}
      type={type}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${loading ? sizeClasses.icon : sizeClasses[size]}
        ${getShapeClasses()}
        ${loading ? "pointer-events-none opacity-70" : ""}
      `}
      disabled={loading || disabled}
    >
      {loading && <Spinner />} {!loading && !$triangular && children}
    </button>
  )
}

export default Button
