export const isExtension = !!(window.chrome && chrome.runtime && chrome.runtime.id)

export const storage = {
  local: {
    getItem: async (key) => {
      if (isExtension) {
        const result = await chrome.storage.local.get(key)
        return result[key] || null
      }
      return localStorage.getItem(key)
    },
    setItem: async (key, value) => {
      if (isExtension) return chrome.storage.local.set({ [key]: value })
      return localStorage.setItem(key, value)
    },
    removeItem: async (key) => {
      if (isExtension) return chrome.storage.local.remove(key)
      return localStorage.removeItem(key)
    },
    clear: async () => {
      if (isExtension) return chrome.storage.local.clear()
      return localStorage.clear()
    }
  },
  session: {
    getItem: async (key) => {
      if (isExtension) {
        const result = await chrome.storage.session.get(key)
        return result[key] || null
      }
      return sessionStorage.getItem(key)
    },
    setItem: async (key, value) => {
      if (isExtension) return chrome.storage.session.set({ [key]: value })
      return sessionStorage.setItem(key, value)
    },
    removeItem: async (key) => {
      if (isExtension) return chrome.storage.session.remove(key)
      return sessionStorage.removeItem(key)
    },
    clear: async () => {
      if (isExtension) return chrome.storage.session.clear()
      return sessionStorage.clear()
    }
  }
}
