const MessageBase = ({ children }) => (
  <p className="text-lightFg-primary dark:text-darkFg-primary text-center py-2">
    {children}
  </p>
)

const MessageSuccess = ({ children }) => (
  <p className="text-success-base text-center py-2">
    {children}
  </p>
)

const MessageWarning = ({ children }) => (
  <p className="text-warning-base text-center py-2">
    {children}
  </p>
)

const MessageError = ({ children }) => (
  <p className="text-danger-base text-center py-2">
    {children}
  </p>
)

export { MessageBase, MessageSuccess, MessageWarning, MessageError }
