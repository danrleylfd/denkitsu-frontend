import { useState, useEffect, useCallback } from "react"
import { Upload, Copy, Download, ArrowLeft } from "lucide-react"

import SideMenu from "../components/SideMenu"
const fnmatch = (pattern, string) => {
  const regex = new RegExp(
    "^" +
      pattern
        .replace(/([.$+^|(){}\[\]\\])/g, "\\$1")
        .replace(/\*/g, ".*")
        .replace(/\?/g, ".") +
      "$"
  )
  return regex.test(string)
}

const shouldIgnore = (relativePath, options) => {
  const pathParts = relativePath.split("/")
  const filename = pathParts[pathParts.length - 1]
  const filenameLower = filename.toLowerCase()
  if (options.use_gitignore && options.gitignore_patterns) {
    let isIgnored = null
    for (const pattern of options.gitignore_patterns) {
      if (!pattern.trim()) continue
      const isNegated = pattern.startsWith("!")
      const currentPattern = (isNegated ? pattern.substring(1) : pattern).trim()
      let match = false
      if (currentPattern.endsWith("/")) {
        const dirPattern = currentPattern.slice(0, -1)
        if (pathParts.includes(dirPattern)) match = true
      } else if (!currentPattern.includes("/")) {
        if (pathParts.some((part) => fnmatch(currentPattern, part))) {
          match = true
        }
      } else {
        if (fnmatch(currentPattern, relativePath)) {
          match = true
        }
      }
      if (match) {
        isIgnored = !isNegated
      }
    }
    if (isIgnored !== null) {
      return isIgnored
    }
  }
  const vendorFolders = new Set(options.ignore_vendor_folders ? ["node_modules", "vendor", ".gradle"] : [])
  if (pathParts.some((p) => vendorFolders.has(p))) return true
  if (options.ignore_dot_folders && pathParts.slice(0, -1).some((p) => p.startsWith("."))) return true
  if (options.ignore_config_dot_files && filename.startsWith(".") && !filename.startsWith(".env")) return true
  if (options.ignore_env_files && filename.startsWith(".env")) return true
  if (options.ignore_markdown && filenameLower.endsWith(".md")) {
    return !(options.keep_readme && filenameLower === "readme.md")
  }
  if (options.ignore_license && ["license", "license.md", "license.txt", "copying"].some((l) => filenameLower.startsWith(l))) return true
  const buildFolders = new Set(options.ignore_build_folders ? ["dist", "build", "target", "out", "bin", "obj"] : [])
  if (pathParts.some((p) => buildFolders.has(p))) return true
  if (options.ignore_logs && filenameLower.endsWith(".log")) return true
  if (options.ignore_lock_files && ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "composer.lock", "gemfile.lock"].includes(filename)) return true
  const defaultIgnoreExts = new Set([
    ".pyc",
    ".pyo",
    ".pyd",
    ".so",
    ".o",
    ".a",
    ".dll",
    ".exe",
    ".tmp",
    ".swp",
    ".swo",
    ".user",
    ".suo",
    ".pdb",
    ".DS_Store",
    ".class",
    ".jar",
    ".war",
    ".ear",
    ".png",
    ".jpg",
    "jpeg",
    ".gif",
    ".bmp",
    ".ico",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".zip",
    ".tar",
    ".gz",
    ".rar",
    ".7z",
    ".mp3",
    ".mp4",
    ".mov",
    ".avi"
  ])
  const extension = filename.includes(".") ? filename.substring(filename.lastIndexOf(".")).toLowerCase() : ""
  if (defaultIgnoreExts.has(extension)) return true
  if (options.custom_patterns && options.custom_patterns.some((p) => fnmatch(p, relativePath) || fnmatch(p, filename))) return true
  return false
}

const isBinaryContent = (content) => {
  return /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(content)
}

const processContent = (content, remove_blank_lines) => {
  if (remove_blank_lines) {
    return content.replace(/(\r\n|\n|\r){3,}/g, "$1$1").trim()
  }
  return content
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
      const connector = index === entries.length - 1 ? "└── " : "├── "
      result += `${prefix}${connector}${entry}\n`
      if (Object.keys(dir[entry]).length > 0) {
        const extension = index === entries.length - 1 ? "    " : "│   "
        result += buildTreeString(dir[entry], prefix + extension)
      }
    })
    return result
  }
  return `${rootName}/\n${buildTreeString(tree)}`
}


