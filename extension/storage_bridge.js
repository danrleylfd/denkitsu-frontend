const APP_PREFIX = "@Denkitsu:"

const ESSENTIAL_SYNC_KEYS = new Set([
  `${APP_PREFIX}user`,
  `${APP_PREFIX}refreshToken`,
  `${APP_PREFIX}theme`,
  `${APP_PREFIX}aiProvider`,
  `${APP_PREFIX}GroqModel`,
  `${APP_PREFIX}OpenRouterModel`,
  `${APP_PREFIX}Groq`,
  `${APP_PREFIX}OpenRouter`,
])

const originalSetItem = localStorage.setItem
const originalRemoveItem = localStorage.removeItem
const originalClear = localStorage.clear

localStorage.setItem = function (key, value) {
  originalSetItem.apply(this, arguments)
  if (ESSENTIAL_SYNC_KEYS.has(key)) chrome.storage.local.set({ [key]: value })
}

localStorage.removeItem = function (key) {
  originalRemoveItem.apply(this, arguments)
  if (ESSENTIAL_SYNC_KEYS.has(key)) chrome.storage.local.remove(key)
}

localStorage.clear = async function () {
  originalClear.apply(this, arguments)
  const keysToRemove = Array.from(ESSENTIAL_SYNC_KEYS)
  try {
    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove)
      console.log("Denkitsu Bridge: localStorage.clear() detectado. Chaves essenciais removidas da extensão.")
    }
  } catch (error) {
    console.error("Denkitsu Bridge: Falha ao limpar chaves essenciais da extensão.", error)
  }
}

console.log("Denkitsu Bridge: Ponte de armazenamento iniciada. Modo: Apenas Sincronização Essencial.")
