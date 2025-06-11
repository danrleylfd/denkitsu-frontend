import { useState } from "react"
import { MdComment } from "react-icons/md"

import Input from "../Input"
import Button from "../Button"
import { FormStyled } from "./styles"

const CommentForm = ({ onSubmit, placeholder = "Digite seu comentário", actionLabel = "Comentar", disabled }) => {
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
    <FormStyled onSubmit={handleSubmit}>
      <Input
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      >
        <Button type="submit" variant="outline" size="icon" $rounded title="Comentar" loading={loading} disabled={disabled || loading || !content.trim()}>
          {!loading && <MdComment size={16}/>}
        </Button>
      </Input>
    </FormStyled>
  )
}

export default CommentForm
