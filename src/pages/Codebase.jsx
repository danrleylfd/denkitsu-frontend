import React, { useState, useCallback, memo, useEffect } from "react"
import { Upload, Copy, Download, Github, Loader2, Files, ArrowLeft, Folder, X, Edit, Trash2, FileText, ChevronRight } from "lucide-react"

import SideMenu from "../components/SideMenu"
import Paper from "../components/Paper"
import Button from "../components/Button"
import Input from "../components/Input"
import Markdown from "../components/Markdown"
import { useNotification } from "../contexts/NotificationContext"
import { useAuth } from "../contexts/AuthContext"
import api from "../services"

const RECENTS_KEY = "codebase_recents"
const MAX_RECENTS = 3
const DB_NAME = "CodebaseDB"
const STORE_NAME = "DirectoryHandles"

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject("Erro ao abrir IndexedDB.")
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

const setHandle = async (key, handle) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(handle, key)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject("Falha ao salvar o handle do diretório.")
  })
}

const getHandle = async (key) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject("Falha ao buscar o handle do diretório.")
  })
}

const deleteHandle = async (key) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(key)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject("Falha ao remover o handle do diretório.")
  })
}

const getRecentItems = () => {
  try {
    const items = localStorage.getItem(RECENTS_KEY)
    return items ? JSON.parse(items) : []
  } catch (error) {
    console.error("Falha ao ler itens recentes do localStorage", error)
    return []
  }
}

const addRecentItem = (newItem) => {
  let items = getRecentItems()
  items = items.filter(item => item.id !== newItem.id)
  items.unshift(newItem)
  items.splice(MAX_RECENTS)
  localStorage.setItem(RECENTS_KEY, JSON.stringify(items))
  return items
}

const removeRecentItem = (itemId) => {
  let items = getRecentItems()
  items = items.filter(item => item.id !== itemId)
  localStorage.setItem(RECENTS_KEY, JSON.stringify(items))
  return items
}

const clearRecentItems = () => {
  localStorage.removeItem(RECENTS_KEY)
  return []
}

const isBinaryContent = (content) => /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(content)

const IGNORED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".svg", ".webp",
  ".mp3", ".mp4", ".mov", ".avi", ".webm", ".mkv",
  ".woff", ".woff2", ".eot", ".ttf", ".otf",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".zip", ".tar", ".gz", ".rar", ".7z",
  ".pyc", ".pyo", ".pyd", ".so", ".o", ".a", ".dll", ".exe",
  ".class", ".jar", ".war", ".ear", ".out",
  ".log", ".tmp", ".swp", ".swo",
  ".apk", ".aab",
])

const IGNORED_PATHS = new Set([
  "node_modules", "vendor", "Pods",
  "dist", "build", "target", "out", "bin", "obj",
  "__pycache__", ".gradle", ".next", ".nuxt", ".svelte-kit",
  "coverage", ".pytest_cache", ".cache",
  ".git", ".vscode", ".vercel", ".cursor", ".trae", ".idea", "tmp",
  ".venv", "venv", "env",
])

const IGNORED_FILENAMES = new Set([
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "composer.lock", "gemfile.lock",
  "license", "license.md", "license.txt", "copying", "copying.md", "copying.txt",
  "vercel.json", "netlify.toml",
  ".ds_store", "thumbs.db",
  ".env", ".env.local", ".env.development", ".env.production"
])

const shouldIgnoreFile = (path) => {
  const pathParts = path.split("/")
  const filename = pathParts[pathParts.length - 1].toLowerCase()

  if (IGNORED_FILENAMES.has(filename)) return true
  if (pathParts.some(part => IGNORED_PATHS.has(part))) return true

  const extension = filename.includes(".") ? filename.substring(filename.lastIndexOf(".")) : ""
  if (IGNORED_EXTENSIONS.has(extension)) return true

  if (pathParts.some(part => part.startsWith(".") && part.length > 1 && !IGNORED_PATHS.has(part))) {
    return true
  }

  return false
}

