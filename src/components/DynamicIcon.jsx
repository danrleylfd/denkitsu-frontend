import { lazy, Suspense } from "react"
import { Bot } from "lucide-react"

const iconCache = new Map()
const LucideIcons = import.meta.glob("/node_modules/lucide-react/dist/esm/icons/*.js")

const DynamicIcon = ({ name, ...props }) => {
  if (!name || !LucideIcons) return <Bot {...props} />
  const kebabCaseName = name.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase()
  const iconPath = `/node_modules/lucide-react/dist/esm/icons/${kebabCaseName}.js`
  if (!LucideIcons[iconPath]) {
    console.warn(`Ícone "${name}" (convertido para "${kebabCaseName}") não encontrado. Usando fallback.`)
    return <Bot {...props} />
  }
  if (!iconCache.has(name)) iconCache.set(name, lazy(() => LucideIcons[iconPath]()))
  const IconComponent = iconCache.get(name)
  return (
    <Suspense fallback={<div style={{ width: props.size || 24, height: props.size || 24 }} />}>
      <IconComponent {...props} />
    </Suspense>
  )
}

export default DynamicIcon
