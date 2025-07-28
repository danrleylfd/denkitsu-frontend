import { useState, useCallback } from "react";
import { ScanText } from "lucide-react";

// Hooks dos seus contextos
import { useAI } from "../contexts/AIContext";
import { useNotification } from "../contexts/NotificationContext";

// Funções do seu serviço de API
import { sendMessageStream, sendMessage } from "../services/aiChat";

// Componentes reutilizados da sua UI
import AIBar from "../components/AI/Bar";
import AIHistory from "../components/AI/History";
import Button from "../components/Button";

// Um componente wrapper simples para o layout da Side Panel
const SidePanelWrapper = ({ children }) => {
  return (
    <div className="flex flex-col h-dvh bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary">
      {children}
    </div>
  );
};

// O componente principal da UI da Side Panel
const App = () => {
  const {
    aiProvider, aiKey, model, stream, web,
    freeModels, payModels, groqModels,
    userPrompt, setUserPrompt, messages, setMessages, clearHistory,
  } = useAI();

  const { notifyError, notifyInfo } = useNotification();
  const [loading, setLoading] = useState(false);

  // Lógica principal para enviar a mensagem para a sua IA (adaptada do seu AI.jsx)
  const executeSendMessage = useCallback(async (historyToProcess) => {
    setLoading(true);
    const apiMessages = historyToProcess.map(({ role, content }) => ({ role, content }));

    try {
      if (stream) {
        const placeholder = {
          id: Date.now(),
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString()
        };
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
      if (err.response && err.response.data.error) {
        notifyError(err.response.data.error.message);
      } else {
        notifyError("Falha na comunicação com o servidor de IA.");
      }
      // Remove a mensagem do usuário se a API falhar, para que ele possa tentar novamente
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [aiProvider, aiKey, model, stream, web, freeModels, payModels, groqModels, setMessages, notifyError]);

  // Função chamada quando o usuário clica em "Enviar"
  const onSendMessage = useCallback(async () => {
    if (loading || !userPrompt.trim()) return;

    const newMessage = {
      role: "user",
      content: userPrompt.trim(),
      timestamp: new Date().toISOString()
    };

    const history = [...messages, newMessage];
    setMessages(history);
    setUserPrompt("");
    await executeSendMessage(history);
  }, [loading, userPrompt, messages, setMessages, setUserPrompt, executeSendMessage]);

  // Função para se comunicar com a extensão e pegar o contexto da página
  const handleAnalyzePage = () => {
    setLoading(true);
    notifyInfo("Analisando o conteúdo da página...");
    console.log("Side Panel: Enviando mensagem 'GET_PAGE_CONTENT' para o background script...");

    chrome.runtime.sendMessage({ type: "GET_PAGE_CONTENT" }, (response) => {
      console.log("Side Panel: Resposta recebida do background script.", response);
      setLoading(false);

      if (response && !response.error) {
        const prompt = `Analise, resuma ou responda perguntas sobre o seguinte conteúdo da página "${response.title}" (${response.url}):\n\n"${response.content}"`;
        setUserPrompt(prompt);
        console.log("Side Panel: Prompt atualizado com sucesso!");
      } else {
        notifyError("Não foi possível extrair o conteúdo desta página.");
        console.error("Side Panel: Erro ao extrair conteúdo:", response?.error);
      }
    });
  };

  return (
    <SidePanelWrapper>
      <AIHistory messages={messages} />

      <div className="p-2 border-t border-bLight dark:border-bDark">
        <Button
          variant="outline"
          onClick={handleAnalyzePage}
          loading={loading}
          className="w-full"
          $rounded
        >
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
    </SidePanelWrapper>
  );
};

export default App;
