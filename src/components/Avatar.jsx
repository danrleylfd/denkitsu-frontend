import { forwardRef } from "react"

const Avatar = forwardRef(({ src, alt, size = 12, isPro = false, className = "", ...props }, ref) => {
  const sizeClasses = `w-${size} h-${size}`
  const baseClasses = "rounded-full object-cover"
  const proClasses = isPro ? "border-2 border-solid border-amber-base" : "border-0"
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={`${baseClasses} ${sizeClasses} ${proClasses} ${className}`}
      {...props}
    />
  )
})

export default Avatar