const buildFileTree = (files) => {
  const root = { name: "root", type: "folder", path: "", children: [] }
  const nodeMap = { "": root }

  files.forEach(file => {
    const parts = file.path.split("/")
    let currentLevel = root.children
    let currentPath = ""

    parts.forEach((part, index) => {
      const isLastPart = index === parts.length - 1
      currentPath = currentPath ? `${currentPath}/${part}` : part

      let node = nodeMap[currentPath]

      if (!node) {
        if (isLastPart) {
          node = { name: part, type: "file", path: file.path, content: file.content }
          currentLevel.push(node)
        } else {
          node = { name: part, type: "folder", path: currentPath, children: [] }
          currentLevel.push(node)
        }
        nodeMap[currentPath] = node
      }
      if (node.type === "folder") {
        currentLevel = node.children
      }
    })
  })
  return root.children
}

const FileViewer = memo(({ file, onClose }) => {
  if (!file) return null
  const getLanguage = (path) => {
    const extension = path.split(".").pop()
    if (["js", "jsx", "ts", "tsx"].includes(extension)) return "javascript"
    return extension
  }
  const markdownContent = "```" + `${getLanguage(file.path)}\n${file.content}` + "\n```"
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative flex flex-col w-full max-w-4xl h-[80vh] rounded-lg bg-lightBg-secondary dark:bg-darkBg-secondary shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-2 pl-4 border-b border-bLight dark:border-bDark flex-shrink-0">
          <h3 className="font-mono font-bold text-lightFg-primary dark:text-darkFg-primary">{file.path}</h3>
          <Button variant="danger" size="icon" $rounded onClick={onClose}><X size={16} /></Button>
        </div>
        <div className="flex-1 overflow-auto p-4"><Markdown content={markdownContent} /></div>
      </div>
    </div>
  )
})

const LocalInputView = memo(({ onDrop, onSelectFolder }) => {
  const [isDragging, setIsDragging] = useState(false)
  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }, [])
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
    if (e.dataTransfer.items) onDrop(e.dataTransfer.items)
  }, [onDrop])
  return (
    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={onSelectFolder}
      className={`flex flex-col items-center justify-center text-center transition-all duration-300 p-8 h-full rounded-lg cursor-pointer
                  border-2 border-dashed ${isDragging ? "border-primary-base bg-primary-base/10" : "border-bLight dark:border-bDark hover:border-primary-light"}`} >
      <Upload className={`w-12 h-12 transition-transform ${isDragging ? "text-primary-base scale-110" : "text-lightFg-secondary dark:text-darkFg-secondary"}`} />
      <p className={`text-xl font-semibold mt-6 transition-colors ${isDragging ? "text-primary-base" : "text-lightFg-primary dark:text-darkFg-primary"}`}>
        {isDragging ? "Pode soltar a pasta!" : "Arraste uma pasta ou clique para selecionar"}
      </p>
      <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary mt-2">Pastas selecionadas por clique podem ser recarregadas rapidamente.</p>
    </div>
  )
})

const GithubInputView = memo(({ githubRepo, onRepoChange, onFetch, isProcessing }) => (
  <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
    <Github size={48} className="text-lightFg-secondary dark:text-darkFg-secondary" />
    <p className="text-xl font-semibold text-lightFg-primary dark:text-darkFg-primary">Extrair de um Repositório Público</p>
    <Input placeholder="owner/repo" value={githubRepo} onChange={onRepoChange} onKeyDown={(e) => e.key === "Enter" && onFetch()} disabled={isProcessing}>
      <Button variant="outline" $rounded onClick={() => onFetch()} loading={isProcessing} disabled={isProcessing || !githubRepo.trim()}>
        {isProcessing ? "Buscando..." : "Buscar"}
      </Button>
    </Input>
  </div>
))

