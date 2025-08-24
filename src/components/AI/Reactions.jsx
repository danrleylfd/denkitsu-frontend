import { useState, useMemo } from "react"
import { Code, Copy, Kanban, Newspaper, Presentation, Download, Mic, RefreshCw, Speech } from "lucide-react"

import { useAI } from "../../contexts/AIContext"
import { useTasks } from "../../contexts/TasksContext"

import { publishNews } from "../../services/news"

import Button from "../Button"

const isValidJsonStringArray = (str) => {
  if (typeof str !== "string" || !str.trim().startsWith("[") || !str.trim().endsWith("]")) {
    return false
  }
  try {
    const parsed = JSON.parse(str)
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string")
  } catch (error) {
    return false
  }
}

const getFileExtension = (lang) => {
  const langMap = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    html: "html",
    css: "css",
    markdown: "md"
  }
  return langMap[lang] || lang
}

const AIReactions = ({ message, toggleLousa, onRegenerate, isLastMessage }) => {
  const [loading, setLoading] = useState(false)
  const [loadingType, setLoadingType] = useState(null)
  const { speakResponse } = useAI()
  const { setTasks } = useTasks()

  const { allCodeToCopy, htmlBlockForPreview, kanbanableJsonString, codeBlocks } = useMemo(() => {
    if (!message?.content) {
      return { allCodeToCopy: null, htmlBlockForPreview: null, kanbanableJsonString: null, codeBlocks: [] }
    }
    const blocks = [...message.content.matchAll(/^```(\w*)\n([\s\S]+?)\n^```/gm)].map((match) => ({
      lang: match[1].toLowerCase() || "md",
      code: match[2].trim()
    }))
    const allCode = blocks.length > 0 ? blocks.map((block) => block.code).join("\n\n") : null
    const htmlBlock = blocks.find((block) => block.lang === "html") || null
    const firstCodeBlockContent = blocks.length > 0 ? blocks[0].code : null
    let kanbanJson = null
    if (firstCodeBlockContent && isValidJsonStringArray(firstCodeBlockContent)) {
      kanbanJson = firstCodeBlockContent
    } else if (!firstCodeBlockContent && isValidJsonStringArray(message.content)) {
      kanbanJson = message.content
    }
    return {
      allCodeToCopy: allCode,
      htmlBlockForPreview: htmlBlock,
      kanbanableJsonString: kanbanJson,
      codeBlocks: blocks
    }
  }, [message.content])

  const handleDownload = (code, lang) => {
    const extension = getFileExtension(lang)
    const filename = `denkitsu-code-${Date.now()}.${extension}`
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  const handleCopy = (text, type) => {
    setLoading(true)
    setLoadingType(type)
    navigator.clipboard.writeText(text)
    setTimeout(() => {
      setLoading(false)
      setLoadingType(null)
    }, 333)
  }

  const handleAddToKanban = (jsonString) => {
    const newTasks = JSON.parse(jsonString).map((content, index) => ({
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
      await publishNews(message.content, source)
    } catch (error) {
      console.error("Erro ao publicar notícia:", error)
    } finally {
      setLoading(false)
      setLoadingType(null)
    }
  }

  const hasContextualAction = !!htmlBlockForPreview || !!kanbanableJsonString || !!allCodeToCopy

  return (
    <div className="flex items-center gap-2 mt-2">
      {message.reasoning && (
        <Button
          variant="secondary"
          size="icon"
          $rounded
          onClick={() => handleCopy(message.reasoning, "reasoning")}
          loading={loadingType === "reasoning" && loading}
          title="Copiar Linha de Raciocínio">
          {loadingType !== "reasoning" && <Copy size={16} />}
        </Button>
      )}

      <Button
        variant="secondary"
        size="icon"
        $rounded
        onClick={() => handleCopy(message.content, "content")}
        title="Copiar Resposta"
        loading={loadingType === "content" && loading}>
        {loadingType !== "content" && <Copy size={16} />}
      </Button>

      <Button
        variant="secondary"
        size="icon"
        $rounded
        onClick={() => speakResponse(message.content)}
        title="Ler em voz alta"
        loading={loadingType === "speak" && loading}>
        {loadingType !== "speak" && <Speech size={16} />}
      </Button>

      {isLastMessage && (
        <Button
          variant="secondary"
          size="icon"
          $rounded
          onClick={onRegenerate}
          title="Regenerar resposta">
          <RefreshCw size={16} />
        </Button>
      )}

      {allCodeToCopy && (
        <Button
          variant="secondary"
          size="icon"
          $rounded
          onClick={() => handleCopy(allCodeToCopy, "code")}
          title="Copiar Código"
          loading={loadingType === "code" && loading}>
          {loadingType !== "code" && <Code size={16} />}
        </Button>
      )}

      {htmlBlockForPreview && (
        <Button
          variant="outline"
          size="icon"
          $rounded
          onClick={() => toggleLousa(htmlBlockForPreview.code)}
          title="Desenhar na Lousa"
          loading={loadingType === "preview" && loading}>
          {loadingType !== "preview" && <Presentation size={16} />}
        </Button>
      )}

      {codeBlocks.length === 1 && (
        <Button
          variant="danger"
          size="icon"
          $rounded
          onClick={() => handleDownload(codeBlocks[0].code, codeBlocks[0].lang)}
          title={`Salvar como .${getFileExtension(codeBlocks[0].lang)}`}>
          {loadingType !== "download" && <Download size={16} />}
        </Button>
      )}

      {kanbanableJsonString && (
        <Button
          variant="warning"
          size="icon"
          $rounded
          onClick={() => handleAddToKanban(kanbanableJsonString)}
          title="Adicionar ao Kanban"
          loading={loadingType === "kanban" && loading}>
          {loadingType !== "kanban" && <Kanban size={16} />}
        </Button>
      )}

      {!hasContextualAction && (
        <Button variant="success" size="icon" $rounded onClick={handlePublish} title="Publicar Artigo" loading={loadingType === "news" && loading}>
          {loadingType !== "news" && <Newspaper size={16} />}
        </Button>
      )}
    </div>
  )
}

export default AIReactions
