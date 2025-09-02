import { useState } from "react"
import { X, Bot, Wrench, Sparkle, Paperclip, Factory, AlertTriangle, Settings, ImagePlus, AudioLines, Mic, Languages, Waypoints, Star, Newspaper, Kanban, Upload, Speech, History, Store } from "lucide-react"

import { AGENTS_DEFINITIONS } from "../../constants/agents"
import { TOOL_DEFINITIONS } from "../../constants/tools"

import Button from "../Button"
import Paper from "../Paper"

const FeatureListItem = ({ icon: Icon, title, children }) => (
  <div className="flex items-start gap-2">
    <Icon size={18} className="text-primary-base flex-shrink-0" />
    <div>
      <h5 className="font-bold text-lightFg-primary dark:text-darkFg-primary">{title}</h5>
      <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">{children}</p>
    </div>
  </div>
)

const tabs = [
  { id: "changelog", label: "Changelog", icon: History },
  { id: "agents", label: "Agentes", icon: Bot },
  { id: "tools", label: "Ferramentas", icon: Wrench },
  { id: "factory", label: "Fábrica", icon: Factory },
  { id: "media", label: "Mídia", icon: Paperclip },
  { id: "extras", label: "Extras", icon: Star },
  { id: "customization", label: "Personalização", icon: Sparkle },
  { id: "settings", label: "Configurações", icon: Settings },
]