const OptionsPanel = ({ options, setOptions }) => {
  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target
    setOptions((prev) => ({ ...prev, [id]: checked }))
  }
  useEffect(() => {
    if (!options.ignore_markdown) {
      setOptions((prev) => ({ ...prev, keep_readme: false }))
    }
  }, [options.ignore_markdown, setOptions])
  const ptLabels = {
    use_gitignore: "Respeitar .gitignore",
    ignore_dot_folders: "Ignorar pastas c/ '.' (ex: .vscode)",
    ignore_config_dot_files: "Ignorar arq. config. ocultos (ex: .prettierrc)",
    ignore_env_files: "Ignorar arq. de ambiente (.env*)",
    ignore_vendor_folders: "Ignorar pastas de dependências",
    ignore_build_folders: "Ignorar pastas de build",
    ignore_license: "Ignorar arquivos de licença",
    ignore_logs: "Ignorar arquivos de log (*.log)",
    ignore_lock_files: "Ignorar arquivos de lock",
    ignore_markdown: "Ignorar outros arquivos .md",
    keep_readme: "Manter README.md",
    remove_blank_lines: "Remover linhas em branco extras"
  }
  return (
    <aside className="glass-panel">
      <h2 className="text-lg font-semibold mb-4 text-slate-100">Opções de Exclusão e Formatação</h2>
      <div className="space-y-3 text-sm">
        {Object.keys(options).map((key) => {
          if (typeof options[key] !== "boolean") return null
          const isDisabled = key === "keep_readme" && !options.ignore_markdown
          return (
            <label
              key={key}
              className={`flex items-center space-x-3 cursor-pointer ${key === "keep_readme" ? "ml-4" : ""} ${
                isDisabled ? "text-slate-400 cursor-not-allowed" : "text-slate-200 hover:text-white"
              }`}>
              <input type="checkbox" id={key} checked={options[key]} onChange={handleCheckboxChange} disabled={isDisabled} className="custom-checkbox" />
              <span>{ptLabels[key]}</span>
            </label>
          )
        })}
        <hr className="border-slate-200/20" />
        <div>
          <label htmlFor="custom_patterns" className="text-sm font-medium text-slate-200">
            Regras personalizadas (separadas por vírgula):
          </label>
          <input
            type="text"
            id="custom_patterns"
            value={options.custom_patterns.join(", ")}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                custom_patterns: e.target.value
                  .split(",")
                  .map((p) => p.trim())
                  .filter((p) => p)
              }))
            }
            className="mt-1 w-full bg-slate-900/50 border border-slate-200/20 rounded-md px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-slate-400"
            placeholder="ex: docs, assets, *.tmp"
          />
        </div>
      </div>
    </aside>
  )
}

