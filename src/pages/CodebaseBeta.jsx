import { useState, useCallback } from "react"
import { Upload, Copy, Download, Github, Loader2, FileText, CopyCheck, ArrowLeft, Folder, Files } from "lucide-react"

import SideMenu from "../components/SideMenu"
import Paper from "../components/Paper"
import Button from "../components/Button"
import Input from "../components/Input"
import { useNotification } from "../contexts/NotificationContext"

// A simplified function to detect binary content
const isBinaryContent = (content) => {
  return /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(content)
}

// A simple list of extensions to ignore by default
const IGNORED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".pdf", ".doc", ".docx", ".xls", ".xlsx",
  ".ppt", ".pptx", ".zip", ".tar", ".gz", ".rar", ".7z", ".mp3", ".mp4", ".mov", ".avi",
  ".woff", ".woff2", ".eot", ".ttf", ".otf", ".DS_Store", ".pyc", ".pyo", ".pyd", ".so",
  ".o", ".a", ".dll", ".exe"
])

const IGNORED_PATHS = new Set([
  "node_modules", ".git", "dist", "build", "vendor", "target", "out", "bin", "obj"
])

// Check if a file should be ignored based on extension or path segments
const shouldIgnoreFile = (path) => {
  const extension = path.includes(".") ? path.substring(path.lastIndexOf(".")).toLowerCase() : ""
  if (IGNORED_EXTENSIONS.has(extension)) {
    return true
  }
  const pathParts = path.split("/")
  if (pathParts.some(part => IGNORED_PATHS.has(part) || (part.startsWith(".") && part.length > 1))) {
    return true
  }
  return false
}


const processContent = (content) => {
  return content.replace(/(\r\n|\n|\r){3,}/g, "$1$1").trim()
}

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

