import { memo } from "react"

import Markdown from "../Markdown"
import MessageActions from "../MessageActions"
import Button from "../Button"
import PurpleLink from "../PurpleLink"

const AIMessage = ({ msg, user, toggleLousa, loading }) => {
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

  return (
    <div className={`flex items-end gap-2 px-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {isUser ? (
        <PurpleLink to={`/profile/${user._id}`}>
          <img src={user.avatarUrl} alt={msg.role} className="w-8 h-8 rounded-full object-cover" />
        </PurpleLink>
      ) : (
        <img src="/denkitsu.png" alt={msg.role} className="w-8 h-8 rounded-full object-cover" />
      )}
      <div className="max-w-[90%] md:max-w-[67%] break-words rounded-md px-4 py-2 shadow-[6px_6px_16px_rgba(0,0,0,0.5)] text-lightFg-secondary dark:text-darkFg-secondary bg-lightBg-secondary dark:bg-darkBg-secondary opacity-75 dark:opacity-90">
        {isAssistant && msg.reasoning && <Markdown content={msg.reasoning} think />}
        {loading && !msg.content ? <Button variant="outline" size="icon" $rounded loading={true} disabled /> : renderContent()}
        {!loading && isAssistant && <MessageActions message={msg} toggleLousa={toggleLousa} />}
      </div>
    </div>
  )
}

export default memo(AIMessage)
