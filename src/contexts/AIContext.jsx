import { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react"

const AIContext = createContext()

export const AIProvider = ({ children }) => {
  const [aiKey, setAiKey] = useState("")

  useEffect(() => {
    const storedKey = localStorage.getItem("openRouterApiKey")
    if (storedKey) {
      setAiKey(storedKey)
    }
  }, [])

  const saveKey = useCallback(() => {
    if (typeof aiKey !== "string" || aiKey.trim() === "") {
      console.error("Tentativa de salvar uma chave de API inválida.")
      return
    }
    localStorage.setItem("openRouterApiKey", aiKey)
  }, [aiKey])

  const removeKey = useCallback(() => {
    localStorage.removeItem("openRouterApiKey")
    setAiKey("")
  }, [])

  const hasKey = useMemo(() => aiKey.trim() !== "", [aiKey])

  return (
    <AIContext.Provider value={{ aiKey, setAiKey, hasKey, saveKey, removeKey }}>
      {children}
    </AIContext.Provider>
  )
}

export const useAI = () => {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error("useAI deve ser usado dentro de um <AIProvider>")
  }
  return context
}
