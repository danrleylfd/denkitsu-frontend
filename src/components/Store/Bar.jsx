import { Store as StoreIcon, Bot, PocketKnife } from "lucide-react"
import Button from "../Button"

const StoreBar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h1 className="text-3xl font-bold text-lightFg-primary dark:text-darkFg-primary flex items-center gap-3">
        <StoreIcon size={32} />
        Loja da Comunidade
      </h1>
      <div className="flex items-center gap-2 p-1 bg-lightBg-secondary dark:bg-darkBg-secondary rounded-full">
        <Button
          variant={activeTab === "agents" ? "primary" : "secondary"}
          $rounded
          onClick={() => setActiveTab("agents")}
        >
          <Bot size={16} className="mr-2" /> Agentes
        </Button>
        <Button
          variant={activeTab === "tools" ? "primary" : "secondary"}
          $rounded
          onClick={() => setActiveTab("tools")}
        >
          <PocketKnife size={16} className="mr-2" /> Ferramentas
        </Button>
      </div>
    </div>
  )
}

export default StoreBar