const DropZone = ({ onDrop }) => {
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
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (e.dataTransfer.items) onDrop(e.dataTransfer.items)
    },
    [onDrop]
  )

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`glass-panel h-full flex flex-col items-center justify-center text-center transition-all duration-300 p-8 ${isDragging ? "bg-blue-500/10" : ""}`}>
      <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isDragging ? "bg-blue-500/30" : "bg-white/10"}`}>
        <Upload className={`w-10 h-10 transition-transform ${isDragging ? "text-blue-300 scale-110" : "text-slate-300"}`} />
      </div>
      <p className={`text-xl font-semibold mt-6 transition-colors ${isDragging ? "text-blue-300" : "text-slate-200"}`}>
        {isDragging ? "Pode soltar a pasta!" : "Arraste uma pasta para aqui"}
      </p>
      <p className="text-sm text-slate-400 mt-2">ou clique para selecionar</p>
    </div>
  )
}

const ResultView = ({ result, onReset }) => {
  const [copyStatus, setCopyStatus] = useState("Copiar")
  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopyStatus("Copiado!")
      setTimeout(() => setCopyStatus("Copiar"), 2000)
    })
  }

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "codebase.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="glass-panel h-full overflow-hidden flex flex-col p-0">
      <div className="p-4 border-b border-white/10 flex justify-between items-center flex-wrap gap-2 flex-shrink-0">
        <h3 className="font-semibold text-slate-100">Codebase Gerada</h3>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="fluent-button bg-blue-500/80 hover:bg-blue-500">
            <Copy size={16} />
            <span>{copyStatus}</span>
          </button>
          <button onClick={handleDownload} className="fluent-button bg-slate-500/80 hover:bg-slate-500">
            <Download size={16} />
            <span>Descarregar .txt</span>
          </button>
          <button onClick={onReset} className="fluent-button bg-red-500/80 hover:bg-red-500">
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </button>
        </div>
      </div>
      <textarea
        value={result}
        readOnly
        className="w-full flex-grow p-4 font-mono text-sm bg-slate-900/70 text-slate-200 border-none focus:ring-0 resize-none"></textarea>
    </div>
  )
}

const Codebase = () => {
  const [view, setView] = useState("drop")
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusText, setStatusText] = useState("")
  const [result, setResult] = useState("")
  const [options, setOptions] = useState({
    use_gitignore: true,
    ignore_dot_folders: true,
    ignore_config_dot_files: true,
    ignore_env_files: true,
    ignore_vendor_folders: true,
    ignore_build_folders: true,
    ignore_license: true,
    ignore_logs: true,
    ignore_lock_files: true,
    ignore_markdown: true,
    keep_readme: true,
    remove_blank_lines: true,
    custom_patterns: []
  })

  const processFiles = useCallback(
    (files, rootName) => {
      setIsProcessing(true)
      setStatusText("A processar...")
      try {
        setStatusText("A ler .gitignore...")
        const gitignoreFile = files.find((f) => f.relativePath === ".gitignore")
        let gitignorePatterns = []
        if (options.use_gitignore && gitignoreFile) {
          gitignorePatterns = gitignoreFile.content
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l && !l.startsWith("#"))
        }
        setStatusText("A gerar codebase...")
        const currentOptions = { ...options, gitignore_patterns: gitignorePatterns }
        const includedFiles = files.filter(({ relativePath, content }) => !isBinaryContent(content) && !shouldIgnore(relativePath, currentOptions))
        if (includedFiles.length === 0) {
          alert("Nenhum ficheiro válido encontrado para processar.")
          setIsProcessing(false)
          return
        }
        includedFiles.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
        const fileTree = generateFileTree(
          includedFiles.map((f) => f.relativePath),
          rootName
        )
        let combinedContent = `PROJETO: ${rootName}\n==================================\n\nESTRUTURA DE FICHEIROS:\n==================================\n${fileTree}\n\n==================================\n\nCONTEÚDO DOS FICHEIROS:\n========================\n\n`
        for (const { relativePath, content } of includedFiles) {
          const processed = processContent(content, options.remove_blank_lines)
          combinedContent += `---[ ${relativePath} ]---\n\n${processed}\n\n`
        }
        setResult(combinedContent)
        setView("result")
      } catch (error) {
        console.error("Erro no processamento:", error)
        alert("Ocorreu um erro ao processar os ficheiros.")
      } finally {
        setIsProcessing(false)
      }
    },
    [options]
  )

  const handleDrop = useCallback(
    async (items) => {
      setIsProcessing(true)
      setStatusText("A processar...")
      try {
        const entries = Array.from(items).map((item) => item.webkitGetAsEntry())
        if (!entries.length) throw new Error("Nenhuma entrada encontrada")
        const filePromises = []
        const rootName = entries[0].name
        const traverse = async (entry, currentPath) => {
          if (entry.isFile) {
            filePromises.push(
              new Promise((resolve) =>
                entry.file(async (file) => {
                  try {
                    const content = await file.text()
                    const fullPath = `${currentPath}${file.name}`
                    const relativePath = fullPath.substring(rootName.length + 1)
                    resolve({ path: fullPath, relativePath: relativePath, content })
                  } catch (e) {
                    console.warn(`Não foi possível ler o ficheiro ${file.name}, a ignorar.`, e)
                    resolve(null)
                  }
                })
              )
            )
          } else if (entry.isDirectory) {
            const dirReader = entry.createReader()
            const dirEntries = await new Promise((resolve) => dirReader.readEntries(resolve))
            for (const subEntry of dirEntries) {
              await traverse(subEntry, `${currentPath}${entry.name}/`)
            }
          }
        }
        for (const entry of entries) await traverse(entry, "")
        const files = (await Promise.all(filePromises)).filter((f) => f !== null)
        processFiles(files, rootName)
      } catch (error) {
        console.error("Erro no drop:", error)
        alert("O seu navegador não suporta a leitura de diretórios. Tente arrastar ficheiros individuais.")
        setIsProcessing(false)
      }
    },
    [processFiles]
  )

  const handleReset = () => {
    setView("drop")
    setResult("")
  }
  const ContentView = ({ children }) => (
    <main className="flex flex-col items-center p-2 gap-2 mx-auto min-h-screen w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[67%] ml-[3.5rem] md:ml-auto">
      {children}
    </main>
  )
  return (
    <SideMenu fixed ContentView={ContentView} className="bg-brand-purple bg-cover bg-center">
      <style>{`
        @keyframes gradient-animation { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .windows-11-style { background: linear-gradient(-45deg, #0f172a, #1e293b, #3b82f6, #6366f1); background-size: 400% 400%; animation: gradient-animation 15s ease infinite; font-family: 'Segoe UI', 'Inter', sans-serif; }
        .glass-panel { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 1.5rem; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); }
        .custom-checkbox { appearance: none; -webkit-appearance: none; height: 1.25rem; width: 1.25rem; flex-shrink: 0; background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 0.375rem; cursor: pointer; transition: all 0.2s ease-in-out; }
        .custom-checkbox:checked { background-color: #3b82f6; border-color: #60a5fa; background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e"); }
        .custom-checkbox:focus { outline: 2px solid transparent; outline-offset: 2px; box-shadow: 0 0 0 2px #1e293b, 0 0 0 4px #60a5fa; }
        .custom-checkbox:disabled { background-color: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.1); opacity: 0.6; cursor: not-allowed; }
        .fluent-button { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 0.5rem; border: 1px solid rgba(255, 255, 255, 0.1); color: white; font-weight: 600; font-size: 0.875rem; transition: all 0.2s ease-in-out; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        .fluent-button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .fluent-button:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
      `}</style>
      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel p-8 flex items-center gap-4">
            <span className="text-lg font-medium text-slate-200">{statusText}</span>
          </div>
        </div>
      )}
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        {view === "drop" && <OptionsPanel options={options} setOptions={setOptions} />}
        <div className={view === "drop" ? "lg:col-span-2" : "lg:col-span-3"}>
          {view === "drop" ? <DropZone onDrop={handleDrop} /> : <ResultView result={result} onReset={handleReset} />}
        </div>
      </main>
    </SideMenu>
  )
}

export default Codebase
