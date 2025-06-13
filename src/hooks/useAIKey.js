import { useState, useEffect, useCallback, useMemo } from "react"

const useAIKey = () => {
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

  return { aiKey, setAiKey, hasKey, saveKey, removeKey }
}

export default useAIKey
