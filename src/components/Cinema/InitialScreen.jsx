import { memo } from "react"
import { FolderSearch } from "lucide-react"
import Button from "../Button"

const InitialScreen = memo(({ onSelectFolder, isLoading }) => (
  <div className="flex flex-1 flex-col p-2 items-center justify-center text-center">
    <FolderSearch className="w-24 h-24 text-lightFg-tertiary dark:text-darkFg-tertiary mb-6" />
    <h1 className="text-3xl font-bold mb-2 text-lightFg-primary dark:text-darkFg-primary">Seu Cinema Particular</h1>
    <p className="mb-8 text-lightFg-secondary dark:text-darkFg-secondary max-w-md">Selecione uma pasta em seu computador para carregar e assistir aos seus vídeos locais.</p>
    <Button variant="primary" $rounded onClick={onSelectFolder} loading={isLoading}>
      {isLoading ? "Escaneando..." : "Selecionar Pasta de Vídeos"}
    </Button>
  </div>
))

export default InitialScreen
