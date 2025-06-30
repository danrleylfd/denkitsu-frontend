import { memo } from "react"
import Markdown from "./Markdown"
import MessageActions from "./MessageActions"
import Button from "./Button"
import PurpleLink from "./PurpleLink"

const ChatMessage = ({ msg, user, onShowCanva, loading }) => {
  const isSystem = msg.role === "system"
  if (isSystem) return null

  const isAssistant = msg.role === "assistant"
  const isUser = msg.role === "user"

  return (
    <div className={`flex items-end gap-2 px-2 ${isUser ? "flex-row-reverse" : "flex-row"}`} data-oid="bay-ta1">
      {isUser ? (
        <PurpleLink to={`/profile/${user._id}`} data-oid="g_kqxqv">
          <img src={user.avatarUrl} alt={msg.role} className="w-8 h-8 rounded-full object-cover" data-oid="_qq9.3c" />
        </PurpleLink>
      ) : (
        <img src="/denkitsu.png" alt={msg.role} className="w-8 h-8 rounded-full object-cover" data-oid="w44go73" />
      )}
      <div
        className="max-w-[90%] md:max-w-[67%] break-words rounded-md px-4 py-2 shadow-[6px_6px_16px_rgba(0,0,0,0.5)] text-lightFg-secondary dark:text-darkFg-secondary bg-lightBg-secondary dark:bg-darkBg-secondary opacity-75 dark:opacity-90"
        data-oid="b7t7x51">
        {isAssistant && msg.reasoning && <Markdown content={msg.reasoning} think data-oid="zf0dl1v" />}

        {loading && !msg.content ? (
          <Button variant="outline" size="icon" $rounded loading={true} disabled data-oid="6r2v0xi" />
        ) : (
          <Markdown key={msg.content} content={msg.content} data-oid=".yvyouz" />
        )}

        {!loading && isAssistant && <MessageActions message={msg} onShowCanva={onShowCanva} data-oid="gzlk10s" />}
      </div>
    </div>
  )
}

export default memo(ChatMessage)
