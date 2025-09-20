import { memo } from "react"
import { Loader2 } from "lucide-react"

const ProcessingScreen = memo(({ statusText }) => (
  <div className="flex flex-col items-center justify-center gap-4 p-4">
    <Loader2 className="h-12 w-12 animate-spin text-primary-base" />
    <p className="text-lg font-medium text-lightFg-primary dark:text-darkFg-primary">{statusText}</p>
  </div>
))

export default ProcessingScreen
