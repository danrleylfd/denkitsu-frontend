import { memo } from "react"
import { Folder } from "lucide-react"

const FolderItem = memo(({ folder, onSelect }) => (
  <button
    onClick={() => onSelect(folder)}
    className="group relative w-full aspect-[2/3] bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-base/20 focus:outline-none focus:ring-2 focus:ring-primary-base flex flex-col items-center justify-center p-2">
    <Folder className="w-16 h-16 text-amber-base mb-2 transition-transform group-hover:scale-110" />
    <p className="font-bold text-lightFg-primary dark:text-darkFg-primary text-sm break-words text-center leading-tight">
      {folder.name}
    </p>
  </button>
))

export default FolderItem
