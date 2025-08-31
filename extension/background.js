console.log("Service Worker (background.js) iniciado.")

if (chrome.sidePanel) chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error))
else console.error("A API chrome.sidePanel não está disponível.")

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  suggest([{ content: text, description: `Enviar para Denkitsu AI: "${text}"` }])
})

chrome.omnibox.onInputEntered.addListener((text) => {
  if (!text.trim()) return
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) chrome.sidePanel.open({ tabId: tabs[0].id })
  })
  setTimeout(() => {
    chrome.runtime.sendMessage({
      type: "NEW_OMNIBOX_MESSAGE",
      content: text
    })
  }, 333)
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background: Mensagem recebida.", message)
  if (message.type === "GET_PAGE_CONTENT") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        console.error("Background: Nenhuma aba ativa encontrada.")
        sendResponse({ error: "Nenhuma aba ativa encontrada." })
        return
      }
      const tabId = tabs[0].id
      console.log(`Background: Aba ativa encontrada (${tabId}). Repassando pedido 'EXTRACT_CONTENT'.`)
      chrome.tabs.sendMessage(
        tabId,
        { type: "EXTRACT_CONTENT" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Background: Erro ao enviar mensagem para content script:", chrome.runtime.lastError.message)
            sendResponse({ error: chrome.runtime.lastError.message })
          } else {
            console.log("Background: Resposta recebida do content script. Enviando de volta para a Side Panel.", response)
            sendResponse(response)
          }
        }
      )
    })
    return true
  }
})
