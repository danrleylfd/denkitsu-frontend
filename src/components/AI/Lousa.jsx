import { memo } from "react"
import { Sandpack } from "@codesandbox/sandpack-react"
// import "@codesandbox/sandpack-react/dist/style.css"
import { X } from "lucide-react"

import { useTheme } from "../../contexts/ThemeContext"

import Button from "../Button"

const Lousa = ({ canvas = false, content, toggleLousa }) => {
  if (!content) return null
  const { theme } = useTheme()
  let files = {}
  let customSetup = {}
  if (canvas) {
    try {
      const parsedContent = JSON.parse(content)
      const { dependencies, ...fileEntries } = parsedContent
      files = fileEntries
      if (dependencies) {
        customSetup = { dependencies }
      }
    } catch (error) {
      console.error("Erro ao parsear o conteúdo da Lousa:", error)
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-red-500 bg-darkBg-secondary p-4 rounded-lg">
            Erro: A IA não retornou um formato de ficheiro JSON válido.
            <Button variant="secondary" onClick={() => toggleLousa()}>Fechar</Button>
          </div>
        </div>
      )
    }
  }
  console.log("canvas", canvas)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative flex w-[90%] h-[95%] flex-col rounded-lg bg-white shadow-2xl dark:bg-darkBg-primary">
        <div className="flex items-center justify-between rounded-t-lg bg-lightBg-secondary p-2 dark:bg-darkBg-secondary">
          <h3 className="font-bold text-lightFg-primary dark:text-darkFg-primary">Lousa</h3>
          <Button variant="danger" size="icon" $rounded onClick={() => toggleLousa()}><X size={16} /></Button>
        </div>
        {!canvas && <iframe srcDoc={content} title="Lousa" sandbox="allow-scripts allow-same-origin" className="w-full h-full flex-1 rounded-b-lg border-none outline-none m-0 p-0 box-border" />}
        {canvas && (
          <div className="w-full h-full flex-1">
            <Sandpack
              template="react"
              theme={theme}
              files={files}
              customSetup={customSetup}
              options={{
                showNavigator: true,
                showLineNumbers: true,
                showInlineErrors: true,
                showTabs: true,
                showConsoleButton: true,
                showRefreshButton: true,
                showConsole: true,
                editorHeight: "100%",
                layout: "preview"
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(Lousa)
