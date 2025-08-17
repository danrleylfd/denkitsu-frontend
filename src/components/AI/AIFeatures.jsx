import { useState } from "react"
import { X, Bot, Wrench, Sparkle, Paperclip, Settings, ImagePlus, AudioLines, Mic, Languages, Waypoints } from "lucide-react"

import { AGENTS_DEFINITIONS } from "../../constants/agents"
import { TOOL_DEFINITIONS } from "../../constants/tools"

import Button from "../Button"
import Paper from "../Paper"

const FeatureListItem = ({ icon: Icon, title, children }) => (
  <div className="flex items-start gap-3">
    <Icon size={18} className="text-primary-base flex-shrink-0 mt-1" />
    <div>
      <h5 className="font-bold text-lightFg-primary dark:text-darkFg-primary">{title}</h5>
      <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">{children}</p>
    </div>
  </div>
)

const tabs = [
  { id: "agents", label: "Agentes", icon: Bot },
  { id: "tools", label: "Ferramentas", icon: Wrench },
  { id: "media", label: "Mídia", icon: Paperclip },
  { id: "customization", label: "Personalização", icon: Sparkle },
  { id: "settings", label: "Configurações", icon: Settings },
]

const agentDescriptions = {
  Padrão: "Assistente geral para uma ampla gama de tarefas e conversas.",
  Analista: "Focado em interpretar dados, encontrar padrões e gerar insights.",
  Blogueiro: "Ideal para criar textos longos, artigos e posts de blog com estilo.",
  Desenvolvedor: "Especializado em gerar, explicar e depurar código em várias linguagens.",
  Lousa: "Otimizado para criar visualizações interativas com código HTML.",
  Prompter: "Ajuda a refinar e melhorar as suas próprias perguntas para obter melhores respostas.",
  Redator: "Perfeito para escrever textos concisos, anúncios e notícias.",
  Secretário: "Excelente para organizar informações, criar listas e formatar dados.",
  Transcritor: "Especialista em transcrever áudio para texto com alta precisão.",
}

const AIFeatures = ({ featuresDoor, toggleFeaturesDoor, toggleSettingsDoor }) => {
  const [activeTab, setActiveTab] = useState("agents")

  if (!featuresDoor) return null

  const handleOpenSettings = () => {
    toggleFeaturesDoor()
    toggleSettingsDoor()
  }

  const renderContent = () => {
    switch (activeTab) {
      case "agents":
        return (
          <div className="space-y-4">
            <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">Dê à IA um papel específico. Cada agente é otimizado para um tipo de tarefa, alterando o estilo e o formato da resposta.</p>
            {AGENTS_DEFINITIONS.map(({ value, Icon }) => (
              <FeatureListItem key={value} title={value} icon={Icon}>
                {agentDescriptions[value]}
              </FeatureListItem>
            ))}
          </div>
        )
      case "tools":
        return (
          <div className="space-y-4">
            <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">Conecte a IA a fontes de dados externas para obter respostas mais ricas e atualizadas. Requer chave de API e um modelo compatível.</p>
            {TOOL_DEFINITIONS.map(({ key, title, Icon }) => (
              <FeatureListItem key={key} title={title} icon={Icon}>
                {`Permite que a IA use a ferramenta "${title}" para contextualizar a resposta.`}
              </FeatureListItem>
            ))}
          </div>
        )
      case "media":
        return (
          <div className="space-y-4">
            <FeatureListItem title="Análise de Imagens" icon={ImagePlus}>
              Envie até 3 imagens (via URL) para que a IA possa vê-las e responder a perguntas sobre seu conteúdo. Requer um modelo compatível com visão.
            </FeatureListItem>
            <FeatureListItem title="Ditado por Voz" icon={Mic}>
              Ative o modo "Ouvir" para transcrever continuamente sua fala para a caixa de texto, ideal para ditar longos prompts sem digitar.
            </FeatureListItem>
            <FeatureListItem title="Transcrição de Áudio" icon={AudioLines}>
              Grave uma mensagem de voz ou faça o upload de um arquivo de áudio para que a IA transcreva e, se desejar, resuma ou analise o conteúdo.
            </FeatureListItem>
          </div>
        )
      case "customization":
        return (
          <div className="space-y-4">
            <FeatureListItem title="Aperfeiçoador de Prompt" icon={Sparkle}>
              Tem uma ideia mas não sabe como formular a pergunta? Escreva o que vier à mente e use o aperfeiçoador para que a IA transforme seu rascunho em um prompt claro e eficaz.
            </FeatureListItem>
            <FeatureListItem title="Comportamento Personalizado" icon={Languages}>
              Acesse as configurações e defina um "prompt de sistema". Diga à IA como ela deve se comportar, qual sua personalidade, e que regras deve seguir em todas as suas respostas.
            </FeatureListItem>
          </div>
        )
      case "settings":
        return (
          <div className="space-y-4">
            <FeatureListItem title="Provedores de IA" icon={Waypoints}>
              Alterne facilmente entre diferentes fornecedores de modelos, como Groq para velocidade ou OpenRouter para variedade, usando sua própria chave de API.
            </FeatureListItem>
            <FeatureListItem title="Seleção de Modelos" icon={Bot}>
              Escolha o modelo de IA específico que deseja usar para a conversa, aproveitando uma vasta lista de opções gratuitas e premium disponíveis em cada provedor.
            </FeatureListItem>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Paper
        className="relative flex w-full max-w-2xl flex-col gap-4 rounded-lg bg-lightBg-primary p-4 shadow-2xl dark:bg-darkBg-primary"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-bLight dark:border-bDark pb-1">
          <h3 className="font-bold text-lightFg-primary dark:text-darkFg-primary">Recursos do Denkitsu AI</h3>
          <Button variant="danger" size="icon" $rounded onClick={toggleFeaturesDoor}>
            <X size={16} />
          </Button>
        </div>

        <div className="flex items-center gap-1 border-b border-bLight dark:border-bDark">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-bold border-b-2 transition-colors ${
                activeTab === id
                  ? "border-primary-base text-primary-base"
                  : "border-transparent text-lightFg-secondary dark:text-darkFg-secondary hover:text-lightFg-primary dark:hover:text-darkFg-primary"
              }`}>
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="min-h-[250px] max-h-[50vh] overflow-y-auto pr-2">
          {renderContent()}
        </div>
      </Paper>
    </div>
  )
}

export default AIFeatures
