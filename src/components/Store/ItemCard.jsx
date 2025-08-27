import { memo } from "react"
import { Check, Plus } from "lucide-react"
import Paper from "../Paper"
import DynamicIcon from "../DynamicIcon"
import PurpleLink from "../Embeds/PurpleLink"
import Button from "../Button"

const StoreItemCard = memo(({ item, onAcquire, isAcquired, loading }) => {
  const handleAcquire = (e) => {
    e.stopPropagation()
    onAcquire(item._id)
  }

  return (
    <Paper className="bg-lightBg-secondary dark:bg-darkBg-secondary p-4 flex flex-col gap-3 h-full transition-transform hover:-translate-y-1">
      <div className="flex items-center gap-3">
        <div className="bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-lg">
          <DynamicIcon name={item.Icon} size={24} className="text-primary-base" />
        </div>
        <h3 className="font-bold text-lg text-lightFg-primary dark:text-darkFg-primary truncate">{item.title || item.name}</h3>
      </div>
      <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary flex-grow min-h-[40px]">
        {item.description}
      </p>
      <div className="flex items-center justify-between pt-3 border-t border-bLight dark:border-bDark">
        <PurpleLink to={`/profile/${item.author._id}`} className="flex items-center gap-2 group">
          <img src={item.author.avatarUrl} alt={item.author.name} className="w-6 h-6 rounded-full object-cover transition-transform group-hover:scale-110" />
          <span className="text-xs font-medium group-hover:underline">{item.author.name}</span>
        </PurpleLink>
        <Button
          onClick={handleAcquire}
          variant={isAcquired ? "success" : "primary"}
          $rounded
          disabled={isAcquired || loading}
          title={isAcquired ? "Adicionado à sua coleção" : "Adicionar à sua coleção"}
        >
          {isAcquired ? <Check size={16} className="mr-1" /> : <Plus size={16} className="mr-1" />}
          {isAcquired ? "Adicionado" : "Adicionar"}
        </Button>
      </div>
    </Paper>
  )
})

export default StoreItemCard
