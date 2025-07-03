import { LuX } from "react-icons/lu"

import Paper from "./Paper"
import Button from "./Button"

const ImagePreview = ({ imageUrls, onRemoveImage }) => {
  if (imageUrls.length === 0) return null
  return (
    <Paper className="bg-lightBg-secondary dark:bg-darkBg-secondary rounded-none flex gap-2 overflow-x-auto py-2">
      {imageUrls.map((url, index) => (
        <div key={index} className="flex flex-col gap-2">
          <img src={url} alt={`Preview ${index + 1}`} className="h-16 w-auto rounded-md object-cover" />
          <Button
            variant="danger"
            size="icon"
            $rounded
            onClick={() => onRemoveImage(index)}
            title="Remover Imagem">
            <LuX size={16} />
          </Button>
        </div>
      ))}
    </Paper>
  )
}

export default ImagePreview
