import { useState } from "react"
import { MdComment } from "react-icons/md"

import Input from "./Input"
import Button from "./Button"

const CommentForm = ({ onSubmit, placeholder = "Digite seu comentário", actionLabel = "Comentar", disabled, className = "" }) => {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      await onSubmit(content)
      setContent("")
    } catch (error) {
      console.error("Error submitting comment/reply:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-lightBg-secondary dark:bg-darkBg-secondary flex items-center gap-2 p-4 rounded-md ${className}`}
    >
      <Input
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      >
        <Button
          type="submit"
          variant="outline"
          size="icon"
          $rounded
          title={actionLabel}
          loading={loading}
          disabled={disabled || loading || !content.trim()}
        >
          {!loading && <MdComment size={16} />}
        </Button>
      </Input>
    </form>
  )
}

export default CommentForm
