import { memo } from "react"
import { UserRound, Wrench, CheckCircle } from "lucide-react"
import AIReactions from "./Reactions"
import Markdown from "../Markdown"
import Button from "../Button"
import PurpleLink from "../Embeds/PurpleLink"

const AIMessage = ({ msg, user, toggleLousa, loading, onRegenerate, isLastMessage }) => {
  const isSystem = msg.role === "system"
  if (isSystem) return null
  const isAssistant = msg.role === "assistant"
  const isUser = msg.role === "user"

  const renderContent = () => {
    if (typeof msg.content === "string") return <Markdown key={msg.content} content={msg.content} />
    if (Array.isArray(msg.content)) return msg.content.map((part, index) => {
      if (part.type === "text") return <Markdown key={index} content={part.content} />
      if (part.type === "image_url") return <img key={index} src={part.image_url.url} alt="Imagem enviada pelo usuário" className="max-w-xs lg:max-w-md rounded-lg my-2" />
      return null
    })
    return null
  }

  const hasContentStarted = msg.content && msg.content.length > 0

  return (
    <div className={`flex items-end gap-2 px-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {isUser ? (
        user ? (
          <PurpleLink to={`/profile/${user._id}`}>
            <img src={user.avatarUrl} alt={user.name || "Usuário"} className="w-8 h-8 rounded-full object-cover" />
          </PurpleLink>
        ) : (
          <div className="w-8 h-8 rounded-full bg-lightBg-tertiary dark:bg-darkBg-tertiary flex items-center justify-center">
            <UserRound size={20} className="text-lightFg-secondary dark:text-darkFg-secondary" />
          </div>
        )
      ) : (
        <img src="/denkitsu.png" alt="Denkitsu" className="w-8 h-8 rounded-full object-cover" />
      )}
      <div className="max-w-[90%] sm:max-w-[67%] md:max-w-[75%] lg:max-w-[90%] break-words rounded-md px-4 py-2 shadow-[6px_6px_16px_rgba(0,0,0,0.5)] text-lightFg-secondary dark:text-darkFg-secondary bg-lightBg-secondary dark:bg-darkBg-secondary opacity-75 dark:opacity-90">
        {isAssistant && msg.reasoning && <Markdown loading={loading} content={msg.reasoning} think />}

        {isAssistant && msg.toolCalls?.length > 0 && (
          <div className={`my-2 p-2 bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-md ${!hasContentStarted ? 'animate-pulse' : ''}`}>
            <div className="flex flex-col gap-1">
              {msg.toolCalls.map((call) => (
                <div key={call.index || call.name} className="flex items-center gap-2 text-sm text-lightFg-secondary dark:text-darkFg-secondary">
                  {hasContentStarted
                    ? <CheckCircle size={14} className="text-green-base" />
                    : <Wrench size={14} className="animate-spin-fast" />
                  }
                  <span>{hasContentStarted ? 'Ferramenta usada:' : 'Usando a ferramenta'} <strong>{call.name}</strong></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && !hasContentStarted && msg.toolCalls?.length === 0 ? <Button variant="outline" size="icon" $rounded loading={true} disabled /> : renderContent()}

        {msg.timestamp && (
          <small className="ml-auto pl-2 text-xs text-lightFg-secondary dark:text-darkFg-secondary whitespace-nowrap">
            {new Date(msg.timestamp).toLocaleString("pt-BR")}
          </small>
        )}
        {!loading && isAssistant && (
          <AIReactions message={msg} toggleLousa={toggleLousa} onRegenerate={onRegenerate} isLastMessage={isLastMessage} />
        )}
      </div>
    </div>
  )
}

export default memo(AIMessage)
