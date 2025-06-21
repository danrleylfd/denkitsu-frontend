import { useState } from "react"
import { LuCode, LuCopy, LuKanban, LuNewspaper, LuEye, LuPresentation } from "react-icons/lu"

import { useTasks } from "../contexts/TasksContext"
import { publishNews } from "../services/news"

import Button from "./Button"

const MessageActions = ({ message, onShowCanva }) => {
  const [loading, setLoading] = useState(false)
  const [loadingType, setLoadingType] = useState(null)
  const { setTasks } = useTasks()

  const extractCodeFromMarkdown = (markdown) => {
    const codeRegex = /^```(\w*)\n([\s\S]+?)\n^```/gm
    const matches = [...markdown.matchAll(codeRegex)]
    return matches.map((match) => match[2].trim()).join("\n\n")
  }

  const codeToCopy = () => extractCodeFromMarkdown(message.content)

  const handleCopy = (text, type) => {
    setLoading(true)
    setLoadingType(type)
    navigator.clipboard.writeText(text)
    setTimeout(() => {
      setLoading(false)
      setLoadingType(null)
    }, 333)
  }

  const handleAddToKanban = () => {
    const contentMessage = codeToCopy || message.content
    const newTasks = JSON.parse(contentMessage).map((content, index) => ({
      id: `task-${Date.now()}-${index}`,
      content
    }))
    setTasks((prev) => ({ ...prev, todo: [...prev.todo, ...newTasks] }))
  }

  const handlePublish = async () => {
    setLoading(true)
    setLoadingType("news")
    try {
      const contentParts = message.content.split("**Fonte(s):**")
      let source = `Denkitsu ${new Date().toLocaleString()}`
      if (contentParts.length > 1 && contentParts[1]) {
        const sourceText = contentParts[1]
        const urlRegex = /\((https?:\/\/[^\s)]+)\)/
        const match = sourceText.match(urlRegex)
        if (match && match[1]) {
          source = match[1]
        }
      }
      const newArticle = await publishNews(message.content, source)
    } catch (error) {
    } finally {
      setLoading(false)
      setLoadingType(null)
    }
  }

  const handlePreview = () => {
    setLoading(true)
    setLoadingType("preview")
    setTimeout(() => {
      setLoading(false)
      setLoadingType(null)
      onShowCanva(codeToCopy)
    }, 333)
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      {message.reasoning && (
        <Button variant="secondary" size="icon" $rounded onClick={() => handleCopy(message.reasoning, "reasoning")} loading={loadingType === "reasoning" && loading} title="Copiar Linha de Raciocínio">
          {loadingType !== "reasoning" && <LuCopy size={16} />}
        </Button>
      )}
      <Button variant="secondary" size="icon" $rounded onClick={() => handleCopy(message.content, "content")} loading={loadingType === "content" && loading} title="Copiar Resposta">
        {loadingType !== "content" && <LuCopy size={16} />}
      </Button>
      {codeToCopy && (
        <>
          <Button variant="secondary" size="icon" $rounded onClick={() => handleCopy(codeToCopy(), "code")} loading={loadingType === "code" && loading} title="Copiar Código">
            {loadingType !== "code" && <LuCode size={16} />}
          </Button>
          <Button variant="outline" size="icon" $rounded onClick={handlePreview} loading={loadingType === "preview" && loading} title="Visualizar Página">
            {loadingType !== "preview" && <LuPresentation size={16} />}
          </Button>
        </>
      )}
      <Button variant="warning" size="icon" $rounded onClick={handleAddToKanban} loading={loadingType === "kanban" && loading} title="Adicionar ao Kanban">
        {loadingType !== "kanban" && <LuKanban size={16} />}
      </Button>
      <Button variant="success" size="icon" $rounded onClick={handlePublish} loading={loadingType === "news" && loading} title="Publicar Artigo">
        {loadingType !== "news" && <LuNewspaper size={16} />}
      </Button>
    </div>
  )
}

export default MessageActions
