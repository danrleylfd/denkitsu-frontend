import { memo, useRef, useEffect } from "react"

import AIMessage from "./Message"

import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"

const AIHistory = ({ toggleLousa, onRegenerate }) => {
  const { user } = useAuth()
  const { autoScroll, messages, loading } = useAI()
  const messagesEndRef = useRef(null)
  // Descomente a linha abaixo para rolar automaticamente para o final da conversa quando novas mensagens chegarem
  useEffect(() => () => {
    if (autoScroll && messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
  }, [autoScroll, messages, loading])
  return (
    <div className="flex flex-col flex-1 overflow-y-auto p-2 gap-2">
      {messages.map((msg, pos) => (
        <AIMessage
          key={pos}
          msg={msg}
          user={user}
          toggleLousa={toggleLousa}
          onRegenerate={onRegenerate}
          isLastMessage={pos === messages.length - 1}
          loading={loading && !msg.content}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default memo(AIHistory)
