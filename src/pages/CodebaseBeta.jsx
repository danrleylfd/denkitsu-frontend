import { useState, useCallback, memo, useEffect } from "react"
import { Upload, Copy, Download, Github, Loader2, Files, ArrowLeft, Folder, X, Edit } from "lucide-react"

import SideMenu from "../components/SideMenu"
import Paper from "../components/Paper"
import Button from "../components/Button"
import Input from "../components/Input"
import Markdown from "../components/Markdown"
import { useNotification } from "../contexts/NotificationContext"
import { useAuth } from "../contexts/AuthContext"
import api from "../services"

// --- Constantes ---
const OUTPUT_HEADER_PROJECT = "PROJETO:"
const OUTPUT_HEADER_TREE = "ESTRUTURA DE FICHEIROS:"
const OUTPUT_HEADER_CONTENT = "CONTEÚDO DOS FICHEIROS:"
const SEPARATOR = "=================================="
const RECENTS_KEY = "codebase_recents"
const MAX_RECENTS = 5
const DB_NAME = "CodebaseDB"
const STORE_NAME = "DirectoryHandles"

// --- Funções Auxiliares ---

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

const isBinaryContent = (content) => /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(content)

const IGNORED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".pdf", ".doc", ".docx", ".xls", ".xlsx",
  ".ppt", ".pptx", ".zip", ".tar", ".gz", ".rar", ".7z", ".mp3", ".mp4", ".mov", ".avi",
  ".woff", ".woff2", ".eot", ".ttf", ".otf", ".DS_Store", ".pyc", ".pyo", ".pyd", ".so",
  ".o", ".a", ".dll", ".exe"
])

const IGNORED_PATHS = new Set(["node_modules", ".git", "dist", "build", "vendor", "target", "out", "bin", "obj"])

const shouldIgnoreFile = (path) => {
  const extension = path.includes(".") ? path.substring(path.lastIndexOf(".")).toLowerCase() : ""
  if (IGNORED_EXTENSIONS.has(extension)) return true
  const pathParts = path.split("/")
  return pathParts.some(part => IGNORED_PATHS.has(part) || (part.startsWith(".") && part.length > 1))
}

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

// --- Componentes de UI ---

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
    <Input placeholder="owner/repo" value={githubRepo} onChange={onRepoChange} onKeyDown={(e) => e.key === "Enter" && onFetch()} disabled={isProcessing} />
    <Button onClick={() => onFetch()} loading={isProcessing} disabled={isProcessing || !githubRepo.trim()} $squared>
      {isProcessing ? "Buscando..." : "Buscar Repositório"}
    </Button>
  </div>
))

