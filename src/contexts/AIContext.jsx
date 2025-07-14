import { createContext, useState, useEffect, useContext } from "react"

const AIContext = createContext()

const AIProvider = ({ children }) => {
  const storedAIProvider = localStorage.getItem("@Denkitsu:aiProvider")
  const storedModelGroq = localStorage.getItem("@Denkitsu:GroqModel")
  const storedOpenRouterModel = localStorage.getItem("@Denkitsu:OpenRouterModel")
  const storedCustomPrompt = localStorage.getItem("@Denkitsu:customPrompt")
  const storedGroqKey = localStorage.getItem("@Denkitsu:Groq")
  const storedOpenRouterKey = localStorage.getItem("@Denkitsu:OpenRouter")
  const storedStream = JSON.parse(localStorage.getItem("@Denkitsu:Stream"))
  const storedWeb = JSON.parse(localStorage.getItem("@Denkitsu:Web"))
  const storedNewsTool = JSON.parse(localStorage.getItem("@Denkitsu:NewsTool"))
  const storedWeatherTool = JSON.parse(localStorage.getItem("@Denkitsu:WeatherTool"))
  const storedWikiTool = JSON.parse(localStorage.getItem("@Denkitsu:WikiTool"))
  const storedMessages = localStorage.getItem("@Denkitsu:messages")

  const [aiProvider, setAIProvider] = useState(storedAIProvider || "groq")
  const [groqModel, setGroqModel] = useState(storedModelGroq || "deepseek-r1-distill-llama-70b")
  const [openRouterModel, setOpenRouterModel] = useState(storedOpenRouterModel || "deepseek/deepseek-r1:free")
  const [freeModels, setFreeModels] = useState([])
  const [payModels, setPayModels] = useState([])
  const [groqModels, setGroqModels] = useState([])
  const [customPrompt, setCustomPrompt] = useState(storedCustomPrompt || "Responda em português do Brasil (pt-BR).")
  const [groqKey, setGroqKey] = useState(storedGroqKey || "")
  const [openRouterKey, setOpenRouterKey] = useState(storedOpenRouterKey || "")
  const [stream, setStream] = useState(storedStream === null ? false : storedStream)
  const [imageUrls, setImageUrls] = useState([])
  const [web, setWeb] = useState(storedWeb === null ? false : storedWeb)
  const [newsTool, setNewsTool] = useState(storedNewsTool === null ? false : storedNewsTool)
  const [weatherTool, setWeatherTool] = useState(storedWeatherTool === null? false : storedWeatherTool)
  const [wikiTool, setWikiTool] = useState(storedWikiTool === null? false : storedWikiTool)
  const [userPrompt, setUserPrompt] = useState("")
  const [messages, setMessages] = useState(storedMessages ? JSON.parse(storedMessages) : [])

  useEffect(() => (localStorage.setItem("@Denkitsu:aiProvider", aiProvider)), [aiProvider])

  useEffect(() => (localStorage.setItem("@Denkitsu:GroqModel", groqModel)), [groqModel])

  useEffect(() => (localStorage.setItem("@Denkitsu:OpenRouterModel", openRouterModel)), [openRouterModel])

  useEffect(() => (localStorage.setItem("@Denkitsu:customPrompt", customPrompt)), [customPrompt])

  useEffect(() => (localStorage.setItem("@Denkitsu:Stream", stream)), [stream])

  useEffect(() => (localStorage.setItem("@Denkitsu:Web", web)), [web])

  useEffect(() => (localStorage.setItem("@Denkitsu:NewsTool", newsTool)), [newsTool])

  useEffect(() => (localStorage.setItem("@Denkitsu:WeatherTool", weatherTool)), [weatherTool])

  useEffect(() => (localStorage.setItem("@Denkitsu:WikiTool", wikiTool)), [wikiTool])

  useEffect(() => {
    if (groqKey.trim() === "") return localStorage.removeItem("@Denkitsu:Groq")
    localStorage.setItem("@Denkitsu:Groq", groqKey)
  }, [groqKey])

  useEffect(() => {
    if (openRouterKey.trim() === "") return localStorage.removeItem("@Denkitsu:OpenRouter")
    localStorage.setItem("@Denkitsu:OpenRouter", openRouterKey)
  }, [openRouterKey])

  useEffect(() => {
    setMessages((prev) => {
      const hasSystemMessage = prev.some((msg) => msg.role === "system")
      if (!hasSystemMessage) return [{ role: "system", content: customPrompt }]
      return prev
    })
    localStorage.setItem("@Denkitsu:messages", JSON.stringify(messages))
  }, [messages, customPrompt])

  const aiProviderToggle = () => setAIProvider((prev) => (prev === "groq" ? "openrouter" : "groq"))

  const clearHistory = () => setMessages([{ role: "system", content: customPrompt }])

  const values = {
    stream, setStream, toggleStream: () => setStream(!stream),
    web, setWeb, toggleWeb: () => setWeb(!web),
    newsTool, setNewsTool, toggleNews: () => setNewsTool(!newsTool),
    weatherTool, setWeatherTool, toggleWeather: () => setWeatherTool(!weatherTool),
    wikiTool, setWikiTool, toggleWiki: () => setWikiTool(!wikiTool),
    imageUrls, setImageUrls,
    aiProvider, setAIProvider, aiProviderToggle,
    aiKey: aiProvider === "groq" ? groqKey : openRouterKey,
    setAIKey: aiProvider === "groq" ? setGroqKey : setOpenRouterKey,
    model: aiProvider === "groq" ? groqModel : openRouterModel, setModel: aiProvider === "groq" ? setGroqModel : setOpenRouterModel,
    freeModels, setFreeModels,
    payModels, setPayModels,
    groqModels, setGroqModels,
    customPrompt, setCustomPrompt,
    userPrompt, setUserPrompt,
    messages, setMessages, clearHistory
  }

  return (
    <AIContext.Provider value={values}>
      {children}
    </AIContext.Provider>
  )
}

const useAI = () => {
  const context = useContext(AIContext)
  if (!context) throw new Error("useAI deve ser usado dentro de um <AIProvider>")
  return context
}

export { useAI }
export default AIProvider
