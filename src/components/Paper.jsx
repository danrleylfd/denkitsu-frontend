const Paper = ({ node, className = "bg-light-cardBg dark:bg-dark-cardBg", children, ...props }) => (
  <div className={`w-full p-4 rounded-lg shadow-[6px_6px_16px_rgba(0,0,0,0.5)] opacity-75 dark:opacity-90 ${className}`} {...props}>
    {children}
  </div>
)

export default Paper
