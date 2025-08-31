const APP_PREFIX = "@Denkitsu:"

const syncAllDenkitsuStorage = async () => {
  try {
    const siteStorageData = {}
    const siteKeys = new Set()
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith(APP_PREFIX)) {
        siteStorageData[key] = localStorage.getItem(key)
        siteKeys.add(key)
      }
    }
    const extensionStorage = await chrome.storage.local.get(null)
    const keysToRemove = []
    for (const key in extensionStorage) {
      if (key.startsWith(APP_PREFIX) && !siteKeys.has(key)) {
        keysToRemove.push(key)
      }
    }
    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove)
      console.log(`Denkitsu Bridge: Chaves antigas removidas da extensão: ${keysToRemove.join(", ")}`)
    }
    await chrome.storage.local.set(siteStorageData)
    console.log(`Denkitsu Bridge: Sincronização completa. ${Object.keys(siteStorageData).length} itens sincronizados para a extensão.`)
  } catch (error) {
    console.error("Denkitsu Bridge: Falha na sincronização completa.", error)
  }
}

const originalSetItem = localStorage.setItem
const originalRemoveItem = localStorage.removeItem
const originalClear = localStorage.clear

localStorage.setItem = function (key, value) {
  originalSetItem.apply(this, arguments)
  if (key.startsWith(APP_PREFIX)) {
    chrome.storage.local.set({ [key]: value }, () => {
      console.log(`Denkitsu Bridge: Item '${key}' atualizado na extensão.`)
    })
    if (key === `${APP_PREFIX}user`) {
      console.log("Denkitsu Bridge: Login detectado, executando sincronização completa.")
      syncAllDenkitsuStorage()
    }
  }
}

localStorage.removeItem = function (key) {
  originalRemoveItem.apply(this, arguments)
  if (key.startsWith(APP_PREFIX)) {
    chrome.storage.local.remove(key, () => {
      console.log(`Denkitsu Bridge: Item '${key}' removido da extensão.`)
    })
  }
}

localStorage.clear = async function () {
  originalClear.apply(this, arguments)
  try {
    const extensionStorage = await chrome.storage.local.get(null)
    const keysToRemove = Object.keys(extensionStorage).filter(key => key.startsWith(APP_PREFIX))

    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove)
      console.log("Denkitsu Bridge: localStorage.clear() detectado. Itens relevantes removidos da extensão.")
    }
  } catch (error) {
    console.error("Denkitsu Bridge: Falha ao limpar o storage da extensão após clear().", error)
  }
}

console.log("Denkitsu Bridge: Iniciando ponte de armazenamento.")
syncAllDenkitsuStorage()
