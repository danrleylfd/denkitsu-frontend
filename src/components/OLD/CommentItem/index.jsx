import { useState, useEffect } from "react"
import { MdReply, MdOutlineClose, MdEdit, MdDelete } from "react-icons/md"
import { useAuth } from "../../contexts/AuthContext"
import { deleteComment, deleteReply } from "../../services/video"
import CommentForm from "../CommentForm"
import Button from "../Button"
import { CommentStyled, Avatar } from "./styles"
import { Link } from "react-router-dom"
import { getRepliesForComment } from "../../services/video"

const CommentItem = ({ comment, videoId, onCommentDeleted, onReplyAdded, disabled }) => {
  const { user, signed } = useAuth()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replies, setReplies] = useState([])
  const isAuthor = signed && user?._id === comment.user?._id

  const fetchReplies = async () => {
    try {
      const fetchedReplies = await getRepliesForComment(comment._id)
      setReplies(fetchedReplies)
    } catch (error) {
      console.error("Erro ao buscar respostas:", error)
    }
  }
  useEffect(() => {
    fetchReplies()
  }, [])

  const handleReplySubmit = async (replyContent) => {
    await onReplyAdded(comment._id, replyContent)
    fetchReplies()
  }

  const handleDeleteReply = (commentId) => {
    setReplies((prevComments) => prevComments.filter((comment) => comment._id !== commentId))
  }

  const handleDelete = async () => {
    if (!isAuthor) return
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este comentário e todas as suas respostas?")
    if (confirmDelete) {
      try {
        await deleteComment(videoId, comment._id)
        onCommentDeleted(comment._id)
      } catch (error) {
        console.error("Erro ao excluir comentário/resposta:", error)
        alert("Falha ao deletar.")
      }
    }
  }

  return (
    <CommentStyled style={comment.parent && { marginLeft: "30px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar src={comment.user.avatarUrl} alt={comment.user.name} />
        <Link to={`/profile/${comment.user._id}`}>{comment.user.name}</Link>
      </div>
      <p>{comment.content}</p>
      <small>{new Date(comment.createdAt).toLocaleString()}</small>
      <div style={{ display: "flex", gap: 8 }}>
        {signed && !comment.parent && (
          <Button variant="secondary" size="icon" $rounded title={showReplyForm ? "Cancelar" : "Responder"} onClick={() => setShowReplyForm(!showReplyForm)} disabled={disabled}>
            {showReplyForm ? <MdOutlineClose size={16}/> : <MdReply size={16}/>}
          </Button>
        )}
        {isAuthor && (
          <>
            <Button variant="warning" size="icon" $rounded title="Editar" onClick={() => {}} disabled>
              <MdEdit size={16}/>
            </Button>
            <Button type="submit" variant="danger" size="icon" $rounded title="Deletar" onClick={handleDelete} disabled={disabled}>
              <MdDelete size={16}/>
            </Button>
          </>
        )}
      </div>
      {showReplyForm && (
        <>
          <CommentForm onSubmit={handleReplySubmit}/>
          {replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              videoId={videoId}
              onCommentDeleted={handleDeleteReply}
              onReplyAdded={() => {}}
              disabled={disabled} />
          ))}
        </>
      )}
    </CommentStyled>
  )
}

export default CommentItem
