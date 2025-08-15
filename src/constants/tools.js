import {
  Globe, Link2, Search, Server, Bitcoin, Telescope, Earth, SunMoon,
  Thermometer, Satellite, Orbit, Newspaper, Cloud, BookOpen, Gamepad,
  Coins, Gamepad2, Smartphone, Clapperboard, SquareLibrary, BookOpenText,
} from "lucide-react"

const TOOL_DEFINITIONS = [
  { key: "web", title: "Pesquisa Profunda", Icon: Globe },
  { key: "browserTool", title: "Acessar Site Específico", Icon: Link2 },
  { key: "httpTool", title: "Requisição HTTP", Icon: Server },
  { key: "duckduckgoTool", title: "Pesquisar no DuckDuckGo", Icon: Search },
  { key: "bibleTool", title: "Pesquisar na Bíblia", Icon: BookOpenText },
  { key: "wikiTool", title: "Pesquisar na Wikipédia", Icon: BookOpen },
  { key: "newsTool", title: "Buscar Notícias", Icon: Newspaper },
  { key: "cinemaTool", title: "Pesquisa Cinematográfica", Icon: Clapperboard },
  { key: "gamesTool", title: "Pesquisar Jogos", Icon: Gamepad },
  { key: "pokedexTool", title: "Pesquisar na Pokédex", Icon: Smartphone },

  { key: "genshinTool", title: "Análise Genshin Impact (Beta)", Icon: Gamepad2 },
  { key: "criptoTool", title: "Cotação: Cripto (Beta)", Icon: Bitcoin },
  { key: "albionTool", title: "Cotação: Albion Online Ouro (Beta)", Icon: Coins },
  { key: "weatherTool", title: "Prever Clima", Icon: Cloud },

  { key: "spaceWeatherTool", title: "NASA: Clima Espacial", Icon: SunMoon },
  { key: "marsWeatherTool", title: "NASA: Clima em Marte", Icon: Thermometer },
  { key: "asteroidsTool", title: "NASA: Rastrear Asteroides", Icon: Satellite },
  { key: "nasaTool", title: "NASA: Imagem do dia", Icon: Telescope },
  { key: "earthTool", title: "NASA: Imagens da Terra", Icon: Earth },
  { key: "marsRoverTool", title: "NASA: Imagens de Marte", Icon: Orbit },
  { key: "nasaLibraryTool", title: "NASA: Biblioteca de Mídia", Icon: SquareLibrary },

]

export { TOOL_DEFINITIONS }
