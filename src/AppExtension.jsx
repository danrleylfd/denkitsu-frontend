import { useCallback, useEffect } from "react"
import { LogIn, UserPlus } from "lucide-react"

import { useAuth } from "./contexts/AuthContext"
import { useAI } from "./contexts/AIContext"
import { useNotification } from "./contexts/NotificationContext"

import ExtensionChatInterface from "./components/AI/ExtensionChatInterface"
import Button from "./components/Button"
import Paper from "./components/Paper"

const AuthScreen = () => {
  const openPage = (path) => {
    chrome.tabs.create({ url: `https://denkitsu.vercel.app${path}` })
  }
  return (
    <div className="flex flex-col justify-center items-center h-full p-4">
      <Paper className="flex flex-col items-center text-center gap-2 p-4">
        <img src="/denkitsu-rounded.png" alt="Denkitsu Logo" className="w-20 h-20" />
        <h2 className="text-xl font-bold text-lightFg-primary dark:text-darkFg-primary">Bem-vindo, Eu sou o Denkitsu</h2>
        <p className="text-lightFg-secondary dark:text-darkFg-secondary">
          Antes de começar, por favor, faça login ou crie uma conta.
        </p>
        <div className="flex gap-2 mt-4">
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
  )
}

const WelcomeScreen = () => {
  const { user } = useAuth()
  return (
    <div className="flex grow justify-center items-center flex-col p-4 gap-2 text-center">
      <img src="/denkitsu-rounded.png" alt="Denkitsu Logo" className="w-20 h-20" />
      <h2 className="text-xl font-bold text-lightFg-primary dark:text-darkFg-primary">Olá, {user?.name}</h2>
      <p className="text-lightFg-primary dark:text-darkFg-primary">Eu sou o Denkitsu, Como posso te ajudar hoje?</p>
    </div>
  )
}

const SidePanelChat = () => {
  const { setUserPrompt, messages } = useAI()
  const { notifyInfo, notifyError } = useNotification()

  const processOmniboxMessage = useCallback(async () => {
    try {
      const result = await chrome.storage.session.get("omniboxMessage")
      if (result.omniboxMessage) {
        const { content } = result.omniboxMessage
        await chrome.storage.session.remove("omniboxMessage")
        setUserPrompt(content)
      }
    } catch (e) {
      console.error("Erro ao processar mensagem da omnibox:", e)
    }
  }, [setUserPrompt])

  useEffect(() => {
    processOmniboxMessage()
  }, [processOmniboxMessage])

  useEffect(() => {
    const storageListener = (changes, area) => {
      if (area === "session" && changes.omniboxMessage?.newValue) {
        console.log("Nova mensagem da omnibox detectada enquanto o painel está aberto.")
        processOmniboxMessage()
      }
    }
    chrome.storage.onChanged.addListener(storageListener)
    return () => {
      chrome.storage.onChanged.removeListener(storageListener)
    }
  }, [processOmniboxMessage])

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
  }, [setUserPrompt, notifyInfo, notifyError])

  const hasUserMessages = messages.some((msg) => msg.role === "user")

  return (
    <>
      {!hasUserMessages && <WelcomeScreen />}
      <ExtensionChatInterface onAnalyzePage={handleAnalyzePage} />
    </>
  )
}

const App = () => {
  const { signed, loading } = useAuth()

  return (
    <div className="flex flex-col gap-2 h-dvh bg-brand-purple">
      {loading ? (
        <div className="flex justify-center items-center h-full">
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