const AIFeatures = ({ featuresDoor, toggleFeaturesDoor }) => {
  const [activeTab, setActiveTab] = useState("changelog")
  if (!featuresDoor) return null
  const renderContent = () => {
    switch (activeTab) {
      case "agents":
        return (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">
              Dê à IA um papel específico. Cada agente é otimizado para um tipo de tarefa, alterando o estilo e o formato da resposta.
            </p>
            {AGENTS_DEFINITIONS.map(({ value, description, Icon }) => (
              <FeatureListItem key={value} title={value} icon={Icon}>
                {description}
              </FeatureListItem>
            ))}
          </div>
        )
      case "tools":
        return (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">Conecte a IA a fontes de dados externas para obter respostas mais ricas e atualizadas. Requer chave de API e um modelo compatível.</p>
            <FeatureListItem title="Fábrica de Ferramentas" icon={Factory}>
              Crie suas próprias ferramentas para se conectar a qualquer API. Automatize tarefas e ensine novas habilidades ao Denkitsu através de uma interface simples. Acesse pelo ícone de <Factory size={16} className="inline-block mx-1" /> na barra de chat.
            </FeatureListItem>
            {TOOL_DEFINITIONS.map(({ key, title, description, Icon }) => (
              <FeatureListItem key={key} title={title} icon={Icon}>
                {description}
              </FeatureListItem>
            ))}
          </div>
        )
      case "factory":
        return (
          <div className="flex flex-col gap-1 text-sm text-lightFg-secondary dark:text-darkFg-secondary">
            <h4 className="text-lightFg-primary dark:text-darkFg-primary">Tutorial: Criando seu Primeiro Agente</h4>
            <p>
              Agentes permitem que você personalize a personalidade e comportamento da IA. Diferente das ferramentas, eles não conectam APIs externas, mas definem como a IA deve pensar e responder.
            </p>
            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Passo 1: Abrindo a Fábrica</h5>
              <p>
                Clique no ícone de <Bot size={16} className="inline-block mx-1" /> na barra de chat para abrir a Fábrica de Agentes e clique em "Criar Novo Agente".
              </p>
            </div>
            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Passo 2: Preenchendo os Campos</h5>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong>Nome do Agente:</strong> <code className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-1 rounded">Professor Zen</code></li>
                <li><strong>Descrição:</strong> <code className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-1 rounded">Ajuda a aprender programação com explicações claras.</code></li>
                <li><strong>Goal:</strong> O objetivo central do agente (ex: "Ensinar programação de forma didática").</li>
                <li><strong>Return Format:</strong> Defina como as respostas devem ser estruturadas (ex: "Responda em tópicos claros e exemplos práticos").</li>
                <li><strong>Warning:</strong> Limitações ou regras (ex: "Não dar conselhos médicos").</li>
                <li><strong>Context Dump:</strong> Informações extras ou estilo (ex: "Sempre usar exemplos em JavaScript").</li>
              </ul>
            </div>
            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Passo 3: Salvar e Ativar</h5>
              <p>
                Clique em "Salvar Agente". Depois, abra a gaveta de agentes (<Bot size={16} className="inline-block mx-1" />) e ative o novo agente. Agora ele responderá de acordo com suas instruções personalizadas!
              </p>
            </div>
            <h4 className="text-lg text-lightFg-primary dark:text-darkFg-primary">Tutorial: Criando sua Primeira Ferramenta</h4>
            <p>
              As ferramentas customizadas permitem que você conecte o Denkitsu a qualquer API na internet. Vamos criar uma ferramenta divertida que busca uma piada aleatória do site <a href="https://icanhazdadjoke.com/" target="_blank" rel="noopener noreferrer" className="text-primary-base underline">icanhazdadjoke.com</a>.
            </p>
            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Passo 1: Entendendo a API</h5>
              <p>A API de piadas é simples. Para pegar uma piada como texto, precisamos acessar a URL `https://icanhazdadjoke.com/` e enviar um "cabeçalho" (Header) especial dizendo que queremos a resposta em texto puro.</p>
            </div>
            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Passo 2: Abrindo a Fábrica</h5>
              <p>Clique no ícone de <Factory size={16} className="inline-block mx-1" /> na barra de chat para abrir a Fábrica de Ferramentas e clique em "Criar Nova Ferramenta".</p>
            </div>
            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Passo 3: Preenchendo o Formulário</h5>
              <p className="">Copie e cole os valores abaixo em cada campo correspondente:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong>Apelido da Ferramenta:</strong> <code className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-1 rounded">Buscador de Piadas</code></li>
                <li><strong>Nome Técnico:</strong> <code className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-1 rounded">buscarPiada</code></li>
                <li><strong>Descrição para a IA:</strong> <code className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-1 rounded">Use esta ferramenta para buscar uma piada aleatória em inglês. A ferramenta não precisa de nenhum parâmetro.</code></li>
                <li><strong>Método HTTP:</strong> Selecione `GET`</li>
                <li><strong>URL Base da API:</strong> <code className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-1 rounded">https://icanhazdadjoke.com/</code></li>
                <li><strong>Parâmetros de Query:</strong> Deixe como está (um JSON vazio `{ }`).</li>
              </ul>
            </div>
            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Passo 4: Configurações Avançadas</h5>
              <p className="">Clique para expandir as "Configurações Avançadas" e preencha:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong>Definição de Parâmetros (Schema):</strong> Como não precisamos de nenhuma informação do usuário, podemos deixar o schema com as propriedades vazias:
                  <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-md text-xs font-mono"><code>{`{ "type": "object", "properties": {} }`}</code></pre>
                </li>
                <li><strong>Headers (JSON):</strong> Esta é a parte importante para esta API. Precisamos dizer a ela para nos dar texto puro.
                  <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-md text-xs font-mono"><code>{`{ "Accept": "text/plain" }`}</code></pre>
                </li>
                <li><strong>Body (JSON):</strong> Deixe como está (um JSON vazio `{ }`).</li>
              </ul>
            </div>
            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Passo 5: Salvar e Testar!</h5>
              <p>Clique em "Salvar Ferramenta". Depois, volte para o chat, abra a gaveta de ferramentas (<Wrench size={16} className="inline-block mx-1" />) e ative a sua nova ferramenta "Buscador de Piadas". Agora, simplesmente peça no chat:</p>
              <blockquote className="border-l-4 border-primary-base pl-2 my-2 italic">Me conte uma piada.</blockquote>
              <p>A IA vai entender seu pedido, encontrar a ferramenta `buscarPiada`, executá-la e te contar a piada que a API retornou!</p>
            </div>
            <div className="p-3 rounded-md bg-amber-base/10 border border-amber-base/30">
              <h5 className="text-amber-base flex items-center gap-2">
                <AlertTriangle size={18} />
                Atenção: Limites de Resposta da API
              </h5>
              <p className="mt-1 text-amber-dark dark:text-amber-light">
                A IA precisa "ler" a resposta completa da API que sua ferramenta busca. Se a API externa retornar uma resposta muito grande (milhares de linhas de dados), ela pode ultrapassar o "limite de leitura" (contexto de tokens) do modelo de IA.
              </p>
              <p className="mt-2 text-amber-dark dark:text-amber-light">
                Isso pode causar um erro e impedir que a IA formule uma resposta final. Portanto, **prefira usar APIs que retornem dados concisos** ou que permitam filtrar a quantidade de informação através de parâmetros na URL!
              </p>
            </div>
            <h4 className="text-lg text-lightFg-primary dark:text-darkFg-primary">Tutorial: Conectando a um Provedor de IA Personalizado</h4>
            <p>
              O Denkitsu permite que você se conecte a qualquer endpoint de API compatível com a API da OpenAI. Isso é útil para usar modelos auto-hospedados (com LM Studio, por exemplo) ou outros serviços de proxy.
            </p>
            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Passo 1: Alternar para o Provedor Personalizado</h5>
              <p>
                Na barra de chat, clique no ícone do provedor atual (<Waypoints size={16} className="inline-block mx-1" />) até que ele se torne um ícone de servidor (<Wrench size={16} className="inline-block mx-1" />) e o título mude para "Provedor: Personalizado".
              </p>
            </div>
            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Passo 2: Abrir as Configurações</h5>
              <p>
                Clique no ícone de engrenagem (<Settings size={16} className="inline-block mx-1" />) para abrir o painel de configurações.
              </p>
            </div>
            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Passo 3: Preencher os Dados</h5>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong>URL da API (Personalizado):</strong> Insira a URL base do seu servidor. Por exemplo, se você está usando LM Studio, o padrão é `http://localhost:1234/v1`.</li>
                <li><strong>Chave da API:</strong> Muitos servidores locais não exigem uma chave. Você pode digitar `nao-usado` ou qualquer outro texto.</li>
                <li><strong>Modelo:</strong> Insira o identificador exato do modelo que você carregou no seu servidor. No LM Studio, você pode encontrar isso na página principal. Ex: `lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF`.</li>
              </ul>
            </div>
            <div>
              <h5 className="text-lightFg-primary dark:text-darkFg-primary">Pronto!</h5>
              <p>
                Feche as configurações. O Denkitsu agora enviará todas as requisições para o seu servidor local. Lembre-se que o desempenho e a compatibilidade com ferramentas dependerão do modelo que você está utilizando.
              </p>
            </div>
          </div>
        )
      case "media":
        return (
          <>
            <FeatureListItem title="Análise de Imagens" icon={ImagePlus}>
              Envie até 3 imagens (via URL) para que a IA possa vê-las e responder a perguntas sobre seu conteúdo. Requer um modelo compatível com visão.
            </FeatureListItem>
            <FeatureListItem title="Leitura em Voz Alta" icon={Speech}>
              Qualquer resposta da IA pode ser convertida em áudio. Clique no ícone de som para ouvir a mensagem em voz alta.
            </FeatureListItem>
            <FeatureListItem title="Ditado por Voz" icon={Mic}>
              Ative o modo "Ouvir" para transcrever continuamente sua fala para a caixa de texto, ideal para ditar longos prompts sem digitar.
            </FeatureListItem>
            <FeatureListItem title="Transcrição de Áudio" icon={AudioLines}>
              Grave uma mensagem de voz ou faça o upload de um arquivo de áudio para que a IA transcreva e, se desejar, resuma ou analise o conteúdo.
            </FeatureListItem>
          </>
        )
      case "extras":
        return (
          <>
            <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">Combine os recursos do Denkitsu para automatizar tarefas complexas em outras áreas da aplicação.</p>
            <FeatureListItem title="Gerar Notícias com Fontes" icon={Newspaper}>
              Na página de Notícias ou no Chat, combine o Agente <strong>Redator</strong> com a Ferramenta <strong>Buscar Notícias</strong>. Descreva um tópico e a IA irá pesquisar e escrever um artigo completo.
            </FeatureListItem>
            <FeatureListItem title="Criar Conteúdo para Vídeos" icon={Upload}>
              Na página de Upload, use o Agente <strong>Blogueiro</strong> para gerar automaticamente o título e a descrição do seu vídeo a partir de um tema ou rascunho.
            </FeatureListItem>
            <FeatureListItem title="Planejar Projetos no Kanban" icon={Kanban}>
              Na página Kanban, descreva um objetivo (ex: "lançar meu site") e use o Agente <strong>Secretário</strong> para que a IA gere automaticamente uma lista de tarefas passo a passo.
            </FeatureListItem>
            <FeatureListItem title="Loja da Comunidade" icon={Store}>
              Acesse a Loja para descobrir e adquirir Agentes e Ferramentas criados por outros usuários, expandindo as capacidades do seu assistente.
            </FeatureListItem>
          </>
        )
      case "customization":
        return (
          <>
            <FeatureListItem title="Aperfeiçoador de Prompt" icon={Sparkle}>
              Tem uma ideia mas não sabe como formular a pergunta? Escreva o que vier à mente e use o aperfeiçoador para que a IA transforme seu rascunho em um prompt claro e eficaz.
            </FeatureListItem>
            <FeatureListItem title="Comportamento Personalizado" icon={Languages}>
              Acesse as configurações e defina um "prompt de sistema". Diga à IA como ela deve se comportar, qual sua personalidade, и que regras deve seguir em todas as suas respostas.
            </FeatureListItem>
          </>
        )
      case "settings":
        return (
          <>
            <FeatureListItem title="Provedores de IA" icon={Waypoints}>
              Alterne facilmente entre diferentes fornecedores de modelos, como Groq para velocidade ou OpenRouter para variedade, usando sua própria chave de API.
            </FeatureListItem>
            <FeatureListItem title="Seleção de Modelos" icon={Bot}>
              Escolha o modelo de IA específico que deseja usar para a conversa, aproveitando uma vasta lista de opções gratuitas e premium disponíveis em cada provedor.
            </FeatureListItem>
          </>
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
      <Paper
        className="relative w-full max-w-[95%] h-full max-h-[95%] flex flex-col px-2 py-2 gap-2 rounded-lg bg-lightBg-primary px-2 shadow-2xl dark:bg-darkBg-primary border border-solid border-brand-purple"
        onClick={(e) => e.stopPropagation()}>
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
                  ? "border-primary-base text-primary-base"
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
