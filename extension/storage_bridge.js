// Este script roda APENAS no seu site (ex: denkitsu.vercel.app)

const syncLoginState = () => {
  const user = localStorage.getItem("@Denkitsu:user");
  const refreshToken = localStorage.getItem("@Denkitsu:refreshToken");

  if (user && refreshToken) {
    // Dados encontrados no localStorage do site, vamos copiar para o chrome.storage
    chrome.storage.local.set({
      "@Denkitsu:user": user,
      "@Denkitsu:refreshToken": refreshToken
    }, () => {
      console.log("Denkitsu Bridge: Estado de login sincronizado para a extensão.");
    });
  } else {
    // Se não há dados, limpamos o storage da extensão também (logout)
     chrome.storage.local.remove(["@Denkitsu:user", "@Denkitsu:refreshToken"], () => {
      console.log("Denkitsu Bridge: Estado de logout sincronizado para a extensão.");
    });
  }
};

// Sincroniza quando a página carrega
syncLoginState();

// Uma forma de observar mudanças é sobrescrever o setItem do localStorage
// para notificar nosso script sempre que algo for salvo.
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  originalSetItem.apply(this, arguments);
  if (key === "@Denkitsu:user" || key === "@Denkitsu:refreshToken") {
    syncLoginState();
  }
};

const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key) {
  originalRemoveItem.apply(this, arguments);
  if (key === "@Denkitsu:user" || key === "@Denkitsu:refreshToken") {
    syncLoginState();
  }
}
