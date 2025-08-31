import localforage from "localforage"

export const RECENTS_KEY = "recent_codebases"

export const storage = localforage.createInstance({
  name: "codebase-storage"
})

export const openDB = async () => {
  return await storage.ready()
}