const Codebase = () => {
  const [step, setStep] = useState("input") // 'input', 'select', 'result'
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusText, setStatusText] = useState("")
  const [allFiles, setAllFiles] = useState([]) // { path: string, content: string }[]
  const [selectedFiles, setSelectedFiles] = useState(new Set())
  const [result, setResult] = useState("")
  const [githubRepo, setGithubRepo] = useState("")
  const [projectName, setProjectName] = useState("")
  const [inputMethod, setInputMethod] = useState("local") // 'local' or 'github'

  const { notifyError, notifyInfo, notifyWarning } = useNotification()

  const handleFileProcessing = useCallback((files, name) => {
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
      setSelectedFiles(new Set(filteredFiles.map(f => f.id))) // Select all by default
      setProjectName(name)
      setStep("select")
    } catch (error) {
      console.error("Erro no processamento:", error)
      notifyError("Ocorreu um erro ao processar os arquivos.")
    } finally {
      setIsProcessing(false)
    }
  }, [notifyError, notifyWarning])


  const handleFetchFromGithub = async () => {
    if (!githubRepo.trim()) {
      notifyError("Por favor, insira o nome do repositório no formato 'owner/repo'.")
      return
    }
    setIsProcessing(true)
    setStatusText("Buscando repositório no GitHub...")

    try {
      const [owner, repo] = githubRepo.split("/")
      if (!owner || !repo) throw new Error("Formato inválido. Use 'owner/repo'.")

      const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`)
      if (!treeResponse.ok) {
        if (treeResponse.status === 404) throw new Error("Repositório não encontrado.")
        if (treeResponse.status === 403) {
          const data = await treeResponse.json()
          const resetTime = new Date(treeResponse.headers.get("x-ratelimit-reset") * 1000)
          throw new Error(`Limite de requisições da API do GitHub atingido. Tente novamente após ${resetTime.toLocaleTimeString()}.`)
        }
        throw new Error(`Erro ao buscar a estrutura do repositório: ${treeResponse.statusText}`)
      }
      const treeData = await treeResponse.json()

      if (treeData.truncated) {
        notifyWarning("O repositório é muito grande e a lista de arquivos foi truncada.")
      }
      setStatusText(`Encontrados ${treeData.tree.length} itens. Baixando arquivos...`)

      const filePromises = treeData.tree
        .filter(item => item.type === "blob")
        .map(async item => {
          try {
            const fileResponse = await fetch(item.url, { headers: { Accept: "application/vnd.github.v3.raw" } })
            if (!fileResponse.ok) return null
            const content = await fileResponse.text()
            return { path: item.path, content }
          } catch (e) {
            console.warn(`Falha ao baixar ${item.path}`, e)
            return null
          }
        })

      const files = (await Promise.all(filePromises)).filter(Boolean)
      handleFileProcessing(files, repo)

    } catch (error) {
      console.error("Erro ao buscar do GitHub:", error)
      notifyError(error.message || "Ocorreu um erro desconhecido.")
      setIsProcessing(false)
    }
  }


  const handleToggleFileSelection = (fileId) => {
    setSelectedFiles(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(fileId)) {
        newSelection.delete(fileId)
      } else {
        newSelection.add(fileId)
      }
      return newSelection
    })
  }

  const handleSelectAll = () => setSelectedFiles(new Set(allFiles.map(f => f.id)))
  const handleDeselectAll = () => setSelectedFiles(new Set())

  const handleGenerateCodebase = () => {
    if (selectedFiles.size === 0) {
      notifyError("Nenhum arquivo selecionado.")
      return
    }
    setIsProcessing(true)
    setStatusText("Gerando codebase...")

    const filesToInclude = allFiles.filter(file => selectedFiles.has(file.id))

    const fileTree = generateFileTree(filesToInclude.map(f => f.path), projectName)
    let combinedContent = `PROJETO: ${projectName}\n==================================\n\nESTRUTURA DE FICHEIROS:\n==================================\n${fileTree}\n\n==================================\n\nCONTEÚDO DOS FICHEIROS:\n========================\n\n`

    for (const { path, content } of filesToInclude) {
      const processed = processContent(content)
      combinedContent += `---[ ${path} ]---\n${processed}\n\n`
    }
    setResult(combinedContent)
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
  }

  const DropZone = () => {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = useCallback((e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    }, [])
    const handleDragLeave = useCallback((e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    }, [])
    const handleDrop = useCallback(async (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const items = e.dataTransfer.items
      if (!items) return

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
        handleFileProcessing(relativeFiles, rootEntry.name)

      } catch (error) {
        console.error("Erro no drop:", error)
        notifyError("Seu navegador não suporta a leitura de diretórios. Tente um navegador baseado em Chromium.")
        setIsProcessing(false)
      }
    }, [])

    const handleSelectFolder = async () => {
      if (!window.showDirectoryPicker) {
        notifyError("Seu navegador não suporta a seleção de diretórios. Tente arrastar a pasta.")
        return
      }

      try {
        const dirHandle = await window.showDirectoryPicker()
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
        handleFileProcessing(files, dirHandle.name)
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Erro ao selecionar diretório:", error)
          notifyError("Não foi possível acessar o diretório.")
        }
        setIsProcessing(false)
      }
    }


    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSelectFolder}
        className={`flex flex-col items-center justify-center text-center transition-all duration-300 p-8 h-full rounded-lg cursor-pointer
                    border-2 border-dashed ${isDragging ? "border-primary-base bg-primary-base/10" : "border-bLight dark:border-bDark hover:border-primary-light"}`}
      >
        <Upload className={`w-12 h-12 transition-transform ${isDragging ? "text-primary-base scale-110" : "text-lightFg-secondary dark:text-darkFg-secondary"}`} />
        <p className={`text-xl font-semibold mt-6 transition-colors ${isDragging ? "text-primary-base" : "text-lightFg-primary dark:text-darkFg-primary"}`}>
          {isDragging ? "Pode soltar a pasta!" : "Arraste uma pasta ou clique para selecionar"}
        </p>
        <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary mt-2">Sua pasta será processada localmente no seu navegador.</p>
      </div>
    )
  }

  const renderContent = () => {
    switch (step) {
      case "input":
        return (
          <div className="w-full h-full flex flex-col gap-4">
            <div className="flex justify-center gap-2">
              <Button variant={inputMethod === "local" ? "primary" : "secondary"} onClick={() => setInputMethod("local")} $squared>
                <Folder size={16} className="mr-2" /> Local
              </Button>
              <Button variant={inputMethod === "github" ? "primary" : "secondary"} onClick={() => setInputMethod("github")} $squared>
                <Github size={16} className="mr-2" /> GitHub
              </Button>
            </div>
            {inputMethod === "local" ? (
              <DropZone />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                <Github size={48} className="text-lightFg-secondary dark:text-darkFg-secondary" />
                <p className="text-xl font-semibold text-lightFg-primary dark:text-darkFg-primary">Extrair de um Repositório Público</p>
                <Input
                  placeholder="owner/repo"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFetchFromGithub()}
                  disabled={isProcessing}
                />
                <Button onClick={handleFetchFromGithub} loading={isProcessing} disabled={isProcessing || !githubRepo.trim()} $squared>
                  {isProcessing ? "Buscando..." : "Buscar Repositório"}
                </Button>
              </div>
            )}
          </div>
        )
      case "select":
        return (
          <div className="flex flex-col h-full w-full gap-4">
            <h3 className="text-lg font-bold">Selecione os arquivos para incluir no codebase</h3>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleSelectAll} variant="outline" size="sm" $squared>Selecionar Tudo</Button>
              <Button onClick={handleDeselectAll} variant="outline" size="sm" $squared>Limpar Seleção</Button>
              <div className="flex-grow" />
              <Button onClick={handleReset} variant="danger" size="sm" $squared><ArrowLeft size={16} className="mr-2" /> Voltar</Button>
              <Button onClick={handleGenerateCodebase} variant="success" size="sm" $squared><Files size={16} className="mr-2" /> Gerar Codebase</Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-md">
              <ul className="space-y-1">
                {allFiles.map(file => (
                  <li key={file.id} onClick={() => handleToggleFileSelection(file.id)}
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${selectedFiles.has(file.id)
                      ? "bg-primary-base/20 text-lightFg-primary dark:text-darkFg-primary"
                      : "hover:bg-lightBg-secondary dark:hover:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary"
                      }`}>
                    {selectedFiles.has(file.id) ? <CopyCheck size={16} className="text-primary-base" /> : <FileText size={16} />}
                    <span className="font-mono text-sm">{file.path}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary text-center">
              {selectedFiles.size} de {allFiles.length} arquivos selecionados.
            </p>
          </div>
        )
      case "result":
        return (
          <div className="flex flex-col h-full w-full gap-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="font-semibold text-xl">Codebase Gerada</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Button onClick={() => {
                  navigator.clipboard.writeText(result)
                  notifyInfo("Copiado para a área de transferência!")
                }} variant="primary" size="sm" $squared>
                  <Copy size={16} className="mr-2" />
                  <span>Copiar Tudo</span>
                </Button>
                <Button onClick={() => {
                  const blob = new Blob([result], { type: "text/plain" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `${projectName}_codebase.txt`
                  a.click()
                  URL.revokeObjectURL(url)
                }} variant="secondary" size="sm" $squared>
                  <Download size={16} className="mr-2" />
                  <span>Baixar .txt</span>
                </Button>
                <Button onClick={handleReset} variant="danger" size="sm" $squared>
                  <ArrowLeft size={16} className="mr-2" />
                  <span>Gerar Novo</span>
                </Button>
              </div>
            </div>
            <textarea
              value={result}
              readOnly
              className="w-full flex-grow p-4 font-mono text-sm bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-md focus:ring-0 resize-none border-none" />
          </div>
        )
      default:
        return null
    }
  }

  const ContentView = ({ children }) => (
    <main className="flex items-center justify-center p-4 min-h-screen w-full ml-[3.5rem] md:ml-auto">
      {children}
    </main>
  )

  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
      <Paper className="w-full h-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary-base" />
            <p className="text-lg font-medium text-lightFg-primary dark:text-darkFg-primary">{statusText}</p>
          </div>
        ) : renderContent()}
      </Paper>
    </SideMenu>
  )
}


export default Codebase
