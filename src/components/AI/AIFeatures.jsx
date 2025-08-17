import { X, Bot, Wrench, Languages, Paperclip, Mic, Sparkle, Presentation } from "lucide-react"

import Button from "../Button"
import Paper from "../Paper"

const FeatureItem = ({ icon: Icon, title, children }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lightBg-tertiary dark:bg-darkBg-tertiary flex items-center justify-center">
      <Icon size={18} className="text-primary-base" />
    </div>
    <div>
      <h4 className="font-bold text-lightFg-primary dark:text-darkFg-primary">{title}</h4>
      <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary">{children}</p>
    </div>
  </div>
)

const AIFeatures = ({ featuresDoor, toggleFeaturesDoor }) => {
  if (!featuresDoor) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Paper
        className="relative flex w-full max-w-lg flex-col gap-4 rounded-lg bg-lightBg-primary p-4 shadow-2xl dark:bg-darkBg-primary"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lightFg-primary dark:text-darkFg-primary">Recursos do Denkitsu AI</h3>
          <Button variant="danger" size="icon" $rounded onClick={toggleFeaturesDoor}>
            <X size={16} />
          </Button>
        </div>
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
          <FeatureItem icon={Bot} title="Agentes Especializados">
            Selecione agentes como Desenvolvedor, Redator ou Analista para obter respostas personalizadas para tarefas específicas.
          </FeatureItem>
          <FeatureItem icon={Wrench} title="Ferramentas de Contexto">
            Conecte a IA a ferramentas externas como busca na web, notícias, cotações de criptomoedas e APIs da NASA para respostas mais ricas e informadas.
          </FeatureItem>
          <FeatureItem icon={Paperclip} title="Suporte a Mídia">
            Anexe imagens para análise visual ou envie arquivos de áudio para transcrição e resumo direto na conversa.
          </FeatureItem>
          <FeatureItem icon={Mic} title="Interação por Voz">
            Use o ditado para transcrever sua fala em texto ou grave mensagens de voz para serem analisadas pela IA.
          </FeatureItem>
          <FeatureItem icon={Sparkle} title="Aperfeiçoador de Prompt">
            Não sabe como perguntar? Escreva sua ideia e clique no botão de aperfeiçoamento para que a IA refine seu prompt e obtenha melhores resultados.
          </FeatureItem>
          <FeatureItem icon={Presentation} title="Lousa Interativa">
            Peça à IA para gerar código HTML, como gráficos ou tabelas, e visualize o resultado instantaneamente em uma lousa interativa.
          </FeatureItem>
          <FeatureItem icon={Languages} title="Personalização de Comportamento">
            Defina um prompt de sistema personalizado nas configurações para moldar a personalidade e o comportamento da IA em todas as conversas.
          </FeatureItem>
        </div>
      </Paper>
    </div>
  )
}

export default AIFeatures
