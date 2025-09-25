import { Store as StoreIcon, Bot, PocketKnife } from "lucide-react"

import Button from "../Button"
import Paper from "../Paper"

const StoreBar = ({ activeTab, setActiveTab }) => {
  const Tabs = () => (
    <div className="flex items-center gap-2 bg-lightBg-secondary dark:bg-darkBg-secondary rounded-full">
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
    <Paper className="flex mx-auto gap-2 mb-2 p-2 justify-between items-center">
      <StoreIcon size={16} className="ml-3" />
      <Tabs />
    </Paper>
  )
}

export default StoreBar
