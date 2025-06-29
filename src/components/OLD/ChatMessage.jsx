import { memo } from "react"
import Markdown from "../Markdown"
import MessageActions from "../MessageActions"
import Button from "../Button"
import PurpleLink from "../PurpleLink"

const ChatMessage = ({ msg, user, onShowCanva, loading }) => {
  const isSystem = msg.role === "system"
  if (isSystem) return null // ${isAssistant ? "flex-row" : "flex-row-reverse"}`} {isAssistant ? "/denkitsu.png" : user.avatarUrl}
  const isAssistant = msg.role === "assistant"
  const isUser = msg.role === "user"
  return (
    <div className={`flex items-end gap-2 px-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {isUser ? (
        <PurpleLink to={`/profile/${user._id}`}>
          <img
            src={user.avatarUrl}
            alt={msg.role}
            className="w-8 h-8 rounded-full object-cover"
          />
        </PurpleLink>
      ) : (
        <img
          src="/denkitsu.png"
          alt={msg.role}
          className="w-8 h-8 rounded-full object-cover"
        />
      )}
      <div className="max-w-[90%] md:max-w-[67%] break-words rounded-md px-4 py-2 shadow-[6px_6px_16px_rgba(0,0,0,0.5)] text-lightFg-secondary dark:text-darkFg-secondary bg-lightBg-secondary dark:bg-darkBg-secondary opacity-75 dark:opacity-90">
        {isAssistant && msg.reasoning && <Markdown content={msg.reasoning} think />}
        <Markdown key={msg.content} content={msg.content} />
        {!loading && isAssistant && <MessageActions message={msg} onShowCanva={onShowCanva} />}
        {loading && !msg.reasoning && !msg.content && <Button variant="outline" size="icon" $rounded loading={loading} disabled/> }
      </div>
    </div>
  )
}

export default memo(ChatMessage)
