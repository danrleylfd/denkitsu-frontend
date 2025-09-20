import { storage } from "./storage"

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

export const setHandle = async (key, handle) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(handle, key)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject("Falha ao salvar o handle do diretório.")
  })
}

export const getHandle = async (key) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject("Falha ao buscar o handle do diretório.")
  })
}

export const deleteHandle = async (key) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(key)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject("Falha ao remover o handle do diretório.")
  })
}

export const getRecentItems = async () => {
  try {
    const items = await storage.local.getItem(RECENTS_KEY)
    return items ? JSON.parse(items) : []
  } catch (error) {
    console.error("Falha ao ler itens recentes do localStorage", error)
    return []
  }
}

export const addRecentItem = async (newItem) => {
  let items = await getRecentItems()
  items = items.filter(item => item.id !== newItem.id)
  items.unshift(newItem)
  items.splice(MAX_RECENTS)
  await storage.local.setItem(RECENTS_KEY, JSON.stringify(items))
  return items
}

export const removeRecentItem = async (itemId) => {
  let items = await getRecentItems()
  items = items.filter(item => item.id !== itemId)
  await storage.local.setItem(RECENTS_KEY, JSON.stringify(items))
  return items
}

export const clearRecentItems = async () => {
  await storage.local.removeItem(RECENTS_KEY)
  return []
}

export const isBinaryContent = (content) => /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(content)

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

export const shouldIgnoreFile = (path) => {
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

export const buildFileTree = (files) => {
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
