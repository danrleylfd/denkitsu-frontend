import { useState, useCallback } from "react";
import { ScanText, LogIn, UserPlus } from "lucide-react";

// Hooks dos seus contextos
import { useAuth } from "../contexts/AuthContext";
import { useAI } from "../contexts/AIContext";
import { useNotification } from "../contexts/NotificationContext";

// Funções do seu serviço de API
import { sendMessageStream, sendMessage } from "../services/aiChat";

// Componentes reutilizados da sua UI
import AIBar from "../components/AI/Bar";
import AIHistory from "../components/AI/History";
import Button from "../components/Button";
import Paper from "../components/Paper";

// O componente da interface de Chat (quando logado)
const ChatInterface = () => {
  const {
    aiProvider, aiKey, model, stream, web,
    freeModels, payModels, groqModels,
    userPrompt, setUserPrompt, messages, setMessages, clearHistory,
  } = useAI();
  const { notifyError, notifyInfo, notifyWarning } = useNotification();
  const [loading, setLoading] = useState(false);

  const executeSendMessage = useCallback(async (historyToProcess) => {
    setLoading(true);
    const apiMessages = historyToProcess.map(({ role, content }) => ({ role, content }));
    try {
      if (stream) {
        const placeholder = { id: Date.now(), role: "assistant", content: "", timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, placeholder]);
        await sendMessageStream(aiKey, aiProvider, model, apiMessages, web, "Padrão", (delta) => {
          if (delta.content) {
            placeholder.content += delta.content;
            setMessages((prev) => prev.map(msg => (msg.id === placeholder.id ? { ...placeholder } : msg)));
          }
        });
      } else {
        const data = await sendMessage(aiKey, aiProvider, model, [...freeModels, ...payModels, ...groqModels], apiMessages, "Padrão", web);
        const res = data?.choices?.[0]?.message;
        if (res) {
          setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: res.content, timestamp: new Date().toISOString() }]);
        }
      }
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message);
      else notifyError("Falha na comunicação com o servidor de IA.");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [aiProvider, aiKey, model, stream, web, freeModels, payModels, groqModels, setMessages, notifyError]);

  const onSendMessage = useCallback(async () => {
    if (loading || !userPrompt.trim()) return;
    const newMessage = { role: "user", content: userPrompt.trim(), timestamp: new Date().toISOString() };
    const history = [...messages, newMessage];
    setMessages(history);
    setUserPrompt("");
    await executeSendMessage(history);
  }, [loading, userPrompt, messages, setMessages, setUserPrompt, executeSendMessage]);

  const handleAnalyzePage = () => {
    setLoading(true);
    notifyInfo("Analisando o conteúdo da página...");
    chrome.runtime.sendMessage({ type: "GET_PAGE_CONTENT" }, (response) => {
      setLoading(false);
      if (response && !response.error) {
        const prompt = `Analise, resuma ou responda perguntas sobre o seguinte conteúdo da página "${response.title}" (${response.url}):\n\n"${response.content}"`;
        setUserPrompt(prompt);
      } else {
        notifyError("Não foi possível extrair o conteúdo desta página.");
        console.error("Side Panel: Erro ao extrair conteúdo:", response?.error);
      }
    });
  };

  const handleRegenerateResponse = useCallback(async () => {
    if (loading) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role !== "assistant") {
      notifyWarning("Apenas a última resposta da IA pode ser regenerada.");
      return;
    }
    const historyWithoutLastResponse = messages.slice(0, -1);
    setMessages(historyWithoutLastResponse);
    await executeSendMessage(historyWithoutLastResponse);
  }, [loading, messages, setMessages, executeSendMessage, notifyWarning]);

  return (
    <>
      <AIHistory messages={messages} onRegenerate={handleRegenerateResponse} />
      <div className="p-2 border-t border-bLight dark:border-bDark">
        <Button variant="outline" onClick={handleAnalyzePage} loading={loading} className="w-full" $rounded>
          <ScanText size={16} className="mr-2" />
          Analisar Página Atual
        </Button>
      </div>
      <AIBar
        userPrompt={userPrompt}
        setUserPrompt={setUserPrompt}
        onSendMessage={onSendMessage}
        clearHistory={clearHistory}
        loading={loading}
        imageCount={0}
        onAddImage={() => notifyError("Upload de imagens não está disponível na extensão.")}
        toggleSettings={() => notifyError("Configurações não estão disponíveis na extensão.")}
      />
    </>
  );
};

// A tela para exibir quando o usuário NÃO está logado
const AuthScreen = () => {
  const openPage = (path) => {
    // Abre a página do seu site em uma nova aba
    chrome.tabs.create({ url: `https://denkitsu.vercel.app${path}` });
  };

  return (
    <div className="flex flex-col justify-center items-center h-full p-4">
      <Paper className="flex flex-col items-center gap-4 text-center">
        <img src="/denkitsu-rounded.png" alt="Denkitsu Logo" className="w-24 h-24" />
        <h2 className="text-xl font-bold">Bem-vindo ao Denkitsu</h2>
        <p className="text-lightFg-secondary dark:text-darkFg-secondary">
          Para usar a inteligência artificial e analisar páginas, por favor, faça login ou crie sua conta.
        </p>
        <div className="flex gap-4 mt-4">
          <Button $rounded variant="secondary" onClick={() => openPage("/signup")}>
            <UserPlus size={16} className="mr-2" />
            Cadastrar
          </Button>
          <Button $rounded variant="primary" onClick={() => openPage("/signin")}>
            <LogIn size={16} className="mr-2" />
            Entrar
          </Button>
        </div>
      </Paper>
    </div>
  );
};

// O componente principal que decide qual tela mostrar
const App = () => {
  const { signed, loading } = useAuth();

  return (
    <div className="flex flex-col h-dvh bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Button variant="secondary" loading={true} disabled $rounded />
        </div>
      ) : signed ? (
        <ChatInterface />
      ) : (
        <AuthScreen />
      )}
    </div>
  );
};

export default App;
