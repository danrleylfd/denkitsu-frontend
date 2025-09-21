import { memo } from "react"
import { Copy, Download, Folder, Edit } from "lucide-react"
import Button from "../Button"

const ResultScreen = memo(({ result, projectName, onCopy, onDownload, onReset, onBackToSelect }) => (
  <div className="flex flex-1 flex-col w-full h-full gap-2 p-4">
    <div className="flex justify-between items-center gap-2">
      <h4 className="font-semibold">Codebase [{projectName}]</h4>
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="primary" $rounded onClick={onCopy}>
          <Copy size={16} className="mr-2" /><span>Copiar Tudo</span>
        </Button>
        <Button variant="secondary" $rounded onClick={onDownload}>
          <Download size={16} className="mr-2" /><span>Baixar .txt</span>
        </Button>
        <Button variant="secondary" $rounded onClick={onBackToSelect}>
          <Edit size={16} className="mr-2" /><span>Voltar para Seleção</span>
        </Button>
        <Button variant="outline" $rounded onClick={onReset}>
          <Folder size={16} className="mr-2" /><span>Começar de Novo</span>
        </Button>
      </div>
    </div>
    <textarea value={result} readOnly className="w-full min-h-[70dvh] p-4 font-mono text-sm bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-md focus:ring-0 resize-none border-none" />
  </div>
))

export default ResultScreen
