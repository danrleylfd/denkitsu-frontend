import { memo } from "react"
import { Folder, ChevronRight } from "lucide-react"

const Breadcrumbs = memo(({ path, onNavigate, rootName }) => {
  const pathParts = path ? path.split("/") : []

  return (
    <div className="flex items-center text-sm text-lightFg-secondary dark:text-darkFg-secondary flex-wrap">
      <button onClick={() => onNavigate("")} className="flex items-center gap-1 hover:text-primary-base">
        <Folder size={16} />
        <span className="font-bold">{rootName}</span>
      </button>
      {pathParts.map((part, index) => {
        const currentPath = pathParts.slice(0, index + 1).join("/")
        return (
          <div key={index} className="flex items-center">
            <ChevronRight size={16} className="mx-1" />
            <button onClick={() => onNavigate(currentPath)} className="hover:text-primary-base">
              {part}
            </button>
          </div>
        )
      })}
    </div>
  )
})

export default Breadcrumbs
