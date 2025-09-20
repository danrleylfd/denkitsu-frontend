// Código final para: Frontend/src/pages/AI.jsx
import { useAI } from "../contexts/AIContext"

import AIBar from "../components/AI/Bar"
import ChatInterface from "../components/AI/ChatInterface"

const AI = () => {
  const { onSendMessage, improvePrompt, fileInputRef, handleFileChange } = useAI()
  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" style={{ display: "none" }} />
      <ChatInterface
        renderBar={(props) => (
          <AIBar
            {...props}
            onSendMessage={onSendMessage}
            improvePrompt={improvePrompt}
          />
        )}
      />
    </>
  )
}

export default AI
