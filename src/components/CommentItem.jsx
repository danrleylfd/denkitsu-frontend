import { useState, useEffect } from "react"
import { MdReply, MdOutlineClose, MdEdit, MdDelete } from "react-icons/md"

import { useAuth } from "../contexts/AuthContext"
import { deleteComment, getRepliesForComment } from "../services/video"

import CommentForm from "./CommentForm"
import Button from "./Button"
import PurpleLink from "./PurpleLink"

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
    setReplies((prev) => prev.filter((c) => c._id !== commentId))
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
    <div className="bg-lightBg-secondary dark:bg-darkBg-secondary flex flex-col gap-2 p-4 rounded-md" data-oid="pj1hmnc">
      <div className="flex items-center gap-2" data-oid="t-vzl4a">
        <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-8 h-8 rounded-full" data-oid="7h53xnm" />

        <div className="flex gap-1 align-middle justify-center" data-oid="5dmsmf6">
          <PurpleLink to={`/profile/${comment.user._id}`} data-oid="x01kij-">
            {comment.user.name}
          </PurpleLink>
          <small className="font-medium text-lightFg-tertiary dark:text-darkFg-tertiary" data-oid="aq.9.m2">
            {new Date(comment.createdAt).toLocaleString()}
          </small>
        </div>
      </div>
      <p className="text-lightFg-primary dark:text-darkFg-primary text-md break-words" data-oid="q6.ze2o">
        {comment.content}
      </p>
      <div className="flex gap-2" data-oid="937me0i">
        {signed && !comment.parent && (
          <Button
            variant="secondary"
            size="icon"
            $rounded
            title={showReplyForm ? "Cancelar" : "Responder"}
            onClick={() => setShowReplyForm(!showReplyForm)}
            disabled={disabled}
            data-oid="sz_5-ah">
            {showReplyForm ? <MdOutlineClose size={16} data-oid="4n06252" /> : <MdReply size={16} data-oid="g0v90.q" />}
          </Button>
        )}
        {isAuthor && (
          <>
            <Button variant="warning" size="icon" $rounded title="Editar" onClick={() => {}} disabled data-oid="fy2q5w7">
              <MdEdit size={16} data-oid="6j8.ig1" />
            </Button>
            <Button type="submit" variant="danger" size="icon" $rounded title="Deletar" onClick={handleDelete} disabled={disabled} data-oid="m0d4j_z">
              <MdDelete size={16} data-oid="sx0e:6i" />
            </Button>
          </>
        )}
      </div>
      {showReplyForm && (
        <>
          <CommentForm onSubmit={handleReplySubmit} className="px-0 py-0" data-oid="h9bfrtp" />
          {replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              videoId={videoId}
              onCommentDeleted={handleDeleteReply}
              onReplyAdded={() => {}}
              disabled={disabled}
              data-oid="a6z.r5w"
            />
          ))}
        </>
      )}
    </div>
  )
}

export default CommentItem
