import { Globe, Link2, Search, Server, Bitcoin, Telescope, Earth, Eclipse, Zap, Thermometer, Satellite, Orbit, Newspaper, Cloud, BookOpen, Gamepad, Coins, Gamepad2, Smartphone, Clapperboard } from "lucide-react"

import { useAI } from "../../contexts/AIContext"

import Paper from "../Paper"
import Button from "../Button"

const AITools= ({ loading, toolsDoor }) => {
  if (!toolsDoor) return null
  const { aiProvider, model, freeModels, payModels, groqModels, stream, web, toggleWeb, tools, } = useAI()
  const {
    browserTool, toggleBrowser,
    duckduckgoTool, toggleDuckduckgo,
    httpTool, toggleHttp,
    criptoTool, toggleCripto,
    nasaTool, toggleNasa,
    nasaLibraryTool, toggleNasaLibrary,
    earthTool, toggleEarth,
    marsRoverTool, toggleMarsRover,
    asteroidsTool, toggleAsteroids,
    spaceWeatherTool, toggleSpaceWeather,
    marsWeatherTool, toggleMarsWeather,
    newsTool, toggleNews,
    weatherTool, toggleWeather,
    wikiTool, toggleWiki,
    cinemaTool, toggleCinema,
    gamesTool, toggleGames,
    albionTool, toggleAlbion,
    genshinTool, toggleGenshin,
    pokedexTool, togglePokedex,
  } = tools
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
      <Button variant={isToolsSupported && !stream && duckduckgoTool ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar no DuckDuckGo" onClick={toggleDuckduckgo} disabled={!isToolsSupported || stream || loading}>
        <Search size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && newsTool ? "outline" : "secondary"} size="icon" $rounded title="Buscar Notícias" onClick={toggleNews} disabled={!isToolsSupported || stream || loading}>
        <Newspaper size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && wikiTool ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar na Wikipédia" onClick={toggleWiki} disabled={!isToolsSupported || stream || loading}>
        <BookOpen size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && cinemaTool ? "outline" : "secondary"} size="icon" $rounded title="Pesquisa Cinematográfica" onClick={toggleCinema} disabled={!isToolsSupported || stream || loading}>
        <Clapperboard size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && gamesTool ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar Jogos" onClick={toggleGames} disabled={!isToolsSupported || stream || loading}>
        <Gamepad size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && weatherTool ? "outline" : "secondary"} size="icon" $rounded title="Prever Clima" onClick={toggleWeather} disabled={!isToolsSupported || stream || loading}>
        <Cloud size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && nasaLibraryTool ? "outline" : "secondary"} size="icon" $rounded title="NASA: Biblioteca de Mídia" onClick={toggleNasaLibrary} disabled={!isToolsSupported || stream || loading}>
        <Satellite size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && nasaTool ? "outline" : "secondary"} size="icon" $rounded title="NASA: Imagem do dia" onClick={toggleNasa} disabled={!isToolsSupported || stream || loading}>
        <Eclipse size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && asteroidsTool ? "outline" : "secondary"} size="icon" $rounded title="NASA: Rastrear Asteroides" onClick={toggleAsteroids} disabled={!isToolsSupported || stream || loading}>
        <Telescope size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && earthTool ? "outline" : "secondary"} size="icon" $rounded title="NASA: Imagens da Terra" onClick={toggleEarth} disabled={!isToolsSupported || stream || loading}>
        <Earth size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && marsRoverTool ? "outline" : "secondary"} size="icon" $rounded title="NASA: Imagens de Marte" onClick={toggleMarsRover} disabled={!isToolsSupported || stream || loading}>
        <Orbit size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && spaceWeatherTool ? "outline" : "secondary"} size="icon" $rounded title="NASA: Clima Espacial" onClick={toggleSpaceWeather} disabled={!isToolsSupported || stream || loading}>
        <Zap size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && marsWeatherTool ? "outline" : "secondary"} size="icon" $rounded title="NASA: Clima em Marte" onClick={toggleMarsWeather} disabled={!isToolsSupported || stream || loading}>
        <Thermometer size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && criptoTool ? "outline" : "secondary"} size="icon" $rounded title="Cotação: Cripto (Beta)" onClick={toggleCripto} disabled={!isToolsSupported || stream || loading}>
        <Bitcoin size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && albionTool ? "outline" : "secondary"} size="icon" $rounded title="Cotação: Albion Online Ouro (Beta)" onClick={toggleAlbion} disabled={!isToolsSupported || stream || loading}>
        <Coins size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && pokedexTool ? "outline" : "secondary"} size="icon" $rounded title="Pokédex" onClick={togglePokedex} disabled={!isToolsSupported || stream || loading}>
        <Smartphone size={16} />
      </Button>
      <Button variant={isToolsSupported && !stream && genshinTool ? "outline" : "secondary"} size="icon" $rounded title="Análise Genshin Impact (Beta)" onClick={toggleGenshin} disabled={!isToolsSupported || stream || loading}>
        <Gamepad2 size={16} />
      </Button>
    </Paper>
  )
}

export default AITools
