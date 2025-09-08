import { useState, useEffect } from "react"
import { X, Bot, Wrench, Sparkle, Paperclip, Factory, AlertTriangle, Settings, ImagePlus, AudioLines, Mic, Languages, Waypoints, Star, Newspaper, Kanban, Upload, Speech, History, Store, Lightbulb } from "lucide-react"

import { listAgents, listTools } from "../../services/aiChat"
import { useNotification } from "../../contexts/NotificationContext"

import Button from "../Button"
import Paper from "../Paper"
import DynamicIcon from "../DynamicIcon"

const FeatureListItem = ({ icon, title, children }) => (
  <div className="flex items-start gap-2">
    <DynamicIcon name={icon} size={18} className="text-primary-base flex-shrink-0" />
    <div>
      <h5 className="font-bold text-lightFg-primary dark:text-darkFg-primary">{title}</h5>
      <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">{children}</p>
    </div>
  </div>
)

const tabs = [
  { id: "changelog", label: "Changelog", icon: History },
  { id: "agents", label: "Agentes", icon: Speech },
  { id: "tools", label: "Ferramentas", icon: Wrench },
  { id: "factory", label: "Fábrica", icon: Factory },
  { id: "media", label: "Mídia", icon: Paperclip },
  { id: "extras", label: "Extras", icon: Star },
  { id: "customization", label: "Personalização", icon: Sparkle },
  { id: "tips", label: "Dicas", icon: Lightbulb },
  { id: "settings", label: "Configurações", icon: Settings },
]

const TIPS = [
  "Alterne entre os provedores de IA Groq & OpenRouter",
  "Configure as chaves de API dos provedores nas configurações para desbloquear a análise de imagens e as ferramentas",
  "Explore diferentes Agentes de IA nas configurações para tarefas específicas",
  "Descreva como Denkitsu deve se comportar em configurações",
  "Salve seu UID do Genshin no prompt personalizado, assim toda vez que precisar de uma analise, só precisará mencionar o nome do personagem",
  "A análise de imagens exige um modelo compatível ex: qwen/qwen2.5-vl-72b-instruct:free. Máximo 3 imagens.",
  "Use as ferramentas para contextualizar o Denkitsu",
  "As ferramentas exigem um modelo compatível ex: deepseek/deepseek-chat-v3-0324:free",
  "Pressione Ctrl + Enter para enviar o prompt",
  "Para usar os comandos ative as ferramentas necessárias e digite # e uma lista de comandos aparecerá",
  "Limpe a conversa a qualquer momento clicando no ícone de nova mensagem",
  "Entregue a ferramenta Buscar Notícias ao Agente Redator e veja a mágica acontecer",
  "Experimente também entregar as ferramentas de cotação albion e cripto ao Agente Analista",
  "A Transcrição funciona melhor com o Agente Transcritor",
  "🛠️🖼️📄 | Indica que o modelo é compatível com 🛠️ ferramentas / 🖼️ visão computacional / 📄 upload de arquivos",
]

