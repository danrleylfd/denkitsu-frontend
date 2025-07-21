import { memo } from "react"
import { Sandpack } from "@codesandbox/sandpack-react"
// import "@codesandbox/sandpack-react/dist/style.css"
import { X } from "lucide-react"

import { useTheme } from "../../contexts/ThemeContext"

import Button from "../Button"

const Lousa = ({ content, toggleLousa }) => {
  if (!content) return null
  const { theme } = useTheme()
  let files = {}
  let customSetup = {}
  try {
    // O 'content' agora é uma string JSON vinda da IA
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative flex w-[75%] h-[95%] flex-col rounded-lg bg-white shadow-2xl dark:bg-darkBg-primary">
        <div className="flex items-center justify-between rounded-t-lg bg-lightBg-secondary p-2 dark:bg-darkBg-secondary">
          <h3 className="font-bold text-lightFg-primary dark:text-darkFg-primary">Lousa</h3>
          <Button variant="danger" size="icon" $rounded onClick={() => toggleLousa()}><X size={16} /></Button>
        </div>
        {/* <iframe srcDoc={content} title="Lousa" sandbox="allow-scripts allow-same-origin" className="w-full h-full flex-1 rounded-b-lg border-none outline-none m-0 p-0 box-border" /> */}
        <div className="w-full h-full flex-1">
          <Sandpack
            template="react"
            theme={theme}
            files={files}
            customSetup={customSetup}
            options={{
              showLineNumbers: true,
              showTabs: true,
              editorHeight: "100%",
              layout: "responsive"
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default memo(Lousa)
