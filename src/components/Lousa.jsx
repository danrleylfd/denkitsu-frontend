import { LuX } from "react-icons/lu"
import Button from "./Button"

const Lousa = ({ htmlContent, onClose }) => {
  if (!htmlContent) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" data-oid="6xkt1-t">
      <div className="relative flex w-full h-full flex-col rounded-lg bg-white shadow-2xl dark:bg-darkBg-primary" data-oid="vryxmar">
        <div className="flex items-center justify-between rounded-t-lg bg-lightBg-secondary p-2 dark:bg-darkBg-secondary" data-oid="3xug2b8">
          <h3 className="font-bold text-lightFg-primary dark:text-darkFg-primary" data-oid="t3.j0-n">
            Lousa
          </h3>
          <Button variant="danger" size="icon" $rounded onClick={onClose} data-oid="o-7dbq-">
            <LuX size={16} data-oid="dztg6vu" />
          </Button>
        </div>
        <iframe
          srcDoc={htmlContent}
          title="Lousa"
          sandbox="allow-scripts allow-same-origin"
          className="h-full w-full flex-1 rounded-b-lg border-none"
          data-oid="fgau7q7"
        />
      </div>
    </div>
  )
}

export default Lousa
