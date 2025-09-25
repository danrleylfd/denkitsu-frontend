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
    <Paper className="mx-auto mb-2 p-2 w-full max-w-[98%] xs:max-w-[97%] sm:max-w-[98%] md:max-w-[98.5%] lg:max-w-[99%] xl:max-w-[99.5]">
      <div className="flex items-center justify-between gap-2 md:hidden">
        <StoreIcon size={16} className="ml-3" />
        <Tabs />
      </div>
      <div className="hidden md:flex items-center justify-between gap-2">
        <StoreIcon size={16} className="ml-3" />
        <Tabs />
      </div>
    </Paper>
  )
}

export default StoreBar
