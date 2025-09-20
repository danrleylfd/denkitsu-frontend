import { memo } from "react"
import { Github, Folder, Trash2 } from "lucide-react"
import Button from "../Button"

const RecentItemsList = memo(({ items, onClick, onRemove, onClearAll }) => {
  if (items.length === 0) return null
  return (
    <div className="w-full mt-6 pt-4 border-t border-bLight dark:border-bDark">
      <div className="flex justify-between items-center mb-2 px-1">
        <h4 className="text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">Recentes</h4>
        <Button variant="danger" $rounded onClick={onClearAll}>Limpar Histórico</Button>
      </div>
      <ul className="space-y-1">
        {items.map(item => (
          <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-lightBg-tertiary dark:hover:bg-darkBg-tertiary group">
            <button onClick={() => onClick(item)} className="flex items-center gap-3 text-left flex-grow truncate" title={item.handleAvailable ? `Recarregar ${item.name}` : `Lembrar de carregar ${item.name}`}>
              {item.type === "github" ? <Github size={16} className="text-lightFg-secondary dark:text-darkFg-secondary" /> : <Folder size={16} className="text-lightFg-secondary dark:text-darkFg-secondary" />}
              <span className="font-mono text-sm truncate text-lightFg-primary dark:text-darkFg-primary">{item.name}</span>
            </button>
            <Button
              variant="danger" size="icon" $rounded
              onClick={(e) => { e.stopPropagation(); onRemove(item) }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title={`Remover ${item.name}`}>
              <Trash2 size={14} />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
})

export default RecentItemsList