const AIFeatures = ({ featuresDoor, toggleFeaturesDoor }) => {
  const [activeTab, setActiveTab] = useState("changelog")
  const [definitions, setDefinitions] = useState({ agents: [], tools: [] })
  const [loading, setLoading] = useState(true)
  const { notifyError } = useNotification()

  useEffect(() => {
    const fetchDefinitions = async () => {
      if (featuresDoor) {
        try {
          setLoading(true)
          const [agentsRes, toolsRes] = await Promise.all([listAgents(), listTools()])
          setDefinitions({
            agents: agentsRes.data.backendAgents || [],
            tools: [...(toolsRes.data.internalTools || []), ...(toolsRes.data.backendTools || [])]
          })
        } catch (error) {
          notifyError("Não foi possível carregar as definições de recursos.")
        } finally {
          setLoading(false)
        }
      }
    }
    fetchDefinitions()
  }, [featuresDoor, notifyError])

  if (!featuresDoor) return null

  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center h-full"><Button variant="outline" loading disabled /></div>

    switch (activeTab) {
      case "agents":
        return (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">
              Dê à IA um papel específico. Cada agente é otimizado para um tipo de tarefa, alterando o estilo e o formato da resposta.
            </p>
            {definitions.agents.map(({ name, Icon, description }) => (
              <FeatureListItem key={name} title={name} icon={Icon}>
                {description}
              </FeatureListItem>
            ))}
          </div>
        )
      case "tools":
        return (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">Conecte a IA a fontes de dados externas para obter respostas mais ricas e atualizadas. Requer chave de API e um modelo compatível.</p>
            <FeatureListItem title="Fábrica de Ferramentas" icon="Factory">
              Crie suas próprias ferramentas para se conectar a qualquer API. Automatize tarefas e ensine novas habilidades ao Denkitsu através de uma interface simples. Acesse pelo ícone de <Factory size={16} className="inline-block mx-1" /> na barra de chat.
            </FeatureListItem>
            {definitions.tools.map(({ name, title, description, Icon }) => (
              <FeatureListItem key={name} title={title} icon={Icon}>
                {description}
              </FeatureListItem>
            ))}
          </div>
        )
      case "factory":
        return (
          <div className="flex flex-col gap-4 text-sm text-lightFg-secondary dark:text-darkFg-secondary">
            {/* --- Existing Tutorials --- */}
            <h4 className="text-lg font-bold text-lightFg-primary dark:text-darkFg-primary">Tutorial: Criando seu Primeiro Agente</h4>
            <p>Agentes permitem que você personalize a personalidade e comportamento da IA. Diferente das ferramentas, eles não conectam APIs externas, mas definem como a IA deve pensar e responder.</p>
            {/* ... (content of agent tutorial) ... */}
            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Passo 3: Salvar e Ativar</h5>
              <p>Clique em "Salvar Agente". Depois, abra a gaveta de agentes (<Bot size={16} className="inline-block mx-1" />) e ative o novo agente. Agora ele responderá de acordo com suas instruções personalizadas!</p>
            </div>

            <hr className="border-bLight dark:border-bDark" />

            <h4 className="text-lg font-bold text-lightFg-primary dark:text-darkFg-primary">Tutorial: Criando sua Primeira Ferramenta</h4>
            <p>As ferramentas customizadas permitem que você conecte o Denkitsu a qualquer API na internet. Vamos criar uma ferramenta divertida que busca uma piada aleatória do site <a href="https://icanhazdadjoke.com/" target="_blank" rel="noopener noreferrer" className="text-primary-base underline">icanhazdadjoke.com</a>.</p>
            {/* ... (content of tool tutorial) ... */}
            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Passo 5: Salvar e Testar!</h5>
              <p>Clique em "Salvar Ferramenta". Depois, volte para o chat, abra a gaveta de ferramentas (<Wrench size={16} className="inline-block mx-1" />) e ative a sua nova ferramenta "Buscador de Piadas". Agora, simplesmente peça no chat:</p>
              <blockquote className="border-l-4 border-primary-base pl-2 my-2 italic">Me conte uma piada.</blockquote>
              <p>A IA vai entender seu pedido, encontrar a ferramenta `buscarPiada`, executá-la e te contar a piada que a API retornou!</p>
            </div>

            <hr className="border-bLight dark:border-bDark" />

            {/* --- NEW MAPPING TUTORIAL --- */}
            <h4 className="text-lg font-bold text-lightFg-primary dark:text-darkFg-primary">Tutorial Avançado: Mapeamento de Resposta da API</h4>
            <p>O mapeamento é o superpoder da Fábrica. Ele permite que você filtre, limpe e transforme o JSON de uma API antes que a IA o veja. Para todos os exemplos abaixo, vamos imaginar que nossa ferramenta de piadas foi configurada com o Header `{`{"Accept": "application/json"}`}` e o teste retornou o seguinte resultado cru:</p>
            <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-md text-xs font-mono"><code>{`{\n  "id": "R7UFAa6g4Ad",\n  "joke": "My dog used to chase people on a bike a lot. It got so bad I had to take his bike away.",\n  "status": 200\n}`}</code></pre>

            <div className="mt-2">
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Nível 1: Seleção Simples (o básico)</h5>
              <p>Queremos apenas o texto da piada. O resto (ID, status) é ruído para a IA.</p>
              <p className="mt-2"><strong>Mapeamento:</strong> No campo "Response Mapping", coloque o caminho para o dado:</p>
              <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-md text-xs font-mono"><code>joke</code></pre>
              <p className="mt-2"><strong>Preview (O que a IA recebe):</strong></p>
              <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-md text-xs font-mono"><code>"My dog used to chase people on a bike a lot. It got so bad I had to take his bike away."</code></pre>
            </div>

            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Nível 2: Seleção Múltipla (criando um novo objeto)</h5>
              <p>Vamos pegar a piada e seu ID, e entregar um objeto limpo com chaves em português para a IA. Para isso, o mapeamento precisa ser um JSON.</p>
              <p className="mt-2"><strong>Mapeamento:</strong></p>
              <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-md text-xs font-mono"><code>{`{\n  "piada": "joke",\n  "identificador": "id"\n}`}</code></pre>
              <p className="mt-2"><strong>Preview (O que a IA recebe):</strong></p>
              <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-md text-xs font-mono"><code>{`{\n  "piada": "My dog used to chase people on a bike a lot. It got so bad I had to take his bike away.",\n  "identificador": "R7UFAa6g4Ad"\n}`}</code></pre>
            </div>

            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Nível 3: Transformando Arrays</h5>
              <p>Imagine uma API que retorna uma lista de piadas. Queremos extrair apenas alguns campos de cada uma. Usamos as chaves especiais `_source` e `_transform`.</p>
              <p><strong>Resposta Crua da API (Hipotética):</strong></p>
              <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-md text-xs font-mono"><code>{`{\n  "results": [\n    { "id": "abc", "joke": "Why did the scarecrow win an award? Because he was outstanding in his field.", "category": "puns" },\n    { "id": "def", "joke": "I'm reading a book on anti-gravity. It's impossible to put down!", "category": "puns" }\n  ]\n}`}</code></pre>
              <p className="mt-2"><strong>Mapeamento:</strong></p>
              <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-md text-xs font-mono"><code>{`{\n  "piadas": {\n    "_source": "results",\n    "_transform": {\n      "piada": "joke",\n      "id": "id"\n    }\n  }\n}`}</code></pre>
              <p className="mt-2"><strong>Preview (O que a IA recebe):</strong></p>
              <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-md text-xs font-mono"><code>{`{\n  "piadas": [\n    { "piada": "Why did the scarecrow win an award? Because he was outstanding in his field.", "id": "abc" },\n    { "piada": "I'm reading a book on anti-gravity. It's impossible to put down!", "id": "def" }\n  ]\n}`}</code></pre>
            </div>

            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Nível Hacker: Lookups (Juntando Dados)</h5>
              <p>Este é o recurso mais poderoso, para quando a "tradução" de um campo está em outra parte da API.</p>
              <p><strong>Resposta Crua da API (Hipotética):</strong></p>
              <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-md text-xs font-mono"><code>{`{\n  "category_names": {\n    "puns": "Trocadilhos"\n  },\n  "results": [\n    { "id": "def", "joke": "I'm reading a book on anti-gravity. It's impossible to put down!", "category": "puns" }\n  ]\n}`}</code></pre>
              <p className="mt-2"><strong>Mapeamento com `lookup`:</strong> A sintaxe `lookup:caminho_da_tabela:{"{chave_no_item}"}` resolve a tradução.</p>
              <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-md text-xs font-mono"><code>{`{\n  "piadas_com_categoria": {\n    "_source": "results",\n    "_transform": {\n      "piada": "joke",\n      "categoria": "lookup:category_names:{category}"\n    }\n  }\n}`}</code></pre>
              <p className="mt-2"><strong>Preview (O que a IA recebe):</strong></p>
              <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-md text-xs font-mono"><code>{`{\n  "piadas_com_categoria": [\n    { "piada": "I'm reading a book on anti-gravity. It's impossible to put down!", "categoria": "Trocadilhos" }\n  ]\n}`}</code></pre>
            </div>

            <div className="p-3 rounded-md bg-amber-base/10 border border-amber-base/30">
              <h5 className="text-amber-base flex items-center gap-2"><AlertTriangle size={18} />Atenção: Limites de Resposta da API</h5>
              <p className="mt-1 text-amber-dark dark:text-amber-light">Se a API externa retornar uma resposta muito grande (milhares de linhas de dados), ela pode ultrapassar o limite de contexto do modelo de IA, causando um erro.</p>
              <p className="mt-2 font-bold text-amber-dark dark:text-amber-light">É exatamente para isso que o Mapeamento de Resposta foi criado! Use-o para extrair apenas os campos essenciais do payload da API. Ao "enxugar" a resposta, você garante que apenas os dados úteis sejam enviados para a IA, evitando estouro de tokens e tornando a ferramenta mais eficiente.</p>
            </div>
          </div>
        )
      case "media":
        return (
          <>
            <FeatureListItem title="Análise de Imagens" icon="ImagePlus">
              Envie até 3 imagens (via URL) para que a IA possa vê-las e responder a perguntas sobre seu conteúdo. Requer um modelo compatível com visão.
            </FeatureListItem>
            <FeatureListItem title="Leitura em Voz Alta" icon="Speech">
              Qualquer resposta da IA pode ser convertida em áudio. Clique no ícone de som para ouvir a mensagem em voz alta.
            </FeatureListItem>
            <FeatureListItem title="Ditado por Voz" icon="Mic">
              Ative o modo "Ouvir" para transcrever continuamente sua fala para a caixa de texto, ideal para ditar longos prompts sem digitar.
            </FeatureListItem>
            <FeatureListItem title="Transcrição de Áudio" icon="AudioLines">
              Grave uma mensagem de voz ou faça o upload de um arquivo de áudio para que a IA transcreva e, se desejar, resuma ou analise o conteúdo.
            </FeatureListItem>
          </>
        )
      case "extras":
        return (
          <>
            <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">Combine os recursos do Denkitsu para automatizar tarefas complexas em outras áreas da aplicação.</p>
            <FeatureListItem title="Gerar Notícias com Fontes" icon="Newspaper">
              Na página de Notícias ou no Chat, combine o Agente <strong>Redator</strong> com a Ferramenta <strong>Buscar Notícias</strong>. Descreva um tópico e a IA irá pesquisar e escrever um artigo completo.
            </FeatureListItem>
            <FeatureListItem title="Criar Conteúdo para Vídeos" icon="Upload">
              Na página de Upload, use o Agente <strong>Blogueiro</strong> para gerar automaticamente o título e a descrição do seu vídeo a partir de um tema ou rascunho.
            </FeatureListItem>
            <FeatureListItem title="Planejar Projetos no Kanban" icon="Kanban">
              Na página Kanban, descreva um objetivo (ex: "lançar meu site") e use o Agente <strong>Secretário</strong> para que a IA gere automaticamente uma lista de tarefas passo a passo.
            </FeatureListItem>
            <FeatureListItem title="Loja da Comunidade" icon="Store">
              Acesse a Loja para descobrir e adquirir Agentes e Ferramentas criados por outros usuários, expandindo as capacidades do seu assistente.
            </FeatureListItem>
          </>
        )
      case "customization":
        return (
          <>
            <FeatureListItem title="Aperfeiçoador de Prompt" icon="Sparkle">
              Tem uma ideia mas não sabe como formular a pergunta? Escreva o que vier à mente e use o aperfeiçoador para que a IA transforme seu rascunho em um prompt claro e eficaz.
            </FeatureListItem>
            <FeatureListItem title="Comportamento Personalizado" icon="Languages">
              Acesse as configurações e defina um "prompt de sistema". Diga à IA como ela deve se comportar, qual sua personalidade, e que regras deve seguir em todas as suas respostas.
            </FeatureListItem>
          </>
        )
      case "settings":
        return (
          <>
            <FeatureListItem title="Provedores de IA" icon="Waypoints">
              Alterne facilmente entre diferentes fornecedores de modelos, como Groq para velocidade ou OpenRouter para variedade, usando sua própria chave de API.
            </FeatureListItem>
            <FeatureListItem title="Seleção de Modelos" icon="Bot">
              Escolha o modelo de IA específico que deseja usar para a conversa, aproveitando uma vasta lista de opções gratuitas e premium disponíveis em cada provedor.
            </FeatureListItem>
          </>
        )
      case "tips":
        return (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">
              Descubra como aproveitar ao máximo os recursos do Denkitsu.
            </p>
            <ul className="space-y-2">
              {TIPS.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-lightFg-secondary dark:text-darkFg-secondary">
                  <Sparkle size={16} className="text-primary-base flex-shrink-0 mt-1" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      case "changelog":
        return (
          <>
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-lg text-lightFg-primary dark:text-darkFg-primary">Em Breve</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li className="text-lightFg-secondary dark:text-darkFg-secondary">Adicionado suporte para renderização de diagramas com Mermaid.</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-lg text-lightFg-primary dark:text-darkFg-primary">Versão 1.2.1.2 (Atual)</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li className="text-lightFg-secondary dark:text-darkFg-secondary">Provedores de IA personalizados.</li>
                <li className="text-lightFg-secondary dark:text-darkFg-secondary">Changelog.</li>
                <li className="text-lightFg-secondary dark:text-darkFg-secondary">O botão de Recursos foi movido para um local mais acessível na barra de dicas.</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-lg text-lightFg-primary dark:text-darkFg-primary">Versão 1.2.1.1</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li className="text-lightFg-secondary dark:text-darkFg-secondary">Roteador de Agentes / Ferramentas.</li>
                <li className="text-lightFg-secondary dark:text-darkFg-secondary">Loja da Comunidade para compartilhamento de Agentes e Ferramentas.</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-lg text-lightFg-primary dark:text-darkFg-primary">Versão 1.2.1</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li className="text-lightFg-secondary dark:text-darkFg-secondary">Fábrica de Agentes / Ferramentas para criação personalizada.</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-lg text-lightFg-primary dark:text-darkFg-primary">Versão 1.2</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li className="text-lightFg-secondary dark:text-darkFg-secondary">Implementamos as ferramentas Groq e OpenRouter (Pesquisa Profunda, Pesquisar no Navegador, Interpretador de Código).</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-lg text-lightFg-primary dark:text-darkFg-primary">Versão 1.1.x</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li className="text-lightFg-secondary dark:text-darkFg-secondary">Novos Agentes / Ferramentas de IA.</li>
                <li className="text-lightFg-secondary dark:text-darkFg-secondary">Prompt Personalizado.</li>
                <li className="text-lightFg-secondary dark:text-darkFg-secondary">Aperfeiçoador de Prompt.</li>
                <li className="text-lightFg-secondary dark:text-darkFg-secondary">Análise de Imagens.</li>
                <li className="text-lightFg-secondary dark:text-darkFg-secondary">Transcrição de áudio.</li>
                <li className="text-lightFg-secondary dark:text-darkFg-secondary">Ditar texto ouvido.</li>
              </ul>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Paper className="relative h-full max-h-[95%] flex flex-col gap-2 px-2 py-2 border border-solid border-brand-purple" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-bLight dark:border-bDark">
          <h3 className="text-lightFg-primary dark:text-darkFg-primary">Apresentamos Denkitsu!</h3>
          <Button variant="danger" size="icon" $rounded onClick={toggleFeaturesDoor}>
            <X size={16} />
          </Button>
        </div>
        <div className="flex items-center gap-1 border-b border-bLight dark:border-bDark">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-2 py-2 text-sm font-bold transition-colors ${activeTab === id
                  ? "border-b-2 border-primary-base text-primary-base"
                  : "border-transparent text-lightFg-secondary dark:text-darkFg-secondary hover:text-lightFg-primary dark:hover:text-darkFg-primary"
                }`}>
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <div className="overflow-y-auto pr-1">{renderContent()}</div>
      </Paper>
    </div>
  )
}

export default AIFeatures
