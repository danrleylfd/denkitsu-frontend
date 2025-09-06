import { useMemo } from "react"
import { Waypoints, Server } from "lucide-react"

import { useModels } from "../../contexts/ModelContext"

import Button from "../Button"

const ProviderSelector = (props) => {
  const { aiProvider, aiProviderToggle } = useModels()

  const providerConfig = useMemo(() => {
    switch (aiProvider) {
      case "openrouter":
        return {
          variant: "info",
          title: "Provedor: OpenRouter",
          Icon: Waypoints
        }
      case "custom":
        return {
          variant: "success",
          title: "Provedor: Personalizado",
          Icon: Server
        }
      case "groq":
      default:
        return {
          variant: "orange",
          title: "Provedor: Groq",
          Icon: Waypoints
        }
    }
  }, [aiProvider])

  return (
    <Button
      variant={providerConfig.variant}
      size="icon"
      $rounded
      onClick={aiProviderToggle}
      title={providerConfig.title}
      {...props}
    >
      <providerConfig.Icon size={16} />
    </Button>
  )
}

export default ProviderSelector
