import {
  Globe, GlobeLock, Newspaper, Shredder, Cloud, CloudOff,
  BookOpen, BookAlert, Link2, Link2Off, Wrench, Gamepad, Gamepad2,
  Server, ServerOff
} from "lucide-react"

import { useAI } from "../../contexts/AIContext"

import Button from "../Button"

const AITools = ({ dropdownRef }) => {
  const {
    aiProvider,
    model, freeModels, payModels, groqModels,
    stream, loading,
    web, toggleWeb,
    newsTool, toggleNews,
    weatherTool, toggleWeather,
    wikiTool, toggleWiki,
    browseTool, toggleBrowse,
    genshinTool, toggleGenshin,
    httpTool, toggleHttp,
  } = useAI()

  const allModels = [...freeModels, ...payModels, ...groqModels]
  const selectedModel = allModels.find(m => m.id === model)
  const isToolsSupported = selectedModel?.supports_tools ?? false

  return (
    <div ref={dropdownRef} className="absolute z-20 p-2 rounded-lg shadow-lg bg-lightBg-primary dark:bg-darkBg-primary opacity-80 dark:opacity-90 border border-bLight dark:border-bDark grid grid-cols-6 sm:grid-cols-7 gap-2 w-max left-1/2 -translate-x-1/2 bottom-full mb-4">
      <Button variant={isToolsSupported && aiProvider === "openrouter" && web ? "outline" : "secondary"} size="icon" $rounded title="Pesquisa Profunda" onClick={toggleWeb} disabled={!isToolsSupported || aiProvider === "groq" || loading}>
        {isToolsSupported && aiProvider === "openrouter" ? <Globe size={16} /> : <GlobeLock size={16} />}
      </Button>
      <Button variant={isToolsSupported && !stream && browseTool ? "outline" : "secondary"} size="icon" $rounded title="Acessar Site Específico" onClick={toggleBrowse} disabled={!isToolsSupported || stream || loading}>
        {isToolsSupported && !stream ? <Link2 size={16} /> : <Link2Off size={16} />}
      </Button>
      <Button variant={isToolsSupported && !stream && httpTool ? "outline" : "secondary"} size="icon" $rounded title="Requisição HTTP" onClick={toggleHttp} disabled={!isToolsSupported || stream || loading}>
        {isToolsSupported && !stream ? <Server size={16} /> : <ServerOff size={16} />}
      </Button>
      <Button variant={isToolsSupported && !stream && wikiTool ? "outline" : "secondary"} size="icon" $rounded title="Pesquisar na Wikipédia" onClick={toggleWiki} disabled={!isToolsSupported || stream || loading}>
        {isToolsSupported && !stream ? <BookOpen size={16} /> : <BookAlert size={16} />}
      </Button>
      <Button variant={isToolsSupported && !stream && newsTool ? "outline" : "secondary"} size="icon" $rounded title="Buscar Notícias" onClick={toggleNews} disabled={!isToolsSupported || stream || loading}>
        {isToolsSupported && !stream ? <Newspaper size={16} /> : <Shredder size={16} />}
      </Button>
      <Button variant={isToolsSupported && !stream && weatherTool ? "outline" : "secondary"} size="icon" $rounded title="Prever Clima" onClick={toggleWeather} disabled={!isToolsSupported || stream || loading}>
        {isToolsSupported && !stream ? <Cloud size={16} /> : <CloudOff size={16} />}
      </Button>
      <Button variant={isToolsSupported && !stream && genshinTool ? "outline" : "secondary"} size="icon" $rounded title="Genshin Impact (Beta)" onClick={toggleGenshin} disabled={!isToolsSupported || stream || loading}>
        {isToolsSupported && !stream ? <Gamepad2 size={16} /> : <Gamepad size={16} />}
      </Button>
    </div>
  )
}

export default AITools
