import { useState, useEffect, useCallback } from "react"
import { LogIn, UserPlus } from "lucide-react"

import { useAuth } from "../contexts/AuthContext"
import { useAI } from "../contexts/AIContext"
import { useNotification } from "../contexts/NotificationContext"

import { sendMessageStream, sendMessage, getModels } from "../services/aiChat"

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
  const aiContext = useAI()

  const { notifyInfo, notifyWarning, notifyError } = useNotification()
  const [loading, setLoading] = useState(false)
  const [lousaContent, setLousaContent] = useState(null)
  const [agentsDoor, setAgentsDoor] = useState(false)
  const [toolsDoor, setToolsDoor] = useState(false)
  const [settingsDoor, setSettingsDoor] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState("Padrão")

  useEffect(() => {
    (async () => {
      try {
        const { freeModels: loadedFree, payModels: loadedPay, groqModels: loadedGroq } = await getModels()
        aiContext.setFreeModels(loadedFree || [])
        if (aiContext.aiKey) aiContext.setPayModels(loadedPay || [])
        aiContext.setGroqModels(loadedGroq || [])
      } catch (error) {
        notifyError(error.message || "Falha ao carregar modelos de IA.")
      }
    })()
  }, [aiContext.aiKey, notifyError])

  const onAddImage = () => {
    if (aiContext.imageUrls.length >= 3) return notifyWarning("Você pode adicionar no máximo 3 imagens.")
    const url = window.prompt("Cole a URL da imagem:")
    if (!url) return
    const img = new Image()
    img.src = url
    img.onload = () => aiContext.setImageUrls(prev => [...prev, url])
    img.onerror = () => notifyError("A URL fornecida não parece ser uma imagem válida ou não pode ser acessada.")
  }

  const executeSendMessage = useCallback(async (historyToProcess) => {
    setLoading(true)
    const apiMessages = historyToProcess.map(({ role, content }) =>
      Array.isArray(content)
        ? { role, content: content.map(item => (item.type === "text" ? { type: "text", text: item.content } : item)) }
        : { role, content }
    )
    try {
      if (aiContext.stream) {
        const placeholder = {
          id: Date.now(),
          role: "assistant",
          content: "",
          reasoning: "",
          _contentBuffer: "",
          _reasoningBuffer: "",
          timestamp: new Date().toISOString()
        }
        aiContext.setMessages(prev => [...prev, placeholder])
        await sendMessageStream(aiContext.aiKey, aiContext.aiProvider, aiContext.model, apiMessages, aiContext.activeTools, selectedPrompt, delta => {
          if (delta.content) placeholder._contentBuffer += delta.content
          if (delta.reasoning) placeholder._reasoningBuffer += delta.reasoning
          if (delta.tool_calls?.[0]?.function?.arguments) placeholder._reasoningBuffer += delta.tool_calls[0].function.arguments
          const cleanContent = raw => {
            let reasoning = ""
            const content = raw.replace(/(<think>.*?<\/think>|<thinking>.*?<\/thinking>|◁think▷.*?◁\/think▷)/gs, (_, r) => {
              reasoning += r
              return ""
            })
            return { content, reasoning }
          }
          const { content, reasoning } = cleanContent(placeholder._contentBuffer)
          placeholder.content = content
          placeholder.reasoning = (placeholder._reasoningBuffer + reasoning).trim()
          aiContext.setMessages((prev) => prev.map(msg => (msg.id === placeholder.id ? { ...placeholder } : msg)))
        })
      } else {
        const { data } = await sendMessage(
          aiContext.aiKey,
          aiContext.aiProvider,
          aiContext.model,
          [...aiContext.freeModels, ...aiContext.payModels, ...aiContext.groqModels],
          apiMessages,
          selectedPrompt,
          aiContext.activeTools
        )
        const res = data?.choices?.[0]?.message
        if (!res) return
        const cleanContent = (raw = "") => {
          let reasoning = ""
          const content = raw.replace(/(<think>.*?<\/think>|<thinking>.*?<\/thinking>|◁think▷.*?◁\/think▷)/gs, (_, r) => {
            reasoning += r
            return ""
          })
          return { content, reasoning }
        }
        const { content, reasoning } = cleanContent(res.content)
        aiContext.setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            role: "assistant",
            content,
            reasoning: (res.reasoning || "") + reasoning,
            timestamp: new Date().toISOString()
          }
        ])
      }
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Falha na comunicação com o servidor de IA.")
      aiContext.setMessages(prev => prev.filter(msg => msg.content !== "" || msg.id !== err.id))
    } finally {
      setLoading(false)
    }
  }, [aiContext.aiProvider, aiContext.aiKey, aiContext.model, aiContext.stream, aiContext.web, aiContext.freeModels, aiContext.payModels, aiContext.groqModels, selectedPrompt, notifyError, aiContext])

  const onSendMessage = useCallback(async () => {
    if (loading || (!aiContext.userPrompt.trim() && aiContext.imageUrls.length === 0)) return
    const newMessage = {
      role: "user",
      content: [
        ...(aiContext.userPrompt.trim() ? [{ type: "text", content: aiContext.userPrompt.trim() }] : []),
        ...aiContext.imageUrls.map(url => ({ type: "image_url", image_url: { url } }))
      ],
      timestamp: new Date().toISOString()
    }
    const history = [...aiContext.messages, newMessage]
    aiContext.setMessages(history)
    aiContext.setUserPrompt("")
    aiContext.setImageUrls([])
    await executeSendMessage(history)
  }, [loading, aiContext.userPrompt, aiContext.imageUrls, aiContext.messages, executeSendMessage])

  const handleRegenerateResponse = useCallback(async () => {
    if (loading) return
    const lastMessage = aiContext.messages[aiContext.messages.length - 1]
    if (lastMessage?.role !== "assistant") {
      notifyWarning("Apenas a última resposta da IA pode ser regenerada.")
      return
    }
    const historyWithoutLastResponse = aiContext.messages.slice(0, -1)
    aiContext.setMessages(historyWithoutLastResponse)
    await executeSendMessage(historyWithoutLastResponse)
  }, [loading, aiContext.messages, executeSendMessage, notifyWarning])

  const hasUserMessages = aiContext.messages.some(msg => msg.role === "user")

  const toggleLousa = useCallback((content) => setLousaContent(content), [])

  const handleAnalyzePage = useCallback(() => {
    setLoading(true)
    notifyInfo("Analisando o conteúdo da página...")
    chrome.runtime.sendMessage({ type: "GET_PAGE_CONTENT" }, (response) => {
      setLoading(false)
      if (response && !response.error) {
        const prompt = `Analise, resuma ou responda perguntas sobre o seguinte conteúdo da página "${response.title}" (${response.url}):\n\n"${response.content}"`
        aiContext.setUserPrompt(prompt)
      } else {
        notifyError("Não foi possível extrair o conteúdo desta página.")
        console.error("Side Panel: Erro ao extrair conteúdo:", response?.error)
      }
    })
  }, [notifyError, notifyInfo])

  return (
    <>
      {hasUserMessages
        ? <AIHistory toggleLousa={toggleLousa} onRegenerate={handleRegenerateResponse} />
        : <WelcomeScreen />
      }
      <ImagePreview />
      <div className="w-full relative">
        <AIAgents agentsDoor={agentsDoor} selectedAgent={selectedPrompt} onSelectAgent={setSelectedPrompt} />
        <AITools loading={loading} toolsDoor={toolsDoor} />
        <SidePanelAIBar
          loading={loading}
          onAddImage={onAddImage}
          imageCount={aiContext.imageUrls.length}
          onSendMessage={onSendMessage}
          agentsDoor={agentsDoor}
          toolsDoor={toolsDoor}
          toggleAgentsDoor={() => setAgentsDoor(prev => !prev)}
          toggleToolsDoor={() => setToolsDoor(prev => !prev)}
          toggleSettingsDoor={() => setSettingsDoor(prev => !prev)}
          onAnalyzePage={handleAnalyzePage}
        />
      </div>
      <AITip />
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
