import { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react"

import { useAuth } from "./AuthContext"

import { getPrompts as getUserPrompts } from "../services/prompt"
import { getPrompt as getSystemPrompts } from "../services/aiChat"

const AIContext = createContext()

const AIProvider = ({ children }) => {
  const { signed } = useAuth()

  const storedAIProvider = localStorage.getItem("@Denkitsu:aiProvider")
  const storedModelGroq = localStorage.getItem("@Denkitsu:GroqModel")
  const storedOpenRouterModel = localStorage.getItem("@Denkitsu:OpenRouterModel")
  const storedGroqKey = localStorage.getItem("@Denkitsu:Groq")
  const storedOpenRouterKey = localStorage.getItem("@Denkitsu:OpenRouter")
  const storedStream = JSON.parse(localStorage.getItem("@Denkitsu:Stream"))
  const storedWeb = JSON.parse(localStorage.getItem("@Denkitsu:Web"))
  const storedBrowserTool = JSON.parse(localStorage.getItem("@Denkitsu:BrowserTool"))
  const storedDuckduckgoTool = JSON.parse(localStorage.getItem("@Denkitsu:DuckduckgoTool"))
  const storedHttpTool = JSON.parse(localStorage.getItem("@Denkitsu:HttpTool"))
  const storedWikiTool = JSON.parse(localStorage.getItem("@Denkitsu:WikiTool"))
  const storedNewsTool = JSON.parse(localStorage.getItem("@Denkitsu:NewsTool"))
  const storedWeatherTool = JSON.parse(localStorage.getItem("@Denkitsu:WeatherTool"))
  const storedCriptoTool = JSON.parse(localStorage.getItem("@Denkitsu:CriptoTool"))
  const storedCinemaTool = JSON.parse(localStorage.getItem("@Denkitsu:CinemaTool"))
  const storedGamesTool = JSON.parse(localStorage.getItem("@Denkitsu:GamesTool"))
  const storedAlbionTool = JSON.parse(localStorage.getItem("@Denkitsu:AlbionTool"))
  const storedGenshinTool = JSON.parse(localStorage.getItem("@Denkitsu:GenshinTool"))
  const storedPokedexTool = JSON.parse(localStorage.getItem("@Denkitsu:PokedexTool"))
  const storedNasaTool = JSON.parse(localStorage.getItem("@Denkitsu:NasaTool"))
  const storedMessages = localStorage.getItem("@Denkitsu:messages")

  const [aiProvider, setAIProvider] = useState(storedAIProvider || "groq")
  const [groqModel, setGroqModel] = useState(storedModelGroq || "deepseek-r1-distill-llama-70b")
  const [openRouterModel, setOpenRouterModel] = useState(storedOpenRouterModel || "deepseek/deepseek-r1:free")
  const [freeModels, setFreeModels] = useState([])
  const [payModels, setPayModels] = useState([])
  const [groqModels, setGroqModels] = useState([])
  const [groqKey, setGroqKey] = useState(storedGroqKey || "")
  const [openRouterKey, setOpenRouterKey] = useState(storedOpenRouterKey || "")
  const [stream, setStream] = useState(storedStream === null ? false : storedStream)
  const [imageUrls, setImageUrls] = useState([])
  const [web, setWeb] = useState(storedWeb === null ? false : storedWeb)
  const [browserTool, setBrowserTool] = useState(storedBrowserTool === null ? false : storedBrowserTool)
  const [duckduckgoTool, setDuckduckgoTool] = useState(storedDuckduckgoTool === null ? false : storedDuckduckgoTool)
  const [httpTool, setHttpTool] = useState(storedHttpTool === null ? false : storedHttpTool)
  const [wikiTool, setWikiTool] = useState(storedWikiTool === null ? false : storedWikiTool)
  const [newsTool, setNewsTool] = useState(storedNewsTool === null ? false : storedNewsTool)
  const [weatherTool, setWeatherTool] = useState(storedWeatherTool === null ? false : storedWeatherTool)
  const [criptoTool, setCriptoTool] = useState(storedCriptoTool === null ? false : storedCriptoTool)
  const [cinemaTool, setCinemaTool] = useState(storedCinemaTool === null ? false : storedCinemaTool)
  const [gamesTool, setGamesTool] = useState(storedGamesTool === null ? false : storedGamesTool)
  const [albionTool, setAlbionTool] = useState(storedAlbionTool === null ? false : storedAlbionTool)
  const [genshinTool, setGenshinTool] = useState(storedGenshinTool === null ? false : storedGenshinTool)
  const [pokedexTool, setPokedexTool] = useState(storedPokedexTool === null ? false : storedPokedexTool)
  const [nasaTool, setNasaTool] = useState(storedNasaTool === null ? false : storedNasaTool)
  const [userPrompt, setUserPrompt] = useState("")
  const [messages, setMessages] = useState(storedMessages ? JSON.parse(storedMessages) : [])
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)

  const [systemPrompts, setSystemPrompts] = useState([])
  const [userPrompts, setUserPrompts] = useState([])
  const [selectedPrompt, setSelectedPrompt] = useState("Padrão")

  useEffect(() => (localStorage.setItem("@Denkitsu:aiProvider", aiProvider)), [aiProvider])
  useEffect(() => (localStorage.setItem("@Denkitsu:GroqModel", groqModel)), [groqModel])
  useEffect(() => (localStorage.setItem("@Denkitsu:OpenRouterModel", openRouterModel)), [openRouterModel])
  useEffect(() => (localStorage.setItem("@Denkitsu:Stream", stream)), [stream])
  useEffect(() => (localStorage.setItem("@Denkitsu:Web", web)), [web])
  useEffect(() => (localStorage.setItem("@Denkitsu:BrowserTool", browserTool)), [browserTool])
  useEffect(() => (localStorage.setItem("@Denkitsu:DuckduckgoTool", duckduckgoTool)), [duckduckgoTool])
  useEffect(() => (localStorage.setItem("@Denkitsu:HttpTool", httpTool)), [httpTool])
  useEffect(() => (localStorage.setItem("@Denkitsu:WikiTool", wikiTool)), [wikiTool])
  useEffect(() => (localStorage.setItem("@Denkitsu:NewsTool", newsTool)), [newsTool])
  useEffect(() => (localStorage.setItem("@Denkitsu:WeatherTool", weatherTool)), [weatherTool])
  useEffect(() => (localStorage.setItem("@Denkitsu:CriptoTool", criptoTool)), [criptoTool])
  useEffect(() => (localStorage.setItem("@Denkitsu:CinemaTool", cinemaTool)), [cinemaTool])
  useEffect(() => (localStorage.setItem("@Denkitsu:GamesTool", gamesTool)), [gamesTool])
  useEffect(() => (localStorage.setItem("@Denkitsu:AlbionTool", albionTool)), [albionTool])
  useEffect(() => (localStorage.setItem("@Denkitsu:GenshinTool", genshinTool)), [genshinTool])
  useEffect(() => (localStorage.setItem("@Denkitsu:PokedexTool", pokedexTool)), [pokedexTool])
  useEffect(() => (localStorage.setItem("@Denkitsu:NasaTool", nasaTool)), [nasaTool])

  useEffect(() => {
    if (groqKey.trim() === "") return localStorage.removeItem("@Denkitsu:Groq")
    localStorage.setItem("@Denkitsu:Groq", groqKey)
  }, [groqKey])

  useEffect(() => {
    if (openRouterKey.trim() === "") return localStorage.removeItem("@Denkitsu:OpenRouter")
    localStorage.setItem("@Denkitsu:OpenRouter", openRouterKey)
  }, [openRouterKey])

  useEffect(() => {
    const basePrompt = { role: "system", content: "Padrão" }
    const currentSystemMessage = messages.find(msg => msg.role === 'system')
    if (!currentSystemMessage) {
      setMessages([basePrompt, ...messages])
    } else if (currentSystemMessage.content !== selectedPrompt) {
      setMessages(prev => prev.map(msg => msg.role === 'system' ? { ...msg, content: selectedPrompt } : msg))
    }
    localStorage.setItem("@Denkitsu:messages", JSON.stringify(messages))
  }, [messages, selectedPrompt])

  useEffect(() => {
    const fetchAllPrompts = async () => {
      try {
        const [userPromptsData, systemPromptsData] = await Promise.all([
          getSystemPrompts(),
          signed ? getUserPrompts() : Promise.resolve([]),
        ])
        setUserPrompts(userPromptsData || [])
        setSystemPrompts(systemPromptsData || [])
      } catch (error) {
        console.error("Falha ao buscar os prompts:", error)
      }
    }
    fetchAllPrompts()
    if (!signed) setUserPrompts([])
  }, [signed])

  const aiProviderToggle = useCallback(() => setAIProvider((prev) => (prev === "groq" ? "openrouter" : "groq")), [])
  const clearHistory = useCallback(() => setMessages([{ role: "system", content: selectedPrompt }]), [selectedPrompt])
  const toggleStream = useCallback(() => setStream(s => !s), [])
  const toggleListening = useCallback(() => setListening(l => !l), [])
  const toggleWeb = useCallback(() => setWeb(w => !w), [])
  const toggleBrowser = useCallback(() => setBrowserTool(b => !b), [])
  const toggleDuckduckgo = useCallback(() => setDuckduckgoTool(d => !d), [])
  const toggleHttp = useCallback(() => setHttpTool(h => !h), [])
  const toggleWiki = useCallback(() => setWikiTool(w => !w), [])
  const toggleNews = useCallback(() => setNewsTool(n => !n), [])
  const toggleWeather = useCallback(() => setWeatherTool(w => !w), [])
  const toggleCripto = useCallback(() => setCriptoTool(c => !c), [])
  const toggleCinema = useCallback(() => setCinemaTool(c => !c), [])
  const toggleGames = useCallback(() => setGamesTool(g => !g), [])
  const toggleAlbion = useCallback(() => setAlbionTool(a => !a), [])
  const toggleGenshin = useCallback(() => setGenshinTool(g => !g), [])
  const togglePokedex = useCallback(() => setPokedexTool(p => !p), [])
  const toggleNasa = useCallback(() => setNasaTool(n => !n), [])

  const speakResponse = useCallback((text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        text
          .replace(/!\[.*?\]\(.*?\)/g, "")
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
          .replace(/[^a-zA-Z0-9À-ÿ,.\-!?;\s]/g, "")
      )
      utterance.lang = "pt-BR"
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    } else {
      console.warn("Speech Synthesis API not supported in this browser.")
    }
  }, [])

  const values = useMemo(() => ({
    stream, setStream, toggleStream,
    speaking, setSpeaking, speakResponse,
    listening, setListening, toggleListening,
    web, setWeb, toggleWeb,
    tools: {
      browserTool, setBrowserTool, toggleBrowser,
      duckduckgoTool, setDuckduckgoTool, toggleDuckduckgo,
      httpTool, setHttpTool, toggleHttp,
      wikiTool, setWikiTool, toggleWiki,
      newsTool, setNewsTool, toggleNews,
      weatherTool, setWeatherTool, toggleWeather,
      criptoTool, setCriptoTool, toggleCripto,
      cinemaTool, setCinemaTool, toggleCinema,
      gamesTool, setGamesTool, toggleGames,
      albionTool, setAlbionTool, toggleAlbion,
      genshinTool, setGenshinTool, toggleGenshin,
      pokedexTool, setPokedexTool, togglePokedex,
      nasaTool, setNasaTool, toggleNasa,
    },
    imageUrls, setImageUrls,
    aiProvider, setAIProvider, aiProviderToggle,
    aiKey: aiProvider === "groq" ? groqKey : openRouterKey,
    setAIKey: aiProvider === "groq" ? setGroqKey : setOpenRouterKey,
    model: aiProvider === "groq" ? groqModel : openRouterModel,
    setModel: aiProvider === "groq" ? setGroqModel : setOpenRouterModel,
    freeModels, setFreeModels,
    payModels, setPayModels,
    groqModels, setGroqModels,
    userPrompt, setUserPrompt,
    messages, setMessages, clearHistory,
    systemPrompts, setSystemPrompts,
    userPrompts, setUserPrompts,
    selectedPrompt, setSelectedPrompt,
  }), [
    stream, toggleStream, speaking, speakResponse, listening, toggleListening, web, toggleWeb,
    browserTool, toggleBrowser, duckduckgoTool, toggleDuckduckgo, httpTool, toggleHttp,
    wikiTool, toggleWiki, newsTool, toggleNews, weatherTool, toggleWeather, criptoTool, toggleCripto,
    cinemaTool, toggleCinema, gamesTool, toggleGames, albionTool, toggleAlbion,
    genshinTool, toggleGenshin, pokedexTool, togglePokedex, nasaTool, toggleNasa,
    imageUrls, aiProvider, aiProviderToggle, groqKey, openRouterKey,
    groqModel, openRouterModel, freeModels, payModels, groqModels,
    userPrompt, messages, clearHistory, userPrompts, systemPrompts, selectedPrompt
  ])

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
