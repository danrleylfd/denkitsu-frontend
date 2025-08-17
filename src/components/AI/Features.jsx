import { useState } from "react"
import { X, Bot, Wrench, Sparkle, Paperclip, Settings, ImagePlus, AudioLines, Mic, Languages, Waypoints, Star, Newspaper, Kanban, Upload, Speech } from "lucide-react"

import { AGENTS_DEFINITIONS } from "../../constants/agents"
import { TOOL_DEFINITIONS } from "../../constants/tools"

import Button from "../Button"
import Paper from "../Paper"

const FeatureListItem = ({ icon: Icon, title, children }) => (
  <div className="flex items-start gap-2">
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
  { id: "extras", label: "Extras", icon: Star },
  { id: "customization", label: "Personalização", icon: Sparkle },
  { id: "settings", label: "Configurações", icon: Settings },
]

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
          <>
            <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">
              Dê à IA um papel específico. Cada agente é otimizado para um tipo de tarefa, alterando o estilo e o formato da resposta.
            </p>
            {AGENTS_DEFINITIONS.map(({ value, description, Icon }) => (
              <FeatureListItem key={value} title={value} icon={Icon}>
                {description}
              </FeatureListItem>
            ))}
          </>
        )
      case "tools":
        return (
          <>
            <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">Conecte a IA a fontes de dados externas para obter respostas mais ricas e atualizadas. Requer chave de API e um modelo compatível.</p>
            {TOOL_DEFINITIONS.map(({ key, title, description, Icon }) => (
              <FeatureListItem key={key} title={title} icon={Icon}>
                {description}
              </FeatureListItem>
            ))}
          </>
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
          </>
        )
      case "customization":
        return (
          <>
            <FeatureListItem title="Aperfeiçoador de Prompt" icon={Sparkle}>
              Tem uma ideia mas não sabe como formular a pergunta? Escreva o que vier à mente e use o aperfeiçoador para que a IA transforme seu rascunho em um prompt claro e eficaz.
            </FeatureListItem>
            <FeatureListItem title="Comportamento Personalizado" icon={Languages}>
              Acesse as configurações e defina um "prompt de sistema". Diga à IA como ela deve se comportar, qual sua personalidade, e que regras deve seguir em todas as suas respostas.
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
            <Button variant="outline" $rounded onClick={handleOpenSettings}>
              <Settings size={16} className="mr-2"/>
              Abrir Configurações
            </Button>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Paper
        className="relative flex w-full max-w-2xl flex-col gap-2 rounded-lg bg-lightBg-primary p-2 shadow-2xl dark:bg-darkBg-primary"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-bLight dark:border-bDark">
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lightFg-primary dark:text-darkFg-primary">Apresentamos Denkitsu!</h3>
            <p className="text-lightFg-secondary dark:text-darkFg-secondary">Seu Parceiro Inteligente!</p>
          </div>
          <Button variant="danger" size="icon" $rounded onClick={toggleFeaturesDoor}>
            <X size={16} />
          </Button>
        </div>

        <div className="flex items-center gap-1 border-b border-bLight dark:border-bDark">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-2 py-2 text-sm font-bold transition-colors ${
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
