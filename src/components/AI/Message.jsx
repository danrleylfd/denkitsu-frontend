// Frontend/src/components/AI/Message.jsx
import { memo } from "react"
import { UserRound, Wrench, CheckCircle, Route } from "lucide-react"

import AudioPlayer from "./AudioPlayer"
import Avatar from "../Avatar"
import AIReactions from "./Reactions"
import Markdown from "../Markdown"
import Button from "../Button"

const AIMessage = ({ msg, user, toggleLousa, loadingMessage, onRegenerate, isLastMessage }) => {
  const isSystem = msg.role === "system"
  if (isSystem) return null
  const isAssistant = msg.role === "assistant"
  const isUser = msg.role === "user"

  const renderContent = () => {
    if (!msg.content || (Array.isArray(msg.content) && msg.content.length === 0)) return null

    const contentPart = (() => {
      if (typeof msg.content === "string") return <Markdown key={msg.content} content={msg.content} />
      if (Array.isArray(msg.content)) return msg.content.map((part, index) => {
        if (part.type === "text") return <Markdown key={index} content={part.content} />
        if (part.type === "image_url") return <img key={index} src={part.image_url.url} alt="Imagem enviada pelo usuário" className="max-w-xs lg:max-w-md rounded-lg" />
        return null
      })
      return null
    })()

    const audioPart = msg.audio && msg.audio.data ? <AudioPlayer audioData={msg.audio.data} format={msg.audio.format} /> : null

    return <>{contentPart}{audioPart}</>
  }

  const hasContentStarted = msg.content && msg.content.length > 0

  const ReasoningBlock = isAssistant && msg.reasoning && (
    <Markdown loading={loadingMessage} content={msg.reasoning} think />
  )

  const PageContextBlock = isUser && msg.pageContext && (
    <Markdown content={msg.pageContext} page />
  )

  const ToolCallBlock = isAssistant && msg.toolCalls?.length > 0 && (
    <div className={`p-2 bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-md ${!hasContentStarted ? "animate-pulse" : ""}`}>
      <div className="flex flex-col gap-1">
        {msg.toolCalls.map((call) => (
          <div key={call.index || call.name} className="flex items-center gap-2 text-sm text-lightFg-secondary dark:text-darkFg-secondary">
            {hasContentStarted ? <CheckCircle size={14} className="text-green-base" /> : <Wrench size={14} className="animate-spin-fast" />}
            <span>{hasContentStarted ? "Denkitsu usou a ferramenta" : "Denkitsu está usando a ferramenta"} <strong>{call.name}</strong></span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className={`flex items-end gap-2 px-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className="w-8 h-8 rounded-full bg-lightBg-tertiary dark:bg-darkBg-tertiary flex items-center justify-center">
          <Avatar src={(isUser && user) ? user?.avatarUrl : "/denkitsu.png"} alt={isUser ? user?.name : "Denkitsu"} size={8} isPro={isUser && user?.plan === "plus"} />
        </div>
      <div className="flex flex-col gap-2 max-w-[90%] sm:max-w-[67%] md:max-w-[75%] lg:max-w-[90%] break-words rounded-md px-4 py-2 shadow-lg text-lightFg-secondary dark:text-darkFg-secondary bg-lightBg-secondary dark:bg-darkBg-secondary opacity-80 dark:opacity-90">
        {msg.routingInfo && (
          <div className="p-2 bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-md">
            <div className="flex items-center gap-2 text-sm text-lightFg-secondary dark:text-darkFg-secondary">
              <Route size={14} className="text-primary-base" />
              <span>Denkitsu escolheu o agente <strong>{msg.routingInfo.routedTo}</strong></span>
            </div>
          </div>
        )}
        {hasContentStarted
          ? (<>{ReasoningBlock}{ToolCallBlock}</>)
          : (<>{ToolCallBlock}{ReasoningBlock}</>)
        }
        {PageContextBlock}
        {loadingMessage && !hasContentStarted && msg.toolCalls?.length === 0 ? <Button variant="outline" size="icon" $rounded loading={true} disabled /> : renderContent()}
        {msg.timestamp && (
          <small className="ml-auto text-xs text-lightFg-secondary dark:text-darkFg-secondary whitespace-nowrap">
            {new Date(msg.timestamp).toLocaleString("pt-BR")}
          </small>
        )}
        {!loadingMessage && isAssistant && (
          <AIReactions message={msg} toggleLousa={toggleLousa} onRegenerate={onRegenerate} isLastMessage={isLastMessage} />
        )}
      </div>
    </div>
  )
}

export default memo(AIMessage)