const RecentItemsList = memo(({ items, onClick }) => {
  if (items.length === 0) return null
  return (
    <div className="w-full mt-6 pt-4 border-t border-bLight dark:border-bDark">
      <h4 className="text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary mb-2 px-1">Recentes</h4>
      <ul className="space-y-1">
        {items.map(item => (
          <li key={item.id}>
            <button onClick={() => onClick(item)}
              className="w-full text-left flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-lightBg-tertiary dark:hover:bg-darkBg-tertiary"
              title={item.handleAvailable ? `Recarregar ${item.name}` : `Lembrar de carregar ${item.name}`}>
              {item.type === 'github' ? <Github size={16} className="text-lightFg-secondary dark:text-darkFg-secondary" /> : <Folder size={16} className="text-lightFg-secondary dark:text-darkFg-secondary" />}
              <span className="font-mono text-sm truncate text-lightFg-primary dark:text-darkFg-primary">{item.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
})

const ContentView = ({ children }) => (
  <main className="flex items-center justify-center p-4 min-h-screen w-full ml-[3.5rem] md:ml-auto">
    {children}
  </main>
)

// --- Componente Principal ---

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

  const { notifyError, notifyInfo, notifyWarning } = useNotification()
  const { user } = useAuth()

  useEffect(() => {
    setRecentItems(getRecentItems())
  }, [])

  const handleFileProcessing = useCallback((files, name, type, handleAvailable = false) => {
    setIsProcessing(true)
    setStatusText("Filtrando arquivos...")
    try {
      const filteredFiles = files
        .filter(file => file && file.path && !shouldIgnoreFile(file.path) && !isBinaryContent(file.content))
        .map(file => ({ ...file, id: file.path }))
      if (filteredFiles.length === 0) {
        notifyWarning("Nenhum arquivo de texto válido foi encontrado para processar.")
        setIsProcessing(false)
        return
      }
      filteredFiles.sort((a, b) => a.path.localeCompare(b.path))
      setAllFiles(filteredFiles)
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)))
      setProjectName(name)
      const updatedRecents = addRecentItem({ id: `${type}-${name}`, type, name, timestamp: Date.now(), handleAvailable })
      setRecentItems(updatedRecents)
      setStep("select")
    } catch (error) {
      console.error("Erro no processamento:", error)
      notifyError("Ocorreu um erro ao processar os arquivos.")
    } finally {
      setIsProcessing(false)
    }
  }, [notifyError, notifyWarning])

  const handleFetchFromGithubProxy = useCallback(async (repoNameToFetch) => {
    const repoName = (typeof repoNameToFetch === 'string' && repoNameToFetch) ? repoNameToFetch : githubRepo
    if (!repoName.trim()) {
      notifyError("Por favor, insira o nome do repositório.")
      return
    }
    if (!user?.githubId) {
      notifyError("Você precisa estar logado com o GitHub para usar esta funcionalidade.")
      return
    }

    setIsProcessing(true)
    setStatusText("Buscando e processando repositório no servidor...")
    try {
      const response = await api.get(`/github/repo-content?repo=${repoName}`)
      const { projectName: name, files } = response.data

      if (!files || files.length === 0) {
        notifyWarning("Nenhum arquivo de texto válido foi encontrado no repositório.")
        setIsProcessing(false)
        return
      }

      handleFileProcessing(files, name, 'github', false)

    } catch (error) {
      console.error("Erro ao buscar do backend:", error)
      notifyError(error.response?.data?.error || "Falha ao buscar o repositório.")
      setIsProcessing(false)
    }
  }, [githubRepo, user, notifyError, notifyWarning, handleFileProcessing])

  const handleDrop = useCallback(async (items) => {
    setIsProcessing(true)
    setStatusText("Lendo estrutura de pastas...")
    try {
      const entries = Array.from(items).map((item) => item.webkitGetAsEntry())
      const rootEntry = entries.find(e => e.isDirectory)
      if (!rootEntry) {
        notifyError("Por favor, arraste uma pasta, não arquivos individuais.")
        setIsProcessing(false)
        return
      }
      const files = []
      const traverse = async (entry, currentPath) => {
        if (entry.isFile) {
          const file = await new Promise((resolve, reject) => entry.file(resolve, reject))
          const content = await file.text()
          files.push({ path: currentPath + file.name, content })
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader()
          const dirEntries = await new Promise((resolve, reject) => dirReader.readEntries(resolve, reject))
          for (const subEntry of dirEntries) {
            await traverse(subEntry, currentPath + entry.name + "/")
          }
        }
      }
      await traverse(rootEntry, "")
      const relativeFiles = files.map(f => ({ ...f, path: f.path.substring(rootEntry.name.length + 1) }))
      handleFileProcessing(relativeFiles, rootEntry.name, 'local', false)
    } catch (error) {
      console.error("Erro no drop:", error)
      notifyError("Seu navegador não suporta a leitura de diretórios. Tente um navegador baseado em Chromium.")
      setIsProcessing(false)
    }
  }, [handleFileProcessing, notifyError])

  const handleSelectFolder = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      notifyError("Seu navegador não suporta a seleção de diretórios. Tente arrastar a pasta.")
      return
    }
    try {
      const dirHandle = await window.showDirectoryPicker()
      await setHandle(dirHandle.name, dirHandle)
      setIsProcessing(true)
      setStatusText("Lendo estrutura de pastas...")
      const files = []
      const traverseHandles = async (directoryHandle, path = "") => {
        for await (const [name, handle] of directoryHandle.entries()) {
          const newPath = path ? `${path}/${name}` : name
          if (handle.kind === "file") {
            const file = await handle.getFile()
            const content = await file.text()
            files.push({ path: newPath, content })
          } else if (handle.kind === "directory") {
            await traverseHandles(handle, newPath)
          }
        }
      }
      await traverseHandles(dirHandle)
      handleFileProcessing(files, dirHandle.name, 'local', true)
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Erro ao selecionar diretório:", error)
        notifyError("Não foi possível acessar o diretório.")
      }
      setIsProcessing(false)
    }
  }, [handleFileProcessing, notifyError])

  const handleToggleFileSelection = (fileId) => {
    setSelectedFiles(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(fileId)) newSelection.delete(fileId)
      else newSelection.add(fileId)
      return newSelection
    })
  }

  const handleGenerateCodebase = () => {
    if (selectedFiles.size === 0) {
      notifyError("Nenhum arquivo selecionado.")
      return
    }
    setIsProcessing(true)
    setStatusText("Gerando codebase...")
    const filesToInclude = allFiles.filter(file => selectedFiles.has(file.id))
    const fileTree = generateFileTree(filesToInclude.map(f => f.path), projectName)
    const outputParts = [
      `${OUTPUT_HEADER_PROJECT} ${projectName}`, SEPARATOR,
      `${OUTPUT_HEADER_TREE}\n${fileTree}\n---`,
      OUTPUT_HEADER_CONTENT, SEPARATOR,
      ...filesToInclude.map(({ path, content }) => `---[ ${path} ]---\n${processContent(content)}`)
    ]
    setResult(outputParts.join("\n\n"))
    setStep("result")
    setIsProcessing(false)
  }

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
    if (item.type === 'github') {
      setInputMethod('github')
      setGithubRepo(item.name)
      await handleFetchFromGithubProxy(item.name)
    } else if (item.type === 'local' && item.handleAvailable) {
      setIsProcessing(true)
      setStatusText(`Recarregando '${item.name}'...`)
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
            const newPath = path ? `${path}/${name}` : name
            if (entryHandle.kind === "file") {
              const file = await entryHandle.getFile()
              const content = await file.text()
              files.push({ path: newPath, content })
            } else if (entryHandle.kind === "directory") {
              await traverseHandles(entryHandle, newPath)
            }
          }
        }
        await traverseHandles(handle)
        handleFileProcessing(files, handle.name, 'local', true)
      } catch (error) {
        console.error("Erro ao carregar pasta recente:", error)
        notifyError(error.message || "Não foi possível carregar a pasta.")
        setIsProcessing(false)
      }
    } else {
      setInputMethod('local')
      notifyInfo(`A pasta '${item.name}' foi adicionada via Drag-and-Drop e não pode ser recarregada. Por favor, arraste-a novamente.`)
    }
  }, [handleFetchFromGithubProxy, handleFileProcessing, notifyInfo, notifyError])

  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
      <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />
      <Paper opaque className="w-full h-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary-base" />
            <p className="text-lg font-medium text-lightFg-primary dark:text-darkFg-primary">{statusText}</p>
          </div>
        ) : {
          "input": (
            <div className="w-full h-full flex flex-col gap-4 p-4">
              <div className="flex justify-center gap-2">
                <Button variant={inputMethod === "local" ? "primary" : "secondary"} onClick={() => setInputMethod("local")} $squared><Folder size={16} className="mr-2" /> Local</Button>
                <Button variant={inputMethod === "github" ? "primary" : "secondary"} onClick={() => setInputMethod("github")} $squared><Github size={16} className="mr-2" /> GitHub</Button>
              </div>
              <div className="flex-grow">
                {inputMethod === "local" ? <LocalInputView onDrop={handleDrop} onSelectFolder={handleSelectFolder} /> : <GithubInputView githubRepo={githubRepo} onRepoChange={handleGithubRepoChange} onFetch={handleFetchFromGithubProxy} isProcessing={isProcessing} />}
              </div>
              <RecentItemsList items={recentItems} onClick={handleRecentClick} />
            </div>
          ),
          "select": (
            <div className="flex flex-col h-full w-full gap-4">
              <h3 className="text-lg font-bold">Selecione os arquivos para incluir no codebase</h3>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => setSelectedFiles(new Set(allFiles.map(f => f.id)))} variant="outline" size="sm" $squared>Selecionar Tudo</Button>
                <Button onClick={() => setSelectedFiles(new Set())} variant="outline" size="sm" $squared>Limpar Seleção</Button>
                <div className="flex-grow" />
                <Button onClick={handleReset} variant="danger" size="sm" $squared><ArrowLeft size={16} className="mr-2" /> Voltar para Início</Button>
                <Button onClick={handleGenerateCodebase} variant="success" size="sm" $squared><Files size={16} className="mr-2" /> Gerar Codebase</Button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-md">
                <ul className="space-y-1">
                  {allFiles.map(file => (
                    <li key={file.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-lightBg-secondary/50 dark:hover:bg-darkBg-secondary/50">
                      <input type="checkbox" checked={selectedFiles.has(file.id)} onChange={() => handleToggleFileSelection(file.id)}
                        className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 bg-gray-100 text-primary-base focus:ring-2 focus:ring-primary-base dark:border-gray-600 dark:bg-darkBg-primary dark:ring-offset-gray-800" />
                      <span onClick={() => setViewingFile(file)} className="font-mono text-sm cursor-pointer truncate text-lightFg-secondary dark:text-darkFg-secondary hover:text-primary-base hover:underline" title={file.path}>
                        {file.path}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary text-center">{selectedFiles.size} de {allFiles.length} arquivos selecionados.</p>
            </div>
          ),
          "result": (
            <div className="flex flex-col h-full w-full gap-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="font-semibold text-xl">Codebase Gerada para: {projectName}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button onClick={() => { navigator.clipboard.writeText(result); notifyInfo("Copiado!") }} variant="primary" size="sm" $squared>
                    <Copy size={16} className="mr-2" /><span>Copiar Tudo</span>
                  </Button>
                  <Button onClick={() => {
                    const blob = new Blob([result], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${projectName.replace('/', '_')}_codebase.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }} variant="secondary" size="sm" $squared>
                    <Download size={16} className="mr-2" /><span>Baixar .txt</span>
                  </Button>
                  <Button onClick={() => setStep("select")} variant="secondary" size="sm" $squared>
                    <Edit size={16} className="mr-2" /><span>Voltar para Seleção</span>
                  </Button>
                  <Button onClick={handleReset} variant="danger" size="sm" $squared>
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
