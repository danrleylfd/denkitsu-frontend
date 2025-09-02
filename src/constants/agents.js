import { Route, Bot, BarChart2, Rss, Code, Presentation, Lightbulb, Newspaper, ListTree, Speech } from "lucide-react"

export const AGENTS_DEFINITIONS = [
  { value: "Roteador", Icon: Route, description: "Analisa a pergunta e seleciona automaticamente o melhor agente para a tarefa." },
  { value: "Padrão", Icon: Bot, description: "Assistente geral para uma ampla gama de tarefas e conversas." },
  { value: "Analista", Icon: BarChart2, description: "Focado em interpretar dados, encontrar padrões e gerar insights." },
  { value: "Blogueiro", Icon: Rss, description: "Ideal para criar textos longos, artigos e posts de blog com estilo." },
  { value: "Desenvolvedor", Icon: Code, description: "Especializado em gerar, explicar e depurar código em várias linguagens." },
  { value: "Lousa", Icon: Presentation, description: "Otimizado para criar visualizações interativas com código HTML." },
  { value: "Prompter", Icon: Lightbulb, description: "Ajuda a refinar e melhorar as suas próprias perguntas para obter melhores respostas." },
  { value: "Redator", Icon: Newspaper, description: "Perfeito para escrever textos concisos, anúncios e notícias." },
  { value: "Secretário", Icon: ListTree, description: "Excelente para organizar informações, criar listas e formatar dados." },
  { value: "Transcritor", Icon: Speech, description: "Especialista em transcrever áudio para texto com alta precisão." },
  { name: "Suporte", Icon: "HeartHandshake", description: "Agente especializado em ajudar com questões da conta, como assinaturas.", disabled: true },
]
