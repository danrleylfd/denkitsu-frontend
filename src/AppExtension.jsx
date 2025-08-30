import { useCallback } from "react"
import { LogIn, UserPlus } from "lucide-react"

import { useAuth } from "./contexts/AuthContext"
import { useAI } from "./contexts/AIContext"
import { useNotification } from "./contexts/NotificationContext"

import AIBar from "./components/AI/ExtensionAIBar"
import ChatInterface from "./components/AI/ChatInterface"
import Button from "./components/Button"
import Paper from "./components/Paper"

const AuthScreen = () => {
  const openPage = (path) => {
    chrome.tabs.create({ url: `https://denkitsu.vercel.app${path}` })
  }
  return (
    <div className="flex flex-col justify-center items-center h-full p-4">
      <Paper className="flex flex-col items-center gap-4 text-center">
        <img src="/denkitsu-rounded.png" alt="Denkitsu Logo" className="w-24 h-24" />
        <h2 className="text-xl font-bold">"Bem-vindo ao Denkitsu"</h2>
        <p className="text-lightFg-secondary dark:text-darkFg-secondary">
          "Para usar a inteligência artificial, por favor, faça login ou crie sua conta."
        </p>
        <div className="flex gap-4 mt-4">
          <Button $rounded variant="secondary" onClick={() => openPage("/signup")}>
            <UserPlus size={16} className="mr-2" />
            "Cadastrar"
          </Button>
          <Button $rounded variant="primary" onClick={() => openPage("/signin")}>
            <LogIn size={16} className="mr-2" />
            "Entrar"
          </Button>
        </div>
      </Paper>
    </div>
  )
}

const WelcomeScreen = () => {
  return (
    <div className="flex grow justify-center items-center flex-col p-4 text-center">
      <img src="/denkitsu-rounded.png" alt="Denkitsu Logo" className="w-24 h-24 mb-4" />
      <h2 className="text-xl font-bold text-lightFg-primary dark:text-darkFg-primary">Denkitsu AI</h2>
      <p className="text-lightFg-primary dark:text-darkFg-primary">Como posso te ajudar hoje?</p>
    </div>
  )
}

const SidePanelChat = () => {
  const { setUserPrompt, onSendMessage, improvePrompt, messages } = useAI()
  const { notifyInfo, notifyError } = useNotification()

  const handleAnalyzePage = useCallback(() => {
    notifyInfo("Analisando o conteúdo da página...")
    chrome.runtime.sendMessage({ type: "GET_PAGE_CONTENT" }, (response) => {
      if (response && !response.error) {
        const prompt = `Analise, resuma ou responda perguntas sobre o seguinte conteúdo da página "${response.title}" (${response.url}):\n\n"${response.content}"`
        setUserPrompt(prompt)
      } else {
        notifyError("Não foi possível extrair o conteúdo desta página.")
        console.error("Side Panel: Erro ao extrair conteúdo:", response?.error)
      }
    })
  }, [notifyError, notifyInfo, setUserPrompt])

  const hasUserMessages = messages.some((msg) => msg.role === "user")

  return (
    <>
      {hasUserMessages ? (
        <ChatInterface
          renderBar={(props) => (
            <AIBar
              {...props}
              onSendMessage={onSendMessage}
              improvePrompt={improvePrompt}
              onAnalyzePage={handleAnalyzePage}
            />
          )}
        />
      ) : (
        <>
          <WelcomeScreen />
          <ChatInterface
            renderBar={(props) => (
              <AIBar
                {...props}
                onSendMessage={onSendMessage}
                improvePrompt={improvePrompt}
                onAnalyzePage={handleAnalyzePage}
              />
            )}
          />
        </>
      )}
    </>
  )
}


const App = () => {
  const { signed, loading } = useAuth()

  return (
    <div className="flex flex-col h-dvh bg-[#7159C1]">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Button variant="secondary" loading={true} disabled $rounded />
        </div>
      ) : signed ? (
        <SidePanelChat />
      ) : (
        <AuthScreen />
      )}
    </div>
  )
}

export default App
