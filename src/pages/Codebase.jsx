import React, { useState, useCallback, useEffect } from "react"

import Paper from "../components/Paper"
import FileViewer from "../components/Codebase/FileViewer"
import ProcessingScreen from "../components/Codebase/ProcessingScreen"
import InputScreen from "../components/Codebase/InputScreen"
import FileExplorer from "../components/Codebase/FileExplorer"
import ResultScreen from "../components/Codebase/ResultScreen"

import { useNotification } from "../contexts/NotificationContext"
import { useAuth } from "../contexts/AuthContext"
import api from "../services"
import {
  getRecentItems, addRecentItem, removeRecentItem, clearRecentItems,
  setHandle, getHandle, deleteHandle,
  isBinaryContent, shouldIgnoreFile, buildFileTree
} from "../utils/codebase"

const Codebase = () => {
  const { user } = useAuth()
  const { notifyError, notifyInfo, notifyWarning } = useNotification()

  const [step, setStep] = useState("input") // "input", "select", "result"
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusText, setStatusText] = useState("")
  const [allFiles, setAllFiles] = useState([])
  const [selectedFiles, setSelectedFiles] = useState(new Set())
  const [result, setResult] = useState("")
  const [githubRepo, setGithubRepo] = useState("")
  const [projectName, setProjectName] = useState("")
  const [projectSource, setProjectSource] = useState(null)
  const [viewingFile, setViewingFile] = useState(null)
  const [recentItems, setRecentItems] = useState([])
  const [fileTree, setFileTree] = useState([])

  useEffect(() => {
    const loadRecentItems = async () => {
      const items = await getRecentItems()
      setRecentItems(items)
    }
    loadRecentItems()
  }, [])

  const handleFileProcessing = useCallback(async (files, name, type, handleAvailable = false) => {
    const tree = buildFileTree(files)
    setFileTree(tree)
    setAllFiles(files)
    setSelectedFiles(new Set(files.map(f => f.path)))
    setProjectName(name)
    setProjectSource(type)
    const updatedRecents = await addRecentItem({ id: `${type}-${name}`, type, name, timestamp: Date.now(), handleAvailable })
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
  }, [githubRepo, user, handleFileProcessing, notifyError, notifyWarning])

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

  const handleRecentClick = useCallback(async (item) => {
    if (item.type === "github") {
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
      notifyInfo(`A pasta "${item.name}" foi adicionada via Drag-and-Drop e não pode ser recarregada. Por favor, arraste-a novamente.`)
    }
  }, [handleFetchFromGithubProxy, handleFileProcessing, notifyError, notifyInfo])

  const handleRemoveRecent = useCallback(async (item) => {
    try {
      if (item.type === "local" && item.handleAvailable) await deleteHandle(item.name)
      const updatedItems = await removeRecentItem(item.id)
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
        const itemsToClear = await getRecentItems()
        for (const item of itemsToClear) {
          if (item.type === "local" && item.handleAvailable) await deleteHandle(item.name)
        }
        const updatedItems = await clearRecentItems()
        setRecentItems(updatedItems)
        notifyInfo("Histórico limpo com sucesso.")
      } catch (error) {
        console.error("Erro ao limpar histórico:", error)
        notifyError("Não foi possível limpar completamente o histórico do banco de dados.")
      }
    }
  }, [notifyInfo, notifyError])

  const handleDownloadResult = () => {
    const blob = new Blob([result], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${projectName.replace("/", "_")}_codebase.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderCurrentStep = () => {
    switch (step) {
      case "select":
        return <FileExplorer
          fileTree={fileTree}
          allFiles={allFiles}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          onGenerate={handleGenerateCodebase}
          onBack={() => setStep("input")}
          onViewFile={setViewingFile}
        />
      case "result":
        return <ResultScreen
          result={result}
          projectName={projectName}
          onCopy={() => { navigator.clipboard.writeText(result); notifyInfo("Copiado!") }}
          onDownload={handleDownloadResult}
          onReset={handleReset}
          onBackToSelect={() => setStep("select")}
        />
      case "input":
      default:
        return <InputScreen
          onDrop={handleDrop}
          onSelectFolder={handleSelectFolder}
          githubRepo={githubRepo}
          onRepoChange={(e) => setGithubRepo(e.target.value)}
          onFetch={handleFetchFromGithubProxy}
          isProcessing={isProcessing}
          recentItems={recentItems}
          onRecentClick={handleRecentClick}
          onRemoveRecent={handleRemoveRecent}
          onClearRecents={handleClearRecents}
        />
    }
  }

  return (
    <>
      <Paper className="mt-2 max-w-[98%] h-full max-h-[95%] gap-2 p-4 flex flex-col justify-center items-center mx-auto">
        {isProcessing ? <ProcessingScreen statusText={statusText} /> : renderCurrentStep()}
      </Paper>
      <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />
    </>
  )
}

export default Codebase
