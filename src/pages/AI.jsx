import { useState, useEffect, useCallback } from "react"

import { useAI } from "../contexts/AIContext"
import { useNotification } from "../contexts/NotificationContext"

import { sendMessageStream, sendMessage, getModels } from "../services/aiChat"

import SideMenu from "../components/SideMenu"
import AIBar from "../components/AI/Bar"
import AITip from "../components/AI/Tip"
import ImagePreview from "../components/AI/ImagePreview"
import AISettings from "../components/AI/Settings"
import AIHistory from "../components/AI/History"
import Lousa from "../components/AI/Lousa"
import AITools from "../components/AI/Tools"

const ContentView = ({ children }) => <main className="flex flex-col flex-1 h-dvh mx-auto">{children}</main>

const AI = () => {
  const aiContext = useAI()

  const { notifyWarning, notifyError } = useNotification()
  const [loading, setLoading] = useState(false)
  const [lousaContent, setLousaContent] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState("Padrão")
  const [isToolsOpen, setIsToolsOpen] = useState(false)

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
  }, [aiContext.aiKey, aiContext.setFreeModels, aiContext.setPayModels, aiContext.setGroqModels, notifyError])

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
        await sendMessageStream(aiContext.aiKey, aiContext.aiProvider, aiContext.model, apiMessages, aiContext.web, selectedPrompt, delta => {
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
        const { data } = await sendMessage(aiContext.aiKey, aiContext.aiProvider, aiContext.model, [...aiContext.freeModels, ...aiContext.payModels, ...aiContext.groqModels], apiMessages, selectedPrompt, aiContext.web, {
          browserTool: aiContext.browserTool,
          httpTool: aiContext.httpTool,
          wikiTool: aiContext.wikiTool,
          newsTool: aiContext.newsTool,
          weatherTool: aiContext.weatherTool,
          criptoTool: aiContext.criptoTool,
          cinemaTool: aiContext.cinemaTool,
          gamesTool: aiContext.gamesTool,
          genshinTool: aiContext.genshinTool,
          pokedexTool: aiContext.pokedexTool,
          nasaTool: aiContext.nasaTool
        })
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
  }, [aiContext.aiProvider, aiContext.aiKey, aiContext.model, aiContext.stream, aiContext.web, aiContext.freeModels, aiContext.payModels, aiContext.groqModels, selectedPrompt, aiContext.setMessages, notifyError, aiContext])

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
  }, [loading, aiContext.userPrompt, aiContext.imageUrls, aiContext.messages, aiContext.setMessages, aiContext.setUserPrompt, aiContext.setImageUrls, executeSendMessage])

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
  }, [loading, aiContext.messages, aiContext.setMessages, executeSendMessage, notifyWarning])

  const toggleLousa = useCallback((content) => setLousaContent(content), [])
  const toggleToolsPopup = () => setIsToolsOpen(prev => !prev)

  const allModels = [...aiContext.freeModels, ...aiContext.payModels, ...aiContext.groqModels]
  const selectedModel = allModels.find(m => m.id === aiContext.model)

  const temMensagensDoUsuario = aiContext.messages.some(msg => msg.role === "user")

  return (
    <SideMenu ContentView={ContentView} className="bg-brand-purple bg-cover bg-center">
      {!temMensagensDoUsuario ? (
        <div className="flex grow justify-center items-center flex-col">
          <ImagePreview />
          <div className="w-full relative">
            <AITools isOpen={isToolsOpen} loading={loading} />
            <AIBar
              onAddImage={onAddImage}
              imageCount={aiContext.imageUrls.length}
              toggleSettings={() => setSettingsOpen(!settingsOpen)}
              onSendMessage={onSendMessage}
              loading={loading}
              isToolsOpen={isToolsOpen}
              toggleToolsPopup={toggleToolsPopup}
            />
          </div>
          <AITip />
          <AISettings
            settingsOpen={settingsOpen}
            toggleSettings={() => setSettingsOpen(!settingsOpen)}
            selectedPrompt={selectedPrompt}
            onSelectPrompt={setSelectedPrompt}
          />
        </div>
      ) : (
        <>
          <AIHistory
            toggleLousa={toggleLousa}
            onRegenerate={handleRegenerateResponse}
          />
          <ImagePreview />
          <div className="w-full relative">
            <AITools isOpen={isToolsOpen} loading={loading} />
            <AIBar
              onAddImage={onAddImage}
              imageCount={aiContext.imageUrls.length}
              toggleSettings={() => setSettingsOpen(!settingsOpen)}
              onSendMessage={onSendMessage}
              loading={loading}
              isToolsOpen={isToolsOpen}
              toggleToolsPopup={toggleToolsPopup}
            />
          </div>
          <AITip />
          <AISettings
            settingsOpen={settingsOpen}
            toggleSettings={() => setSettingsOpen(!settingsOpen)}
            selectedPrompt={selectedPrompt}
            onSelectPrompt={setSelectedPrompt}
          />
          <Lousa content={lousaContent} toggleLousa={toggleLousa} />
        </>
      )}
    </SideMenu>
  )
}

export default AI
