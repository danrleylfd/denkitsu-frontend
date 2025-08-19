import { memo } from "react"
import { UserRound, Wrench, CheckCircle, AlertTriangle, BrainCircuit, Bot } from "lucide-react"
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

  const renderToolStatus = () => {
    if (!msg.toolStatus) return null

    const { state, tools, message, error } = msg.toolStatus
    const toolNames = tools?.join(", ")

    switch (state) {
      case "decided":
        return <div className="flex items-center gap-2 text-sm"><Bot size={14} /><span>A IA decidiu usar: <strong>{toolNames}</strong></span></div>
      case "executing":
        return <div className="flex items-center gap-2 text-sm animate-pulse"><Wrench size={14} className="animate-spin-fast" /><span>A executar: <strong>{toolNames}</strong>...</span></div>
      case "processing":
        return <div className="flex items-center gap-2 text-sm animate-pulse"><BrainCircuit size={14} /><span>{message}</span></div>
      case "error":
        return <div className="flex items-center gap-2 text-sm text-red-base"><AlertTriangle size={14} /><span>Erro na ferramenta: {error}</span></div>
      case "finished":
        return <div className="flex items-center gap-2 text-sm text-green-base"><CheckCircle size={14} /><span>Ferramentas usadas: <strong>{toolNames}</strong></span></div>
      default:
        return null
    }
  }

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

        {isAssistant && msg.toolStatus && (
          <div className="my-2 p-2 bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-md">
            {renderToolStatus()}
          </div>
        )}

        {loading && !msg.content && !msg.toolStatus ? <Button variant="outline" size="icon" $rounded loading={true} disabled /> : renderContent()}

        {msg.timestamp && (
          <small className="ml-auto pl-2 text-xs text-lightFg-secondary dark:text-darkFg-secondary whitespace-nowrap">
            {new Date(msg.timestamp).toLocaleString("pt-BR")}
          </small>
        )}
        {!loading && isAssistant && msg.content && (
          <AIReactions message={msg} toggleLousa={toggleLousa} onRegenerate={onRegenerate} isLastMessage={isLastMessage} />
        )}
      </div>
    </div>
  )
}

export default memo(AIMessage)
