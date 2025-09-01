import { memo } from "react"
import { Plus, PocketKnife, Trash2 } from "lucide-react"

import Button from "../Button"
import DynamicIcon from "../DynamicIcon"

const ToolList = memo(({ tools, onCreate, onEdit, onDelete }) => (
  <div className="flex flex-col h-full">
    <div className="flex-1 overflow-y-auto py-2 pr-2">
      {tools.length === 0 ? (
        <div className="text-center py-10">
          <PocketKnife size={48} className="mx-auto text-lightFg-tertiary dark:text-darkFg-tertiary" />
          <p className="mt-4 text-sm text-lightFg-primary dark:text-darkFg-primary">Você ainda não criou nenhuma ferramenta.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tools.map((tool) => (
            <li key={tool._id}>
              <button
                onClick={() => onEdit(tool)}
                className="w-full text-left p-3 rounded-md transition-colors flex justify-between items-center group hover:bg-lightBg-tertiary dark:hover:bg-darkBg-secondary">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <DynamicIcon name={tool.Icon || "PocketKnife"} className="text-primary-base flex-shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lightFg-primary dark:text-darkFg-primary truncate">{tool.title || tool.name}</p>
                    {tool.title && <p className="text-xs font-mono text-lightFg-tertiary dark:text-darkFg-tertiary truncate">{tool.description}</p>}
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
                      onDelete(tool)
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
      <Button variant="primary" $rounded onClick={onCreate} className="w-full justify-center">
        <Plus size={16} className="mr-2" /> Criar Nova Ferramenta
      </Button>
    </div>
  </div>
))

export default ToolList
