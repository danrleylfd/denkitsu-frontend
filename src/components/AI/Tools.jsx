import { Globe, Link2, Server, Bitcoin, Satellite, Newspaper, Cloud, BookOpen, Gamepad2, Smartphone, Clapperboard } from "lucide-react"

import { useAI } from "../../contexts/AIContext"

import Paper from "../Paper"
import Button from "../Button"

const AITools= ({ isOpen, loading }) => {
  if (!isOpen) return null
  const {
    aiProvider,
    model, freeModels, payModels, groqModels,
    stream,
    web, toggleWeb,
    browserTool, toggleBrowser,
    httpTool, toggleHttp,
    criptoTool, toggleCripto,
    nasaTool, toggleNasa,
    newsTool, toggleNews,
    weatherTool, toggleWeather,
    wikiTool, toggleWiki,
    cinemaTool, toggleCinema,
    genshinTool, toggleGenshin,
    pokedexTool, togglePokedex,
  } = useAI()
  const allModels = [...freeModels, ...payModels, ...groqModels]
  const selectedModel = allModels.find(m => m.id === model)
  const isToolsSupported = selectedModel?.supports_tools ?? false
  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-2 py-2 gap-2 rounded-lg shadow-lg
      absolute z-20 left-1/2 -translate-x-1/2 bottom-full max-w-[95%]
      grid grid-cols-5 sm:grid-cols-10
      md:flex md:static md:mx-auto md:left-auto md:translate-x-0 md:bottom-auto`}
    >
      <Button variant={isToolsSupported && aiProvider === "openrouter" && web ? "outline" : "secondary"} size="icon" $rounded title="Pesquisa Profunda" onClick={toggleWeb} disabled={!isToolsSupported || aiProvider === "groq" || loading}>
        <Globe size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && browserTool ? "outline" : "secondary"} size="icon" $rounded title="Acessar Site Específico" onClick={toggleBrowser} disabled={!isToolsSupported || stream || loading}>
        <Link2 size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && httpTool ? "outline" : "secondary"} size="icon" $rounded title="Requisição HTTP" onClick={toggleHttp} disabled={!isToolsSupported || stream || loading}>
        <Server size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && criptoTool ? "outline" : "secondary"} size="icon" $rounded title="Cripto (Beta)" onClick={toggleCripto} disabled={!isToolsSupported || stream || loading}>
        <Bitcoin size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && nasaTool ? "outline" : "secondary"} size="icon" $rounded title="NASA: Imagem do dia" onClick={toggleNasa} disabled={!isToolsSupported || stream || loading}>
        <Satellite size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && newsTool ? "outline" : "secondary"} size="icon" $rounded title="Buscar Notícias" onClick={toggleNews} disabled={!isToolsSupported || stream || loading}>
        <Newspaper size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && weatherTool ? "outline" : "secondary"} size="icon" $rounded title="Prever Clima" onClick={toggleWeather} disabled={!isToolsSupported || stream || loading}>
        <Cloud size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && wikiTool ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar na Wikipédia" onClick={toggleWiki} disabled={!isToolsSupported || stream || loading}>
        <BookOpen size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && cinemaTool ? "outline" : "secondary"} size="icon" $rounded title="Cinema (Beta)" onClick={toggleCinema} disabled={!isToolsSupported || stream || loading}>
        <Clapperboard size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && genshinTool ? "outline" : "secondary"} size="icon" $rounded title="Genshin Impact (Beta)" onClick={toggleGenshin} disabled={!isToolsSupported || stream || loading}>
        <Gamepad2 size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && pokedexTool ? "outline" : "secondary"} size="icon" $rounded title="Pokedex (Beta)" onClick={togglePokedex} disabled={!isToolsSupported || stream || loading}>
        <Smartphone size={16} />
      </Button>
    </Paper>
  )
}

export default AITools
