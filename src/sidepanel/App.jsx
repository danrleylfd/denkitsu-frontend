import { useState, useEffect, useCallback } from "react"
import { LogIn, UserPlus } from "lucide-react"

import { useAuth } from "../contexts/AuthContext"
import { useAI } from "../contexts/AIContext"
import { useNotification } from "../contexts/NotificationContext"
import useMessage from "../hooks/message"
import { getModels } from "../services/aiChat"

import SidePanelAIBar from "../components/AI/SidePanelAIBar"
import AITip from "../components/AI/Tip"
import ImagePreview from "../components/AI/ImagePreview"
import AISettings from "../components/AI/Settings"
import AIAgents from "../components/AI/Agents"
import AITools from "../components/AI/Tools"
import AIHistory from "../components/AI/History"
import Lousa from "../components/AI/Lousa"

import Button from "../components/Button"
import Paper from "../components/Paper"

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

const ChatInterface = () => {
  const {
    setFreeModels, setPayModels, setGroqModels, aiKey, imageUrls, setImageUrls, setUserPrompt,
    selectedAgent, setSelectedAgent, messages
  } = useAI()
  const { notifyInfo, notifyWarning, notifyError } = useNotification()
  const [lousaContent, setLousaContent] = useState(null)
  const [agentsDoor, setAgentsDoor] = useState(false)
  const [toolsDoor, setToolsDoor] = useState(false)
  const [settingsDoor, setSettingsDoor] = useState(false)

  const { loading, isImproving, onSendMessage, handleRegenerateResponse, improvePrompt } = useMessage()

  useEffect(() => {
    (async () => {
      try {
        const { freeModels: loadedFree, payModels: loadedPay, groqModels: loadedGroq } = await getModels()
        setFreeModels(loadedFree || [])
        if (aiKey) setPayModels(loadedPay || [])
        setGroqModels(loadedGroq || [])
      } catch (error) {
        notifyError(error.message || "Falha ao carregar modelos de IA.")
      }
    })()
  }, [aiKey, notifyError, setFreeModels, setPayModels, setGroqModels])

  const onAddImage = () => {
    if (imageUrls.length >= 3) return notifyWarning("Você pode adicionar no máximo 3 imagens.")
    const url = window.prompt("Cole a URL da imagem:")
    if (!url) return
    const img = new Image()
    img.src = url
    img.onload = () => setImageUrls(prev => [...prev, url])
    img.onerror = () => notifyError("A URL fornecida não parece ser uma imagem válida ou não pode ser acessada.")
  }

  const toggleLousa = useCallback((content) => setLousaContent(content), [])

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

  const hasUserMessages = messages.some(msg => msg.role === "user")

  return (
    <>
      {hasUserMessages
        ? <AIHistory toggleLousa={toggleLousa} onRegenerate={handleRegenerateResponse} />
        : <WelcomeScreen />
      }
      <ImagePreview />
      <AIAgents loading={loading || isImproving} agentsDoor={agentsDoor} selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent} />
      <AITools loading={loading || isImproving} toolsDoor={toolsDoor} />
      <AITip />
      <SidePanelAIBar
        loading={loading}
        isImproving={isImproving}
        onAddImage={onAddImage}
        imageCount={imageUrls.length}
        onSendMessage={onSendMessage}
        improvePrompt={improvePrompt}
        agentsDoor={agentsDoor}
        toolsDoor={toolsDoor}
        toggleAgentsDoor={() => setAgentsDoor(prev => !prev)}
        toggleToolsDoor={() => setToolsDoor(prev => !prev)}
        toggleSettingsDoor={() => setSettingsDoor(prev => !prev)}
        onAnalyzePage={handleAnalyzePage}
      />
      <AISettings
        settingsDoor={settingsDoor}
        toggleSettingsDoor={() => setSettingsDoor(prev => !prev)}
      />
      <Lousa content={lousaContent} toggleLousa={toggleLousa} />
    </>
  )
}

const App = () => {
  const { signed, loading } = useAuth()

  return (
    <div className="flex flex-col h-dvh bg-[#7159C1]">
      {loading
        ? (
          <div className="flex items-center justify-center h-full">
            <Button variant="secondary" loading={true} disabled $rounded />
          </div>
        )
        : signed ? <ChatInterface /> : <AuthScreen />
      }
    </div>
  )
}

export default App
