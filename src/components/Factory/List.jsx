import { memo } from "react"
import { Plus, Bot, PocketKnife, Trash2 } from "lucide-react"

import Button from "../Button"
import DynamicIcon from "../DynamicIcon"

const FactoryList = memo(({ items, itemType, onCreate, onEdit, onDelete }) => {
  const config = {
    agent: { singular: "agente", Icon: Bot },
    tool: { singular: "ferramenta", Icon: PocketKnife }
  }
  const currentConfig = config[itemType]
  const getItemTitle = (item) => {
    if (itemType === "tool") return item.title || item.name
    return item.name
  }
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-2">
        {items.length === 0 ? (
          <div className="text-center py-10 ">
            <currentConfig.Icon size={48} className="mx-auto text-lightFg-tertiary dark:text-darkFg-tertiary" />
            <p className="mt-4 text-sm text-lightFg-primary dark:text-darkFg-primary">
              Você ainda não criou nenhum(a) {currentConfig.singular}.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item._id}>
                <button
                  onClick={() => onEdit(item)}
                  className="w-full text-left p-3 rounded-md transition-colors flex justify-between items-center group bg-transparent hover:bg-lightBtnBg-light active:bg-lightBtnBg-dark dark:hover:bg-darkBtnBg-light dark:active:bg-darkBtnBg-dark">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <DynamicIcon name={item.Icon} className="text-primary-base" size={20} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lightFg-primary dark:text-darkFg-primary truncate">{getItemTitle(item)}</p>
                      <p className="text-xs text-lightFg-tertiary dark:text-darkFg-tertiary truncate">{item.description}</p>
                    </div>
                  </div>
                  <Button variant="danger" size="icon" $rounded title="Excluir" onClick={(e) => { e.stopPropagation(); onDelete(item) }}>
                    <Trash2 size={16} />
                  </Button>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="max-w-fit self-center pt-2 border-t border-bLight dark:border-bDark">
        <Button variant="primary" $rounded onClick={onCreate} className="w-full justify-center">
          <Plus size={16} className="mr-2" /> Fabricar {currentConfig.singular.charAt(0).toUpperCase() + currentConfig.singular.slice(1)}
        </Button>
      </div>
    </div>
  )
})

export default FactoryList
