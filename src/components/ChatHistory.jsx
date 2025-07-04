import { memo, useRef, useEffect } from "react"

import ChatMessage from "./ChatMessage"

import { useAuth } from "../contexts/AuthContext"
import { useAI } from "../contexts/AIContext"

const ChatHistory = ({ toggleLousa }) => {
  const { messages, loading } = useAI()
  const { user } = useAuth()
  // const initialMessage = { role: "assistant", content: "Olá! Como posso ajudar você hoje?\n Shift + Enter para quebrar a linha." }
  const messagesEndRef = useRef(null)
  // Descomente a linha abaixo para rolar automaticamente para o final da conversa quando novas mensagens chegarem
  // useEffect(() => (messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })), [messages, loading])
  return (
    <div className="flex flex-col flex-1 overflow-y-auto p-2 gap-2">

      {/* <ChatMessage msg={initialMessage} /> */}

      {messages.map((msg, pos) => (
        <ChatMessage
          key={pos}
          msg={msg}
          user={user}
          toggleLousa={toggleLousa}
          loading={loading && !msg.content}
        />
      ))}

      <div ref={messagesEndRef} />

    </div>
  )
}

export default memo(ChatHistory)
