import { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react"

const AIContext = createContext()

export const AIProvider = ({ children }) => {
  const storedKey = localStorage.getItem("openRouterApiKey")
  const [aiKey, setAiKey] = useState(storedKey || "")
  const storedModel = localStorage.getItem("@Denkitsu:model")
  const [model, setModel] = useState(storedModel || "deepseek/deepseek-r1:free")

  useEffect(() => {
    if (aiKey.trim() === "") return localStorage.removeItem("openRouterApiKey")
    localStorage.setItem("openRouterApiKey", aiKey)
  }, [aiKey])

  useEffect(() => {
    localStorage.setItem("@Denkitsu:model", model)
  }, [model])

  const hasKey = useMemo(() => aiKey.trim() !== "", [aiKey])

  return (
    <AIContext.Provider value={{ aiKey, setAiKey, hasKey, model, setModel }}>
      {children}
    </AIContext.Provider>
  )
}

export const useAI = () => {
  const context = useContext(AIContext)
  if (!context) throw new Error("useAI deve ser usado dentro de um <AIProvider>")
  return context
}
