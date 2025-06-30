// src/pages/AI.jsx
import { LuX } from "react-icons/lu"
import { useAuth } from "../contexts/AuthContext"
import { useAI } from "../contexts/AIContext"
import useChat from "../hooks/useChat"

import SideMenu from "../components/SideMenu"
import ChatMessage from "../components/Chat/ChatMessage"
import Lousa from "../components/Chat/Lousa"
import ChatSettings from "../components/Chat/ChatSettings"
import ChatInput from "../components/Chat/ChatInput"
import { MessageError } from "../components/Notifications"
import Paper from "../components/Paper"
import Button from "../components/Button"

const ContentView = ({ children }) => <main className="flex flex-col flex-1 h-screen mx-auto">{children}</main>

const AI = () => {
  const { user } = useAuth()
  const { prompt, clearHistory, customPrompt, setCustomPrompt } = useAI()
  const {
    messages, inputText, imageUrl, loading, error, canvaContent, isSettingsOpen, selectedPrompt,
    freeModels, payModels, groqModels, messagesEndRef, setInputText, setImageUrl, setSelectedPrompt,
    handleSendMessage, handleShowCanva, handleCloseCanva, toggleSettings
  } = useChat()

  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple">
      <div className="flex flex-col flex-1 overflow-y-auto p-2 gap-2">
        {messages.map((msg, pos) => (
          <ChatMessage key={pos} msg={msg} user={user} onShowCanva={handleShowCanva} loading={loading && msg.content === ""} />
        ))}
        <div ref={messagesEndRef} />
        {error && <MessageError>{error}</MessageError>}
      </div>

      {imageUrl && (
        <Paper className="bg-lightBg-primary dark:bg-darkBg-primary rounded-none relative w-auto">
          <img src={imageUrl} alt="Preview" className="max-h-16 rounded-lg object-cover" />
        </Paper>
      )}

      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        handleSendMessage={handleSendMessage}
        toggleSettings={toggleSettings}
        loading={loading}
      />

      <ChatSettings
        isOpen={isSettingsOpen}
        onClose={toggleSettings}
        freeModels={freeModels}
        payModels={payModels}
        groqModels={groqModels}
        clearHistory={clearHistory}
        prompts={prompt}
        selectedPrompt={selectedPrompt}
        onSelectPrompt={setSelectedPrompt}
        customPrompt={customPrompt}
        setCustomPrompt={setCustomPrompt}
      />

      <Lousa htmlContent={canvaContent} onClose={handleCloseCanva} />
    </SideMenu>
  )
}

export default AI
