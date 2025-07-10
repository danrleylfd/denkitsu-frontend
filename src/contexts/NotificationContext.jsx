import { createContext, useState, useContext } from "react"
import { X } from "lucide-react"
export const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null)

  const showNotification = (message, type = "error") => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, type === "error" ? 7000 : 5000)
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 ${notification.type === "success" ? "bg-success-base" :
            notification.type === "error" ? "bg-danger-base" :
            notification.type === "info" ? "bg-lightBg-secondary dark:bg-darkBg-secondary" :
            "bg-warning-base"}
            shadow-lg rounded-lg px-4 py-3 min-w-[200px] max-w-[90vw]
            animate-fade-in-down transition-all duration-300`}
        >
          <div className="flex items-center justify-between">
            <p className="text-white font-medium text-sm">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="hover:bg-white/10 rounded-full p-1 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  return useContext(NotificationContext)
}
