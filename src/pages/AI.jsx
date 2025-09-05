import { useAI } from "../contexts/AIContext"

import SideMenu from "../components/SideMenu"
import AIBar from "../components/AI/Bar"
import ChatInterface from "../components/AI/ChatInterface"

const ContentView = ({ children }) => <main className="flex flex-col flex-1 h-dvh mx-auto">{children}</main>

const AI = () => {
  const { onSendMessage, improvePrompt, fileInputRef, handleFileChange } = useAI()
  return (
    <SideMenu ContentView={ContentView} className="bg-brand-purple bg-cover bg-center">
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
    </SideMenu>
  )
}

export default AI
