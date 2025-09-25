import { useAI } from "../contexts/AIContext"

import ChatInterface from "../components/AI/ChatInterface"

const AI = () => {
  const { fileInputRef, handleFileChange } = useAI()
  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" style={{ display: "none" }} />
      <ChatInterface />
    </>
  )
}

export default AI
