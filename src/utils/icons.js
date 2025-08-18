import * as Icons from "lucide-react"

const excludedKeys = [
  "createLucideIcon",
  "icons",
  "lucide-react",
  "IconNode",
  "default"
]

export const iconNames = Object.keys(Icons).filter(key =>
  !excludedKeys.includes(key) &&
  !key.startsWith("Lucide") &&
  !key.endsWith("Icon")
).sort()
