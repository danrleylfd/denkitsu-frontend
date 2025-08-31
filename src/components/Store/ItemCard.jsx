import { memo } from "react"
import { Check, Plus, Trash2 } from "lucide-react"

import Paper from "../Paper"
import DynamicIcon from "../DynamicIcon"
import PurpleLink from "../Embeds/PurpleLink"
import Button from "../Button"

const StoreItemCard = memo(({ item, user, onAcquire, onUnacquire, isAcquired, loading }) => {
  const isAuthor = item.author?._id === user?._id

  const handleAction = (e) => {
    e.stopPropagation()
    if (isAcquired) {
      onUnacquire(item._id)
    } else {
      onAcquire(item._id)
    }
  }

  return (
    <Paper className="bg-lightBg-secondary dark:bg-darkBg-secondary p-2 flex flex-col gap-2 h-full transition-transform hover:-translate-y-1">
      <div className="flex items-center gap-2">
        <div className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-lg">
          <DynamicIcon name={item.Icon} size={24} className="text-primary-base" />
        </div>
        <h3 className="font-bold text-lg text-lightFg-primary dark:text-darkFg-primary truncate">{item.title || item.name}</h3>
      </div>
      <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary flex-grow min-h-[40px]">
        {item.description}
      </p>
      <div className="flex items-center justify-between pt-2 border-t border-bLight dark:border-bDark">
        <PurpleLink to={`/profile/${item.author._id}`} className="flex items-center gap-2 group">
          <img src={item.author.avatarUrl} alt={item.author.name} className="w-6 h-6 rounded-full object-cover transition-transform group-hover:scale-110" />
          <span className="text-xs font-medium group-hover:underline">{item.author.name}</span>
        </PurpleLink>

        {isAuthor ? (
          <Button variant="info" $rounded disabled title="Você é o criador deste item">
            <Check size={16} className="mr-2" />
            Proprietário
          </Button>
        ) : isAcquired ? (
          <Button
            onClick={handleAction}
            variant="danger"
            $rounded
            disabled={loading}
            title="Remover da sua coleção"
          >
            <Trash2 size={16} className="mr-2" />
            Remover
          </Button>
        ) : (
          <Button
            onClick={handleAction}
            variant="primary"
            $rounded
            disabled={loading}
            title="Adicionar à sua coleção"
          >
            <Plus size={16} className="mr-2" />
            Adicionar
          </Button>
        )}
      </div>
    </Paper>
  )
})

export default StoreItemCard