const RecentItemsList = memo(({ items, onClick, onRemove, onClearAll }) => {
  if (items.length === 0) return null
  return (
    <div className="w-full mt-6 pt-4 border-t border-bLight dark:border-bDark">
      <div className="flex justify-between items-center mb-2 px-1">
        <h4 className="text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">Recentes</h4>
        <Button variant="danger" $rounded onClick={onClearAll}>Limpar Histórico</Button>
      </div>
      <ul className="space-y-1">
        {items.map(item => (
          <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-lightBg-tertiary dark:hover:bg-darkBg-tertiary group">
            <button onClick={() => onClick(item)} className="flex items-center gap-3 text-left flex-grow truncate" title={item.handleAvailable ? `Recarregar ${item.name}` : `Lembrar de carregar ${item.name}`}>
              {item.type === "github" ? <Github size={16} className="text-lightFg-secondary dark:text-darkFg-secondary" /> : <Folder size={16} className="text-lightFg-secondary dark:text-darkFg-secondary" />}
              <span className="font-mono text-sm truncate text-lightFg-primary dark:text-darkFg-primary">{item.name}</span>
            </button>
            <Button
              variant="danger" size="icon" $rounded
              onClick={(e) => { e.stopPropagation(); onRemove(item) }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title={`Remover ${item.name}`}>
              <Trash2 size={14} />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
})

const ContentView = ({ children }) => (
  <main className="flex items-center justify-center p-4 min-h-dvh w-full ml-[3.5rem] md:ml-auto">
    {children}
  </main>
)

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
        <div className="flex flex-col h-full w-full gap-4">
            <div className="flex items-center text-sm text-lightFg-secondary dark:text-darkFg-secondary">
                {breadcrumbs.map((crumb, index) => {
                    const path = breadcrumbs.slice(1, index + 1).join("/")
                    return (
                        <React.Fragment key={path}>
                            <button onClick={() => navigateTo(path)} className="hover:underline hover:text-primary-base">
                                {crumb === "Projeto" ? <Folder size={16} className="inline-block mr-1"/> : crumb}
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
                <Button variant="outline" $rounded onClick={onGenerate}><Files size={16} className="mr-2" /> Extrair Codebase</Button>
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
                                        <Folder size={16} className="text-yellow-500"/>
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
                                    <FileText size={16} className="text-lightFg-secondary dark:text-darkFg-secondary"/>
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

const Codebase = () => {
  const [step, setStep] = useState("input")
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusText, setStatusText] = useState("")
  const [allFiles, setAllFiles] = useState([])
  const [selectedFiles, setSelectedFiles] = useState(new Set())
  const [result, setResult] = useState("")
  const [githubRepo, setGithubRepo] = useState("")
  const [projectName, setProjectName] = useState("")
  const [inputMethod, setInputMethod] = useState("local")
  const [viewingFile, setViewingFile] = useState(null)
  const [recentItems, setRecentItems] = useState([])
  const [projectSource, setProjectSource] = useState(null)
  const [fileTree, setFileTree] = useState([])

  const { notifyError, notifyInfo, notifyWarning } = useNotification()
  const { user } = useAuth()

  useEffect(() => {
    setRecentItems(getRecentItems())
  }, [])

  const handleFileProcessing = useCallback((files, name, type, handleAvailable = false) => {
    const tree = buildFileTree(files)
    setFileTree(tree)
    setAllFiles(files)
    setSelectedFiles(new Set(files.map(f => f.path)))
    setProjectName(name)
    setProjectSource(type)
    const updatedRecents = addRecentItem({ id: `${type}-${name}`, type, name, timestamp: Date.now(), handleAvailable })
    setRecentItems(updatedRecents)
    setStep("select")
  }, [])

  const handleFetchFromGithubProxy = useCallback(async (repoNameToFetch) => {
    const repoName = (typeof repoNameToFetch === "string" && repoNameToFetch) ? repoNameToFetch : githubRepo
    if (!repoName.trim()) {
      notifyError("Por favor, insira o nome do repositório.")
      return
    }
    if (!user?.githubId) {
      notifyError("Você precisa estar logado com o GitHub para usar esta funcionalidade.")
      return
    }
    setIsProcessing(true)
    setStatusText("Buscando arquivos do repositório...")
    try {
      const response = await api.get(`/github/repo-files?repo=${repoName}`)
      const { projectName: name, files } = response.data
      if (!files || files.length === 0) {
        notifyWarning("Nenhum arquivo de texto válido foi encontrado no repositório.")
        return
      }
      handleFileProcessing(files, name, "github", false)
    } catch (error) {
      console.error("Erro ao buscar do backend:", error)
      notifyError(error.response?.data?.error || "Falha ao buscar o repositório.")
    } finally {
      setIsProcessing(false)
    }
  }, [githubRepo, user, handleFileProcessing])

  const handleDrop = useCallback(async (items) => {
    setIsProcessing(true)
    setStatusText("Lendo estrutura de pastas...")
    try {
      const entries = Array.from(items).map((item) => item.webkitGetAsEntry())
      const rootEntry = entries.find(e => e.isDirectory)
      if (!rootEntry) {
        notifyError("Por favor, arraste uma pasta, não arquivos individuais.")
        return
      }
      const files = []
      const traverse = async (entry, currentPath) => {
        if (entry.isFile) {
          const file = await new Promise((resolve, reject) => entry.file(resolve, reject))
          if (shouldIgnoreFile(file.name)) return
          const content = await file.text()
          if (!isBinaryContent(content)) {
            files.push({ path: currentPath + file.name, content })
          }
        } else if (entry.isDirectory) {
          if (shouldIgnoreFile(entry.name)) return
          const dirReader = entry.createReader()
          const dirEntries = await new Promise((resolve, reject) => dirReader.readEntries(resolve, reject))
          for (const subEntry of dirEntries) {
            await traverse(subEntry, currentPath + entry.name + "/")
          }
        }
      }
      await traverse(rootEntry, "")
      const relativeFiles = files.map(f => ({ ...f, path: f.path.substring(rootEntry.name.length + 1) }))
      handleFileProcessing(relativeFiles, rootEntry.name, "local", false)
    } catch (error) {
      console.error("Erro no drop:", error)
      notifyError("Seu navegador não suporta a leitura de diretórios. Tente um navegador baseado em Chromium.")
    } finally {
        setIsProcessing(false)
    }
  }, [handleFileProcessing, notifyError])

  const handleSelectFolder = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      notifyError("Seu navegador não suporta a seleção de diretórios. Tente arrastar a pasta.")
      return
    }
    setIsProcessing(true)
    setStatusText("Lendo estrutura de pastas...")
    try {
      const dirHandle = await window.showDirectoryPicker()
      await setHandle(dirHandle.name, dirHandle)
      const files = []
      const traverseHandles = async (directoryHandle, path = "") => {
        for await (const [name, handle] of directoryHandle.entries()) {
          if (shouldIgnoreFile(name)) continue
          const newPath = path ? `${path}/${name}` : name
          if (handle.kind === "file") {
            const file = await handle.getFile()
            const content = await file.text()
            if (!isBinaryContent(content)) {
                files.push({ path: newPath, content })
            }
          } else if (handle.kind === "directory") {
            await traverseHandles(handle, newPath)
          }
        }
      }
      await traverseHandles(dirHandle)
      handleFileProcessing(files, dirHandle.name, "local", true)
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Erro ao selecionar diretório:", error)
        notifyError("Não foi possível acessar o diretório.")
      }
    } finally {
      setIsProcessing(false)
    }
  }, [handleFileProcessing, notifyError])

  const handleGenerateCodebase = useCallback(async () => {
    if (selectedFiles.size === 0) {
      notifyError("Nenhum arquivo selecionado.")
      return
    }
    setIsProcessing(true)
    setStatusText("Gerando codebase...")
    const filesToInclude = allFiles.filter(file => selectedFiles.has(file.path))
    try {
      let codebaseString = ""
      const processContent = (content) => content.replace(/(\r\n|\n|\r){3,}/g, "$1$1").trim()
      const generateFileTree = (filePaths, rootName) => {
        const tree = {}
        filePaths.forEach((path) => {
          let level = tree
          path.split("/").forEach((part) => {
            if (!part) return
            if (!level[part]) level[part] = {}
            level = level[part]
          })
        })
        const buildTreeString = (dir, prefix = "") => {
          const entries = Object.keys(dir).sort()
          let result = ""
          entries.forEach((entry, index) => {
            const isLast = index === entries.length - 1
            const connector = isLast ? "└── " : "├── "
            result += `${prefix}${connector}${entry}\n`
            if (Object.keys(dir[entry]).length > 0) {
              const newPrefix = prefix + (isLast ? "    " : "│   ")
              result += buildTreeString(dir[entry], newPrefix)
            }
          })
          return result
        }
        return `${rootName}/\n${buildTreeString(tree)}`
      }

      if (projectSource === "github") {
        const payload = { projectName, selectedFiles: filesToInclude }
        const response = await api.post("/github/generate-codebase", payload, { responseType: "text" })
        codebaseString = response.data
      } else {
        const fileTreeString = generateFileTree(filesToInclude.map(f => f.path), projectName)
        const outputParts = [
          `PROJETO: ${projectName}`, "---",
          `ESTRUTURA DE FICHEIROS:\n${fileTreeString}\n---`,
          "CONTEÚDO DOS FICHEIROS:", "---",
          ...filesToInclude.map(({ path, content }) => `---[ ${path} ]---\n${processContent(content)}`)
        ]
        codebaseString = outputParts.join("\n\n")
      }
      setResult(codebaseString)
      setStep("result")
    } catch (error) {
        console.error("Erro ao gerar codebase:", error)
        notifyError(error.response?.data?.error || "Falha ao gerar o codebase.")
    } finally {
        setIsProcessing(false)
    }
  }, [allFiles, selectedFiles, projectName, projectSource, notifyError])

  const handleReset = () => {
    setStep("input")
    setResult("")
    setAllFiles([])
    setSelectedFiles(new Set())
    setGithubRepo("")
    setProjectName("")
    setViewingFile(null)
  }

  const handleGithubRepoChange = useCallback((e) => {
    setGithubRepo(e.target.value)
  }, [])

  const handleRecentClick = useCallback(async (item) => {
    if (item.type === "github") {
      setInputMethod("github")
      setGithubRepo(item.name)
      await handleFetchFromGithubProxy(item.name)
    } else if (item.type === "local" && item.handleAvailable) {
      setIsProcessing(true)
      setStatusText(`Recarregando "${item.name}"...`)
      try {
        const handle = await getHandle(item.name)
        if (!handle) throw new Error("A referência para a pasta foi perdida. Por favor, selecione-a novamente.")
        if ((await handle.queryPermission({ mode: "read" })) !== "granted") {
          if ((await handle.requestPermission({ mode: "read" })) !== "granted") {
            throw new Error("Permissão para acessar a pasta foi negada.")
          }
        }
        const files = []
        const traverseHandles = async (directoryHandle, path = "") => {
          for await (const [name, entryHandle] of directoryHandle.entries()) {
            if (shouldIgnoreFile(name)) continue
            const newPath = path ? `${path}/${name}` : name
            if (entryHandle.kind === "file") {
              const file = await entryHandle.getFile()
              const content = await file.text()
              if (!isBinaryContent(content)) {
                  files.push({ path: newPath, content })
              }
            } else if (entryHandle.kind === "directory") {
              await traverseHandles(entryHandle, newPath)
            }
          }
        }
        await traverseHandles(handle)
        handleFileProcessing(files, handle.name, "local", true)
      } catch (error) {
        console.error("Erro ao carregar pasta recente:", error)
        notifyError(error.message || "Não foi possível carregar a pasta.")
      } finally {
        setIsProcessing(false)
      }
    } else {
      setInputMethod("local")
      notifyInfo(`A pasta "${item.name}" foi adicionada via Drag-and-Drop e não pode ser recarregada. Por favor, arraste-a novamente.`)
    }
  }, [handleFetchFromGithubProxy, handleFileProcessing, notifyInfo, notifyError])

  const handleRemoveRecent = useCallback(async (item) => {
    try {
      if (item.type === "local" && item.handleAvailable) {
        await deleteHandle(item.name)
      }
      const updatedItems = removeRecentItem(item.id)
      setRecentItems(updatedItems)
      notifyInfo(`"${item.name}" removido do histórico.`)
    } catch (error) {
      console.error("Erro ao remover item recente:", error)
      notifyError("Não foi possível remover o item do banco de dados.")
    }
  }, [notifyInfo, notifyError])

  const handleClearRecents = useCallback(async () => {
    if (window.confirm("Tem certeza que deseja limpar todo o histórico de projetos recentes?")) {
        try {
            const itemsToClear = getRecentItems()
            for (const item of itemsToClear) {
                if (item.type === "local" && item.handleAvailable) {
                    await deleteHandle(item.name)
                }
            }
            const updatedItems = clearRecentItems()
            setRecentItems(updatedItems)
            notifyInfo("Histórico limpo com sucesso.")
        } catch (error) {
            console.error("Erro ao limpar histórico:", error)
            notifyError("Não foi possível limpar completamente o histórico do banco de dados.")
        }
    }
  }, [notifyInfo, notifyError])

  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
      <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />
      <Paper className="w-full h-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary-base" />
            <p className="text-lg font-medium text-lightFg-primary dark:text-darkFg-primary">{statusText}</p>
          </div>
        ) : {
          "input": (
            <div className="w-full h-full flex flex-col gap-4 p-4">
              <div className="flex justify-center gap-2">
                <Button variant={inputMethod === "local" ? "primary" : "secondary"} $squared onClick={() => setInputMethod("local")}><Folder size={16} className="mr-2" /> Local</Button>
                <Button variant={inputMethod === "github" ? "primary" : "secondary"} $squared onClick={() => setInputMethod("github")}><Github size={16} className="mr-2" /> GitHub</Button>
              </div>
              <div className="flex-grow">
                {inputMethod === "local" ? <LocalInputView onDrop={handleDrop} onSelectFolder={handleSelectFolder} /> : <GithubInputView githubRepo={githubRepo} onRepoChange={handleGithubRepoChange} onFetch={handleFetchFromGithubProxy} isProcessing={isProcessing} />}
              </div>
              <RecentItemsList items={recentItems} onClick={handleRecentClick} onRemove={handleRemoveRecent} onClearAll={handleClearRecents} />
            </div>
          ),
          "select": (
            <FileExplorer
                fileTree={fileTree}
                allFiles={allFiles}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                onGenerate={handleGenerateCodebase}
                onBack={() => setStep("input")}
                onViewFile={setViewingFile}
            />
          ),
          "result": (
            <div className="flex flex-col h-full w-full gap-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="font-semibold text-xl">Codebase extraída de: {projectName}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="primary" $rounded onClick={() => { navigator.clipboard.writeText(result); notifyInfo("Copiado!") }}>
                    <Copy size={16} className="mr-2" /><span>Copiar Tudo</span>
                  </Button>
                  <Button variant="secondary" $rounded onClick={() => {
                    const blob = new Blob([result], { type: "text/plain" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `${projectName.replace("/", "_")}_codebase.txt`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}>
                    <Download size={16} className="mr-2" /><span>Baixar .txt</span>
                  </Button>
                  <Button variant="secondary" $rounded onClick={() => setStep("select")}>
                    <Edit size={16} className="mr-2" /><span>Voltar para Seleção</span>
                  </Button>
                  <Button variant="outline" $rounded onClick={handleReset}>
                    <Folder size={16} className="mr-2" /><span>Começar de Novo</span>
                  </Button>
                </div>
              </div>
              <textarea value={result} readOnly className="w-full flex-grow p-4 font-mono text-sm bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-md focus:ring-0 resize-none border-none" />
            </div>
          )
        }[step]}
      </Paper>
    </SideMenu>
  )
}

export default Codebase
