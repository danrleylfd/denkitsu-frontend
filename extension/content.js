console.log("Content Script injetado e rodando.");

const scrapePageContent = () => {
  const mainContentSelectors = [
    "article",
    "main",
    "[role='main']",
    "#content",
    ".content",
    "#main",
    ".main"
  ];

  let mainContentElement = null;
  for (const selector of mainContentSelectors) {
    mainContentElement = document.querySelector(selector);
    if (mainContentElement) break;
  }

  if (!mainContentElement) {
    mainContentElement = document.body;
  }

  const elementsToRemove = mainContentElement.querySelectorAll("nav, footer, script, style, aside, form, header");
  elementsToRemove.forEach(el => el.remove());

  const text = mainContentElement.innerText.replace(/\s\s+/g, ' ').trim();
  const title = document.title;
  const url = window.location.href;

  const limitedText = text.substring(0, 8000);

  return { title, url, content: limitedText };
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content Script: Mensagem recebida.", message);
  if (message.type === "EXTRACT_CONTENT") {
    console.log("Content Script: Extraindo conteúdo da página...");
    const pageData = scrapePageContent();
    console.log("Content Script: Conteúdo extraído. Enviando resposta...", pageData);
    sendResponse(pageData);
  }
});
