import { useState, useCallback, memo } from "react"
import { Upload } from "lucide-react"

const LocalInputView = memo(({ onDrop, onSelectFolder }) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }, [])
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
    if (e.dataTransfer.items) onDrop(e.dataTransfer.items)
  }, [onDrop])

  return (
    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={onSelectFolder}
      className={`flex flex-col items-center justify-center text-center transition-all duration-300 p-8 h-full rounded-lg cursor-pointer
                  border-2 border-dashed ${isDragging ? "border-primary-base bg-primary-base/10" : "border-bLight dark:border-bDark hover:border-primary-base dark:hover:border-primary-base"}`} >
      <Upload className={`w-12 h-12 transition-transform ${isDragging ? "text-primary-base scale-110" : "text-lightFg-secondary dark:text-darkFg-secondary"}`} />
      <p className={`text-xl font-semibold mt-6 transition-colors ${isDragging ? "text-primary-base" : "text-lightFg-primary dark:text-darkFg-primary"}`}>
        {isDragging ? "Pode soltar a pasta!" : "Arraste uma pasta ou clique para selecionar"}
      </p>
      <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary mt-2">Pastas selecionadas por clique podem ser recarregadas rapidamente.</p>
    </div>
  )
})

export default LocalInputView
