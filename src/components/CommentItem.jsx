import { useState, useEffect } from "react"
import { Pencil, Trash, MessageCircleReply, X } from "lucide-react"

import { useAuth } from "../contexts/AuthContext"
import { useNotification } from "../contexts/NotificationContext"

import { deleteComment, getRepliesForComment } from "../services/video"

import CommentForm from "./CommentForm"
import Button from "./Button"
import PurpleLink from "./Embeds/PurpleLink"

const CommentItem = ({ comment, videoId, onCommentDeleted, onReplyAdded, disabled }) => {
  const { user, signed } = useAuth()
  const { notifyError } = useNotification()
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
    setReplies((prev) => prev.filter((c) => c._id !== commentId))
  }

  const handleDelete = async () => {
    if (!isAuthor) return
    const isReply = !!comment.parent
    const message = isReply
      ? "Tem certeza que deseja excluir esta resposta?"
      : "Tem certeza que deseja excluir este comentário e todas as suas respostas?"
    if (!window.confirm(message)) return
    try {
      await deleteComment(videoId, comment._id)
      onCommentDeleted(comment._id)
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Falha ao deletar o comentário.")
    }
  }

  return (
    <div className="bg-lightBg-secondary dark:bg-darkBg-secondary flex flex-col gap-2 p-4 rounded-md">
      <div className="flex items-center gap-2">
        <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-8 h-8 rounded-full" />
        <div className="flex gap-1 align-middle justify-center">
          <PurpleLink to={`/profile/${comment.user._id}`}>
            {comment.user.name}
          </PurpleLink>
          <small className="font-medium text-lightFg-tertiary dark:text-darkFg-tertiary">
            {new Date(comment.createdAt).toLocaleString()}
          </small>
        </div>
      </div>
      <p className="text-lightFg-primary dark:text-darkFg-primary text-md break-words">
        {comment.content}
      </p>
      <div className="flex gap-2">
        {signed && !comment.parent && (
          <Button
            variant="secondary"
            size="icon"
            $rounded
            title={showReplyForm ? "Cancelar" : "Responder"}
            onClick={() => setShowReplyForm(!showReplyForm)}
            disabled={disabled}>
            {showReplyForm ? <X size={16} /> : <MessageCircleReply size={16} />}
          </Button>
        )}
        {isAuthor && (
          <>
            <Button variant="warning" size="icon" $rounded title="Editar" onClick={() => {}} disabled>
              <Pencil size={16} />
            </Button>
            <Button type="submit" variant="danger" size="icon" $rounded title="Deletar" onClick={handleDelete} disabled={disabled}>
              <Trash size={16} />
            </Button>
          </>
        )}
      </div>
      {showReplyForm && (
        <>
          <CommentForm onSubmit={handleReplySubmit} className="px-0 py-0" />
          {replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              videoId={videoId}
              onCommentDeleted={handleDeleteReply}
              onReplyAdded={() => {}}
              disabled={disabled}
            />
          ))}
        </>
      )}
    </div>
  )
}

export default CommentItem
