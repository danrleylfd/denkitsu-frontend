import { memo } from "react"
import { X } from "lucide-react"

import Paper from "../Paper"
import Button from "../Button"

const AIImagePreview = ({ imageUrls, onRemoveImage }) => {
  if (imageUrls.length === 0) return null
  return (
    <Paper className="bg-lightBg-primary dark:bg-darkBg-primary rounded-lg flex gap-2 overflow-x-auto py-2 max-w-[95%]  mx-auto">
      {imageUrls.map((url, index) => (
        <div key={index} className="flex flex-col gap-2">
          <img src={url} alt={`Preview ${index + 1}`} className="h-16 w-auto rounded-md object-cover" />
          <Button
            variant="danger"
            size="icon"
            $rounded
            onClick={() => onRemoveImage(index)}
            title="Remover Imagem">
            <X size={16} />
          </Button>
        </div>
      ))}
    </Paper>
  )
}

export default memo(AIImagePreview)
