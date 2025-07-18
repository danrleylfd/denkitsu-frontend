import { memo, useRef, useEffect } from "react"

import AIMessage from "./Message"

import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"

const AIHistory = ({ toggleLousa }) => {
  const { user } = useAuth()
  const { messages, loading } = useAI()
  // const initialMessage = { role: "assistant", content: "Olá! Como posso ajudar você hoje?\n Shift + Enter para quebrar a linha." }
  const messagesEndRef = useRef(null)
  // Descomente a linha abaixo para rolar automaticamente para o final da conversa quando novas mensagens chegarem
  // useEffect(() => (messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })), [messages, loading])
  return (
    <div className="flex flex-col flex-1 overflow-y-auto p-2 gap-2">

      {/* <AIMessage msg={initialMessage} /> */}

      {messages.map((msg, pos) => (
        <AIMessage
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

export default memo(AIHistory)
