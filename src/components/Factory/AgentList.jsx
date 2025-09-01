import { memo } from "react"
import { Plus, Trash2, Pencil, Bot } from "lucide-react"

import Button from "../Button"
import DynamicIcon from "../DynamicIcon"

const AgentList = memo(({ agents, onCreate, onEdit, onDelete, canCreate }) => (
  <div className="flex flex-col h-full">
    <div className="flex-1 overflow-y-auto py-2 pr-2">
      {agents.length === 0 ? (
        <div className="text-center py-10">
          <Bot size={48} className="mx-auto text-lightFg-tertiary dark:text-darkFg-tertiary" />
          <p className="mt-4 text-sm text-lightFg-primary dark:text-darkFg-primary">Você ainda não criou nenhum agente.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {agents.map((agent) => (
            <li key={agent._id}>
              <button
                onClick={() => onEdit(agent)}
                className="w-full text-left p-3 rounded-md transition-colors flex justify-between items-center group hover:bg-lightBg-tertiary dark:hover:bg-darkBg-secondary">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <DynamicIcon name={agent.Icon} className="text-primary-base flex-shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lightFg-primary dark:text-darkFg-primary truncate">{agent.name}</p>
                    <p className="text-xs text-lightFg-tertiary dark:text-darkFg-tertiary truncate">{agent.description}</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pl-2">
                  <Button
                    variant="warning"
                    size="icon"
                    $rounded
                    title="Editar"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(agent)
                    }}>
                    <Pencil size={14} />
                  </Button>
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
    <div className="pt-2 border-t border-bLight dark:border-bDark">
      <Button
        variant="primary"
        $rounded
        onClick={onCreate}
        className="w-full justify-center"
        disabled={!canCreate}
        title={canCreate ? "Criar Novo Agente" : "Limite de 7 agentes atingido"}>
        <Plus size={16} className="mr-2" /> Criar Novo Agente
      </Button>
    </div>
  </div>
))

export default AgentList
