import { Store as StoreIcon, Bot, PocketKnife } from "lucide-react"

import Button from "../Button"
import Paper from "../Paper"

const StoreBar = ({ activeTab, setActiveTab }) => {
  const Title = () => (
    <h3 className="text-lightFg-primary dark:text-darkFg-primary flex items-center gap-2">
      <StoreIcon size={20} />
      {/* <span className="text-lg font-bold hidden md:inline">Loja da Comunidade</span> */}
    </h3>
  )

  const Tabs = () => (
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
  )

  return (
    <Paper className="max-w-[98%] px-4 py-2 mb-2 mx-auto">
      <div className="flex items-center justify-between gap-2 md:hidden">
        <Title />
        <Tabs />
      </div>
      <div className="hidden md:flex items-center justify-between gap-2">
        <Title />
        <Tabs />
      </div>
    </Paper>
  )
}

export default StoreBar
