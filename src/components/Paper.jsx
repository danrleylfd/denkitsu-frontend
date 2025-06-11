const Paper = ({ node, className, children, ...props }) => (
  <div className={`w-full rounded-lg border border-solid border-light-border bg-light-cardBg p-4 dark:border-dark-border dark:bg-dark-cardBg ${className}`} {...props}>
    {children}
  </div>
)

export default Paper
