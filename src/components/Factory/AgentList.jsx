import { memo } from "react"
import { Plus, Bot, Pencil, Trash2 } from "lucide-react"

import Button from "../Button"
import DynamicIcon from "../DynamicIcon"

const AgentList = memo(({ agents, onSelect, onCreate, onDelete, currentAgentId }) => (
  <div className="flex flex-col h-full bg-lightBg-secondary dark:bg-darkBg-secondary rounded-lg">
    <div className="p-2 border-b border-bLight dark:border-bDark">
      <Button variant="primary" onClick={onCreate} className="w-full justify-center" $rounded>
        <Plus size={16} className="mr-2" /> Novo Agente
      </Button>
    </div>
    <div className="flex-1 overflow-y-auto">
      {agents.length === 0 ? (
        <div className="text-center py-10 px-4">
          <Bot size={40} className="mx-auto text-lightFg-tertiary dark:text-darkFg-tertiary" />
          <p className="mt-4 text-sm text-lightFg-primary dark:text-darkFg-primary">Crie seu primeiro agente.</p>
        </div>
      ) : (
        <ul className="p-2 space-y-1">
          {agents.map((agent) => (
            <li key={agent._id}>
              <button
                onClick={() => onSelect(agent)}
                className={`w-full text-left p-2 rounded-md transition-colors flex justify-between items-center group ${currentAgentId === agent._id ? "bg-primary-base/20" : "hover:bg-lightBg-tertiary dark:hover:bg-darkBg-tertiary"}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <DynamicIcon name={agent.Icon} className={`${currentAgentId === agent._id ? "text-primary-light" : "text-primary-base"} flex-shrink-0`} size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-lightFg-primary dark:text-darkFg-primary truncate">{agent.name}</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pl-2">
                  <Button
                    variant="danger"
                    size="icon"
                    $rounded
                    title="Excluir"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(agent)
                    }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
))

export default AgentList
