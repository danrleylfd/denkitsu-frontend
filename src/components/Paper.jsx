const Paper = ({ node, className = "bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary", children, ...props }) => (
  <div className={`w-full p-4 rounded-lg shadow-[6px_6px_16px_rgba(0,0,0,0.5)] opacity-80 dark:opacity-90 ${className}`} {...props}>
    {children}
  </div>
)

export default Paper
