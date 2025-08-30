import * as Icons from "lucide-react"

const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = Icons[name]
  if (!IconComponent) return <Icons.Bot {...props} />
  return <IconComponent {...props} />
}

export default DynamicIcon
