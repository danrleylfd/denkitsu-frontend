import {
  Route, Globe, MonitorPlay, Terminal, Link2, Search, Server, Bitcoin, Telescope,
  Earth, SunMoon, Thermometer, Satellite, Orbit, Newspaper, Cloud, BookOpen, Gamepad,
  Coins, Gamepad2, Smartphone, Clapperboard, SquareLibrary, BookOpenText,
} from "lucide-react"

const TOOL_DEFINITIONS = [
  // { key: "selectAgentTool", title: "Selecionador de Agente", Icon: Route, description: "Ferramenta interna para o Agente Roteador selecionar o especialista apropriado." },

  { key: "web", title: "Pesquisa Profunda", Icon: Globe, description: "Realiza uma busca aprofundada na web para encontrar respostas detalhadas sobre qualquer assunto." },
  { key: "browser_search", title: "Pesquisar no Navegador", Icon: MonitorPlay, description: "Permite que a IA navegue interativamente em sites para obter respostas detalhadas. (Apenas modelos gpt-oss)" },
  { key: "code_interpreter", title: "Interpretador de Código", Icon: Terminal, description: "Permite que a IA execute código Python para realizar cálculos e resolver problemas computacionais." },

  { key: "browserTool", title: "Acessar Site Específico", Icon: Link2, description: "Extrai e analisa o conteúdo de uma URL específica que você fornecer no prompt." },
  { key: "httpTool", title: "Requisição HTTP", Icon: Server, description: "Faz uma requisição GET para uma URL, útil para acessar APIs ou dados brutos de uma página." },
  { key: "duckduckgoTool", title: "Pesquisar no DuckDuckGo", Icon: Search, description: "Executa uma pesquisa rápida e direta no DuckDuckGo para obter resultados imediatos." },
  { key: "bibleTool", title: "Pesquisar na Bíblia", Icon: BookOpenText, description: "Busca por versículos, passagens ou termos específicos diretamente no texto bíblico." },
  { key: "wikiTool", title: "Pesquisar na Wikipédia", Icon: BookOpen, description: "Consulta a Wikipédia para obter resumos e informações enciclopédicas sobre um tópico." },
  { key: "newsTool", title: "Buscar Notícias", Icon: Newspaper, description: "Pesquisa as notícias mais recentes de fontes globais sobre um determinado assunto." },
  { key: "cinemaTool", title: "Pesquisa Cinematográfica", Icon: Clapperboard, description: "Busca informações sobre filmes e séries, incluindo sinopses, elenco e avaliações." },
  { key: "gamesTool", title: "Pesquisar Jogos", Icon: Gamepad, description: "Encontra detalhes sobre videojogos, como data de lançamento, plataformas e gênero." },
  { key: "pokedexTool", title: "Pesquisar na Pokédex", Icon: Smartphone, description: "Obtém informações detalhadas sobre qualquer Pokémon, como tipos, habilidades e status." },
  { key: "genshinTool", title: "Análise Genshin Impact (Beta)", Icon: Gamepad2, description: "Analisa builds de personagens do Genshin Impact a partir de um UID." },
  { key: "criptoTool", title: "Cotação: Cripto (Beta)", Icon: Bitcoin, description: "Verifica a cotação atual de diversas criptomoedas em tempo real." },
  { key: "albionTool", title: "Cotação: Albion Online Ouro (Beta)", Icon: Coins, description: "Consulta o preço atual do ouro no jogo Albion Online." },
  { key: "weatherTool", title: "Clima na Terra", Icon: Cloud, description: "Fornece a previsão do tempo para qualquer cidade do mundo." },
  { key: "spaceWeatherTool", title: "NASA: Clima Espacial", Icon: SunMoon, description: "Busca relatórios da NASA sobre as condições climáticas no espaço." },
  { key: "marsWeatherTool", title: "NASA: Clima em Marte", Icon: Thermometer, description: "Obtém os últimos dados meteorológicos diretamente dos rovers da NASA em Marte." },
  { key: "asteroidsTool", title: "NASA: Rastrear Asteroides", Icon: Satellite, description: "Verifica asteroides próximos à Terra usando dados da NASA." },
  { key: "nasaTool", title: "NASA: Imagem do dia", Icon: Telescope, description: "Busca e exibe a 'Imagem Astronômica do Dia' da NASA." },
  { key: "earthTool", title: "NASA: Imagens da Terra", Icon: Earth, description: "Recupera imagens da Terra a partir de uma localização e data específicas, via satélites da NASA." },
  { key: "marsRoverTool", title: "NASA: Imagens de Marte", Icon: Orbit, description: "Busca fotos tiradas pelos rovers da NASA em Marte." },
  { key: "nasaLibraryTool", title: "NASA: Biblioteca de Mídia", Icon: SquareLibrary, description: "Pesquisa na vasta biblioteca de imagens e vídeos da NASA." },
]

export { TOOL_DEFINITIONS }
