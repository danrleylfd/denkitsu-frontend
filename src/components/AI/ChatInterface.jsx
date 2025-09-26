import { useState, useCallback } from "react"

import { useAI } from "../../contexts/AIContext"
import { useNotification } from "../../contexts/NotificationContext"

import AIHistory from "./History"
import ImagePreview from "./ImagePreview"
import AIAudio from "./Audio"
import AIMedia from "./Media"
import AIAgents from "./Agents"
import AITools from "./Tools"
import AITip from "./Tip"
import AIBar from "./Bar"
import AIFeatures from "./Features"
import AISettings from "./Settings"
import AIFactoryManager from "../Factory/Manager"
import Lousa from "./Lousa"

const ChatInterface = () => {
  const { imageUrls, setImageUrls, handleRegenerateResponse, onSendMessage, improvePrompt } = useAI()
  const { notifyWarning, notifyError } = useNotification()

  const [lousaContent, setLousaContent] = useState(null)
  const [openDoor, setOpenDoor] = useState(null)
  const [featuresDoor, setFeaturesDoor] = useState(false)
  const [settingsDoor, setSettingsDoor] = useState(false)
  const [factoryManagerDoor, setFactoryManagerDoor] = useState(false)

  const handleDoorToggle = (doorName) => {
    setOpenDoor((prevOpenDoor) => (prevOpenDoor === doorName ? null : doorName))
  }

  const agentsDoor = openDoor === "agents"
  const toolsDoor = openDoor === "tools"
  const mediaDoor = openDoor === "media"

  const onAddImage = () => {
    if (imageUrls.length >= 3) return notifyWarning("Você pode adicionar no máximo 3 imagens.")
    const url = window.prompt("Cole a URL da imagem:")
    if (!url) return
    const img = new Image()
    img.src = url
    img.onload = () => setImageUrls((prev) => [...prev, url])
    img.onerror = () => notifyError("A URL fornecida não parece ser uma imagem válida ou não pode ser acessada.")
  }

  const toggleLousa = useCallback((content) => setLousaContent(content), [])

  return (
    <>
      <AIHistory toggleLousa={toggleLousa} onRegenerate={handleRegenerateResponse} />
      <div className="flex flex-col gap-2 mx-auto w-full">
        <ImagePreview />
        <AIAudio />
        <AIMedia mediaDoor={mediaDoor} onAddImage={onAddImage} />
        <AIAgents agentsDoor={agentsDoor} />
        <AITools toolsDoor={toolsDoor} />
        {/* {openDoor === null && <AITip toggleFeaturesDoor={() => setFeaturesDoor(prev => !prev)} />} */}
        <AIBar
          onSendMessage={onSendMessage}
          improvePrompt={improvePrompt}
          imageCount={imageUrls.length}
          mediaDoor={mediaDoor}
          agentsDoor={agentsDoor}
          toolsDoor={toolsDoor}
          toggleMediaDoor={() => handleDoorToggle("media")}
          toggleAgentsDoor={() => handleDoorToggle("agents")}
          toggleToolsDoor={() => handleDoorToggle("tools")}
          toggleFeaturesDoor={() => setFeaturesDoor((prev) => !prev)}
          toggleSettingsDoor={() => setSettingsDoor((prev) => !prev)}
          toggleFactoryManagerDoor={() => setFactoryManagerDoor((prev) => !prev)}
        />
      </div>
      <AIFeatures featuresDoor={featuresDoor} toggleFeaturesDoor={() => setFeaturesDoor((prev) => !prev)} />
      <AISettings settingsDoor={settingsDoor} toggleSettingsDoor={() => setSettingsDoor((prev) => !prev)} />
      <AIFactoryManager factoryManagerDoor={factoryManagerDoor} toggleFactoryManagerDoor={() => setFactoryManagerDoor((prev) => !prev)} />
      <Lousa content={lousaContent} toggleLousa={toggleLousa} />
    </>
  )
}

export default ChatInterface
