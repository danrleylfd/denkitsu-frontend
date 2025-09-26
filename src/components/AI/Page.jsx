import { ScanText, X } from "lucide-react"

import { useAI } from "../../contexts/AIContext"

import Paper from "../Paper"
import Button from "../Button"

const AIPage = () => {
  const { pageContext, setPageContext } = useAI()

  if (!pageContext) {
    return null
  }

  return (
    <Paper className="flex flex-wrap gap-2 mx-auto px-2 py-1 justify-between items-center">
      <div className="flex items-center gap-2 truncate">
        <ScanText size={16} className="text-primary-base flex-shrink-0" />
        <span className="text-lightFg-secondary dark:text-darkFg-secondary truncate">
          Contexto da página: <span className="font-bold text-lightFg-primary dark:text-darkFg-primary">{pageContext.title}</span>
        </span>
      </div>
      <Button variant="danger" size="icon" $rounded onClick={() => setPageContext(null)} title="Remover Contexto">
        <X size={16} />
      </Button>
    </Paper>
  )
}

export default AIPage
