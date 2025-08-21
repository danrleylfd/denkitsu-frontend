import { useState, useEffect } from "react"

import { useAI } from "../contexts/AIContext"
import { useNotification } from "../contexts/NotificationContext"

import { getModels } from "../services/aiChat"

import SideMenu from "../components/SideMenu"
import AIHistory from "../components/AI/History"
import ImagePreview from "../components/AI/ImagePreview"
import AIAgents from "../components/AI/Agents"
import AITools from "../components/AI/Tools"
import AIAudio from "../components/AI/Audio"
import AIMedia from "../components/AI/Media"
import AITip from "../components/AI/Tip"
import AIBar from "../components/AI/Bar"
import AIFeatures from "../components/AI/Features"
import AISettings from "../components/AI/Settings"
import AIFactoryManager from "../components/AI/FactoryManager"
import Lousa from "../components/AI/Lousa"

const ContentView = ({ children }) => <main className="flex flex-col flex-1 h-dvh mx-auto">{children}</main>

const AI = () => {
  const {
    setFreeModels, setPayModels, setGroqModels, aiKey, imageUrls, setImageUrls,
    selectedAgent, setSelectedAgent, loading, isImproving, onSendMessage,
    handleRegenerateResponse, improvePrompt, fileInputRef, handleFileChange,
    audioFile, setAudioFile, handleSendAudioMessage,
  } = useAI()
  const { notifyWarning, notifyError } = useNotification()
  const [lousaContent, setLousaContent] = useState(null)
  const [openDoor, setOpenDoor] = useState(null)
  const [featuresDoor, setFeaturesDoor] = useState(false)
  const [settingsDoor, setSettingsDoor] = useState(false)
  const [factoryManagerDoor, setFactoryManagerDoor] = useState(false)

  const handleDoorToggle = (doorName) => {
    setOpenDoor(prevOpenDoor => (prevOpenDoor === doorName ? null : doorName))
  }

  const agentsDoor = openDoor === "agents"
  const toolsDoor = openDoor === "tools"
  const mediaDoor = openDoor === "media"

  useEffect(() => {
    (async () => {
      try {
        const { freeModels: loadedFree, payModels: loadedPay, groqModels: loadedGroq } = await getModels()
        setFreeModels(loadedFree?.filter(model => !model.id.includes("whisper")) || [])
        if (aiKey) setPayModels(loadedPay?.filter(model => !model.id.includes("whisper")) || [])
        setGroqModels(loadedGroq?.filter(model => !model.id.includes("whisper")) || [])
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

  const toggleLousa = (content) => setLousaContent(content)

  return (
    <SideMenu ContentView={ContentView} className="bg-brand-purple bg-cover bg-center">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" style={{ display: "none" }} />
      <AIHistory toggleLousa={toggleLousa} onRegenerate={handleRegenerateResponse} />
      <ImagePreview />
      {audioFile && <AIAudio audioFile={audioFile} onCancel={() => setAudioFile(null)} onSend={handleSendAudioMessage} />}
      <AIMedia mediaDoor={mediaDoor} onAddImage={onAddImage} loading={loading} isImproving={isImproving} />
      <AIAgents loading={loading || isImproving} agentsDoor={agentsDoor} selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent} />
      <AITools loading={loading || isImproving} toolsDoor={toolsDoor} />
      {openDoor === null && <AITip />}
      <AIBar
        loading={loading}
        isImproving={isImproving}
        imageCount={imageUrls.length}
        onSendMessage={onSendMessage}
        improvePrompt={improvePrompt}
        agentsDoor={agentsDoor}
        toolsDoor={toolsDoor}
        mediaDoor={mediaDoor}
        toggleAgentsDoor={() => handleDoorToggle("agents")}
        toggleToolsDoor={() => handleDoorToggle("tools")}
        toggleMediaDoor={() => handleDoorToggle("media")}
        toggleFeaturesDoor={() => setFeaturesDoor(prev => !prev)}
        toggleSettingsDoor={() => setSettingsDoor(prev => !prev)}
        toggleFactoryManagerDoor={() => setFactoryManagerDoor(prev => !prev)}
      />
      <AIFeatures featuresDoor={featuresDoor} toggleFeaturesDoor={() => setFeaturesDoor(prev => !prev)} />
      <AISettings settingsDoor={settingsDoor} toggleSettingsDoor={() => setSettingsDoor(prev => !prev)} />
      <AIFactoryManager factoryManagerDoor={factoryManagerDoor} toggleFactoryManagerDoor={() => setFactoryManagerDoor(prev => !prev)} />
      <Lousa content={lousaContent} toggleLousa={toggleLousa} />
    </SideMenu>
  )
}

export default AI
