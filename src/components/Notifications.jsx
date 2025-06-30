const MessageBase = ({ children }) => (
  <p className="text-lightFg-primary dark:text-darkFg-primary text-center py-2" data-oid="4z:rh9i">
    {children}
  </p>
)

const MessageSuccess = ({ children }) => (
  <p className="text-success-base text-center py-2" data-oid="kvzs1bj">
    {children}
  </p>
)

const MessageWarning = ({ children }) => (
  <p className="text-warning-base text-center py-2" data-oid="ou9mk0:">
    {children}
  </p>
)

const MessageError = ({ children }) => (
  <p className="text-danger-base text-center py-2" data-oid="mjkh1mc">
    {children}
  </p>
)

export { MessageBase, MessageSuccess, MessageWarning, MessageError }
