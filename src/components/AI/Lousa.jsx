import { memo } from "react"
import { Sandpack } from "@codesandbox/sandpack-react"
// import "@codesandbox/sandpack-react/dist/style.css"
import { X } from "lucide-react"

import { useTheme } from "../../contexts/ThemeContext"

import Button from "../Button"

const reactBoilerplate = {
  "/App.js": `export default function App() {
  return <h1>Projeto React Vazio</h1>
}`,
  "/index.js": `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
  "/styles.css": `body {
  font-family: sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f9fa;
  margin: 0;
  padding: 20px;
}

#root {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}`,
  "/public/index.html": `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
  "/package.json": `{
  "dependencies": {
    "react": "18.x",
    "react-dom": "18.x",
    "react-scripts": "5.x"
  }
}`
}

const Lousa = ({ content, toggleLousa }) => {
  if (!content) return null
  const { theme } = useTheme()
  let finalFiles = {}
  let customSetup = {}

  try {
    const aiFiles = JSON.parse(content)
    const { dependencies, ...fileEntries } = aiFiles

    // Lógica principal: Mesclamos o boilerplate com os arquivos da IA.
    // Os arquivos da IA (fileEntries) sobrescrevem os do boilerplate se tiverem o mesmo nome.
    finalFiles = { ...reactBoilerplate, ...fileEntries }

    if (dependencies) {
      // Se a IA especificar dependências, nós as adicionamos.
      const packageJson = JSON.parse(finalFiles["/package.json"])
      packageJson.dependencies = { ...packageJson.dependencies, ...dependencies }
      finalFiles["/package.json"] = JSON.stringify(packageJson, null, 2)
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
      <div className="relative flex w-[90%] h-[90%] flex-col rounded-lg bg-white shadow-2xl dark:bg-darkBg-primary overflow-hidden">
        <div className="flex items-center justify-between rounded-t-lg bg-lightBg-secondary p-2 dark:bg-darkBg-secondary flex-shrink-0">
          <h3 className="font-bold text-lightFg-primary dark:text-darkFg-primary">Lousa Interativa React</h3>
          <Button variant="danger" size="icon" $rounded onClick={() => toggleLousa()}><X size={16} /></Button>
        </div>
        <div className="w-full h-full flex-1">
          <Sandpack
            template="react"
            theme={theme}
            files={finalFiles}
            customSetup={customSetup}
            options={{
              showLineNumbers: true,
              showTabs: true,
              activeFile: "/App.js",
              // editorHeight: "100%",
              layout: "responsive"
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default memo(Lousa)
