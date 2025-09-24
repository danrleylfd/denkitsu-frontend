import { memo } from "react"
import { Loader2 } from "lucide-react"

const ProcessingScreen = memo(({ statusText }) => (
  <>
    <Loader2 className="h-10 w-10 animate-spin text-primary-base" />
    <p className="text-lg font-medium text-lightFg-primary dark:text-darkFg-primary">{statusText}</p>
  </>
))

export default ProcessingScreen
