console.log("Service Worker (background.js) iniciado.");

chrome.action.onClicked.addListener(async (tab) => {
  console.log("Ícone da ação clicado. Abrindo Side Panel...");
  await chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background: Mensagem recebida.", message);

  if (message.type === "GET_PAGE_CONTENT") {
    // ---- INÍCIO DA CORREÇÃO ----

    // EM VEZ DE USAR sender.tab, VAMOS PERGUNTAR AO CHROME QUAL É A ABA ATIVA
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // A query retorna um array, pegamos o primeiro resultado que é a aba ativa.
      if (!tabs || tabs.length === 0) {
        console.error("Background: Nenhuma aba ativa encontrada.");
        sendResponse({ error: "Nenhuma aba ativa encontrada." });
        return;
      }

      const tabId = tabs[0].id;

      console.log(`Background: Aba ativa encontrada (${tabId}). Repassando pedido 'EXTRACT_CONTENT'.`);

      chrome.tabs.sendMessage(
        tabId,
        { type: "EXTRACT_CONTENT" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Background: Erro ao enviar mensagem para content script:", chrome.runtime.lastError.message);
            sendResponse({ error: chrome.runtime.lastError.message });
          } else {
            console.log("Background: Resposta recebida do content script. Enviando de volta para a Side Panel.", response);
            sendResponse(response);
          }
        }
      );
    });

    // ---- FIM DA CORREÇÃO ----

    return true; // Mantém a porta de mensagem aberta para a resposta assíncrona
  }
});
