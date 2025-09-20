import React, { useState, useEffect, memo } from "react"
import { ArrowLeft, Files, Folder, FileText, ChevronRight, Edit } from "lucide-react"
import Button from "../Button"

const FileExplorer = memo(({ fileTree, allFiles, selectedFiles, setSelectedFiles, onGenerate, onBack, onViewFile }) => {
  const [currentPath, setCurrentPath] = useState("")
  const [currentNodes, setCurrentNodes] = useState(fileTree)

  useEffect(() => {
    let nodes = fileTree
    if (currentPath) {
      const pathParts = currentPath.split("/")
      for (const part of pathParts) {
        const nextNode = nodes.find(n => n.name === part && n.type === "folder")
        if (nextNode) {
          nodes = nextNode.children
        } else {
          nodes = []
          break
        }
      }
    }
    setCurrentNodes(nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name)
      return a.type === "folder" ? -1 : 1
    }))
  }, [currentPath, fileTree])

  const getAllFilePathsFromNode = (node) => {
    let paths = []
    if (node.type === "file") {
      paths.push(node.path)
    } else if (node.type === "folder") {
      node.children.forEach(child => {
        paths = paths.concat(getAllFilePathsFromNode(child))
      })
    }
    return paths
  }

  const getFolderSelectionState = (folderNode) => {
    const allChildPaths = getAllFilePathsFromNode(folderNode)
    if (allChildPaths.length === 0) return "none"
    const selectedChildPaths = allChildPaths.filter(p => selectedFiles.has(p))
    if (selectedChildPaths.length === 0) return "none"
    if (selectedChildPaths.length === allChildPaths.length) return "all"
    return "some"
  }

  const handleToggleFolder = (folderNode) => {
    const allChildPaths = getAllFilePathsFromNode(folderNode)
    const currentState = getFolderSelectionState(folderNode)
    const newSelectedFiles = new Set(selectedFiles)
    if (currentState === "all") {
      allChildPaths.forEach(p => newSelectedFiles.delete(p))
    } else {
      allChildPaths.forEach(p => newSelectedFiles.add(p))
    }
    setSelectedFiles(newSelectedFiles)
  }

  const handleToggleFile = (filePath) => {
    const newSelectedFiles = new Set(selectedFiles)
    if (newSelectedFiles.has(filePath)) {
      newSelectedFiles.delete(filePath)
    } else {
      newSelectedFiles.add(filePath)
    }
    setSelectedFiles(newSelectedFiles)
  }

  const navigateTo = (path) => {
    setCurrentPath(path)
  }

  const breadcrumbs = ["Projeto", ...currentPath.split("/")].filter(Boolean)

  return (
    <div className="flex flex-col h-full w-full gap-2 p-4">
      <div className="flex items-center text-sm text-lightFg-secondary dark:text-darkFg-secondary">
        {breadcrumbs.map((crumb, index) => {
          const path = breadcrumbs.slice(1, index + 1).join("/")
          return (
            <React.Fragment key={path}>
              <button onClick={() => navigateTo(path)} className="hover:underline hover:text-primary-base">
                {crumb === "Projeto" ? <Folder size={16} className="inline-block mr-1" /> : crumb}
              </button>
              {index < breadcrumbs.length - 1 && <ChevronRight size={16} className="mx-1" />}
            </React.Fragment>
          )
        })}
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" $rounded onClick={() => setSelectedFiles(new Set(allFiles.map(f => f.path)))}>Selecionar Tudo</Button>
        <Button variant="secondary" $rounded onClick={() => setSelectedFiles(new Set())}>Limpar Seleção</Button>
        <div className="flex-grow" />
        <Button variant="secondary" $rounded onClick={onBack}><ArrowLeft size={16} className="mr-2" /> Voltar</Button>
        <Button variant="primary" $rounded onClick={onGenerate}><Files size={16} className="mr-2" /> Extrair Codebase</Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-md">
        <ul className="space-y-1">
          {currentNodes.map(node => {
            if (node.type === "folder") {
              const selectionState = getFolderSelectionState(node)
              return (
                <li key={node.path} className="flex items-center gap-3 p-2 rounded-md hover:bg-lightBg-secondary/50 dark:hover:bg-darkBg-secondary/50">
                  <input type="checkbox"
                    checked={selectionState === "all"}
                    ref={el => el && (el.indeterminate = selectionState === "some")}
                    onChange={() => handleToggleFolder(node)}
                    className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 bg-gray-100 text-primary-base focus:ring-2 focus:ring-primary-base dark:border-gray-600 dark:bg-darkBg-primary dark:ring-offset-gray-800"
                  />
                  <button onClick={() => navigateTo(node.path)} className="flex items-center gap-2 text-left flex-grow">
                    <Folder size={16} className="text-yellow-500" />
                    <span className="font-mono text-sm">{node.name}</span>
                  </button>
                </li>
              )
            }
            return (
              <li key={node.path} className="flex items-center gap-3 p-2 rounded-md hover:bg-lightBg-secondary/50 dark:hover:bg-darkBg-secondary/50">
                <input type="checkbox" checked={selectedFiles.has(node.path)} onChange={() => handleToggleFile(node.path)}
                  className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 bg-gray-100 text-primary-base focus:ring-2 focus:ring-primary-base dark:border-gray-600 dark:bg-darkBg-primary dark:ring-offset-gray-800"
                />
                <button onClick={() => onViewFile(node)} className="flex items-center gap-2 text-left flex-grow">
                  <FileText size={16} className="text-lightFg-secondary dark:text-darkFg-secondary" />
                  <span className="font-mono text-sm">{node.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary text-center">{selectedFiles.size} de {allFiles.length} arquivos selecionados.</p>
    </div>
  )
})

export default FileExplorer
