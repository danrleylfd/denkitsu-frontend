import { useState } from "react"
import { X, Bot, Wrench, Sparkle, Paperclip, Settings, ImagePlus, AudioLines, Mic, Languages, Waypoints } from "lucide-react"

import Button from "../Button"
import Paper from "../Paper"

const FeatureListItem = ({ icon: Icon, title, children }) => (
  <div className="flex items-start gap-3">
    <Icon size={20} className="text-primary-base flex-shrink-0 mt-1" />
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
            <FeatureListItem title="Agentes Especializados" icon={Bot}>
              Dê à IA um papel específico para a conversa. Escolha entre perfis como Desenvolvedor, Redator, Analista, Transcritor e mais para obter respostas focadas e no formato ideal para sua necessidade.
            </FeatureListItem>
          </div>
        )
      case "tools":
        return (
          <div className="space-y-4">
            <FeatureListItem title="Conecte a IA ao Mundo" icon={Wrench}>
              Ative ferramentas para permitir que a IA acesse informações externas. Busque na web, leia notícias, consulte APIs da NASA, verifique a Pokédex, puxe cotações de criptomoedas e muito mais.
            </FeatureListItem>
          </div>
        )
      case "media":
        return (
          <div className="space-y-4">
            <FeatureListItem title="Análise de Imagens" icon={ImagePlus}>
              Envie até 3 imagens (via URL) para que a IA possa vê-las e responder a perguntas sobre seu conteúdo. Requer um modelo compatível com visão.
            </FeatureListItem>
            <FeatureListItem title="Transcrição de Áudio" icon={AudioLines}>
              Grave uma mensagem de voz ou faça o upload de um arquivo de áudio para que a IA transcreva e, se desejar, resuma ou analise o conteúdo.
            </FeatureListItem>
            <FeatureListItem title="Ditado por Voz" icon={Mic}>
              Ative o modo "Ouvir" para transcrever continuamente sua fala para a caixa de texto, ideal para ditar longos prompts sem digitar.
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
            <FeatureListItem title="Flexibilidade de Provedor e Modelo" icon={Waypoints}>
              Você tem total controle. Adicione suas chaves de API para Groq e OpenRouter, alterne entre eles com um clique e escolha o modelo de IA que melhor se adapta à sua tarefa, seja ele gratuito ou premium.
            </FeatureListItem>
            <Button variant="outline" $rounded onClick={handleOpenSettings}>
              <Settings size={16} className="mr-2"/>
              Abrir Configurações
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Paper
        className="relative flex w-full max-w-lg flex-col gap-4 rounded-lg bg-lightBg-primary p-4 shadow-2xl dark:bg-darkBg-primary"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-bLight dark:border-bDark pb-2">
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

        <div className="min-h-[200px] max-h-[50vh] overflow-y-auto pr-2">
          {renderContent()}
        </div>
      </Paper>
    </div>
  )
}

export default AIFeatures
