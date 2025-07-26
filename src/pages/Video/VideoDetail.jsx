import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, Pencil, Trash } from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"

import { getVideoById, deleteVideoById, likeVideo, unlikeVideo, shareVideo, addComment, replyToComment, getCommentsForVideo } from "../../services/video"

import SideMenu from "../../components/SideMenu"
import VideoPlayer from "../../components/Video/Player"
import Button from "../../components/Button"
import CommentForm from "../../components/CommentForm"
import CommentItem from "../../components/CommentItem"
import PurpleLink from "../../components/Embeds/PurpleLink"

const ContentView = ({ children, ...props }) => (
  <main
    {...props}
    className="flex flex-col items-center p-2 gap-2 mx-auto w-full xs:max-w-[100%] sm:max-w-[90%] ml-[3.5rem] md:max-w-[75%] lg:max-w-[100%]">
    {children}
  </main>
)

const VideoDetail = () => {
  const { videoId } = useParams()
  const { signed, user } = useAuth()
  const { notifySuccess, notifyWarning, notifyError } = useNotification()
  const [video, setVideo] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [shareCount, setShareCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)

  const fetchVideoAndComments = useCallback(async () => {
    try {
      setLoading(true)
      const videoData = await getVideoById(videoId)
      setVideo(videoData)
      setLikeCount(videoData.likes?.length || 0)
      setCommentCount(videoData.comments?.length || 0)
      setShareCount((videoData.shares?.length || 0) + (videoData.sharesExtras || 0))
      const commentsData = await getCommentsForVideo(videoId)
      setComments(commentsData || [])
      setCommentCount(commentsData?.length || 0)
      if (signed && videoData.likes?.includes(user?._id)) setIsLiked(true)
      else setIsLiked(false)
    } catch (err) {
      console.error(err)
      notifyError("Falha ao carregar detalhes do vídeo ou comentários.")
      setVideo(null)
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [videoId, signed, user?._id, notifyError])

  useEffect(() => {
    if (videoId) fetchVideoAndComments()
  }, [videoId, fetchVideoAndComments])

  const handleDeleteVideo = async () => {
    if (!signed) return notifyWarning("Você precisa estar logado para excluir um vídeo.")
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este vídeo? Você perderá todas as curtidas, comentários e compartilhamentes relacionados a este vídeo."
    )
    if (!confirmDelete) return
    setLoading(true)
    try {
      await deleteVideoById(videoId)
      notifySuccess("Vídeo excluído com sucesso!")
      setLoading(false)
      window.location.href = "/my-videos"
    } catch (error) {
      console.error("Erro ao excluir vídeo:", error)
      notifyError("Falha ao excluir vídeo.")
      setLoading(false)
    }
  }

  const handleLikeToggle = async () => {
    if (!signed) return notifyWarning("Você precisa estar logado para interagir.")
    setLoading(true)
    const originalIsLiked = isLiked
    const originalLikeCount = likeCount
    setIsLiked(!originalIsLiked)
    setLikeCount(originalIsLiked ? originalLikeCount - 1 : originalLikeCount + 1)
    try {
      if (originalIsLiked) await unlikeVideo(videoId)
      else await likeVideo(videoId)
    } catch (err) {
      setIsLiked(originalIsLiked)
      setLikeCount(originalLikeCount)
      console.error("Erro ao curtir/descurtir:", err)
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Ocorreu um erro ao processar sua curtida.")
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!signed) return notifyWarning("Você precisa estar logado para compartilhar vídeos.")
    setLoading(true)
    const originalShareCount = shareCount
    setShareCount(originalShareCount + 1)
    try {
      await shareVideo(videoId)
    } catch (err) {
      setShareCount(originalShareCount)
      console.error("Erro ao compartilhar:", err)
      notifyError("Ocorreu um erro ao compartilhar o vídeo.")
    } finally {
      setLoading(false)
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Ocorreu um erro ao compartilhar o vídeo.")
    }
  }

  const handleAddComment = async (content) => {
    if (!signed) {
      notifyWarning("Você precisa estar logado para comentar.")
      throw new Error("User not signed in")
    }
    try {
      const newComment = await addComment(videoId, content)
      setComments((prevComments) => [newComment, ...prevComments])
      setCommentCount((prev) => prev + 1)
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Falha ao adicionar comentário.")
      throw err
    }
  }

  const handleDeleteComment = (commentId) => {
    setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId))
    setCommentCount((prev) => prev - 1)
  }

  const handleAddReply = async (commentId, replyContent) => {
    if (!signed) notifyWarning("Você precisa estar logado para responder.")
    try {
      const reply = await replyToComment(commentId, replyContent)
      fetchVideoAndComments()
      return reply
    } catch (error) {
      console.error("Erro ao adicionar resposta:", error)
      notifyError("Falha ao adicionar resposta.")
      throw error
    }
  }

  return (
    <SideMenu fixed ContentView={ContentView} className="bg-lightBg-primary dark:bg-darkBg-primary min-h-screen">
      {loading && <Button variant="outline" style={{ marginTop: ".5rem" }} $rounded loading={loading} disabled />}
      {video && (
        <div className="flex flex-col py-2 gap-2 w-full sm:max-w-lg md:max-w-2xl">
          <VideoPlayer src={video.fileUrl} poster={video.thumbnail} />
          <h5 className="text-lightFg-primary dark:text-darkFg-primary">
            {video.content}
          </h5>
          {video.user && (
            <div className="flex flex-row items-center gap-2">
              <img className="w-8 h-8 rounded-full" src={video.user.avatarUrl} alt={video.user.name} />
              <PurpleLink to={`/profile/${video.user._id}`}>
                {video.user.name}
              </PurpleLink>
              <small className="font-medium text-lightFg-tertiary dark:text-darkFg-tertiary">
                {new Date(video.createdAt).toLocaleString()}
              </small>
            </div>
          )}
          <div className="flex flex-row items-center gap-2 ">
            <Button
              type="button"
              variant={isLiked ? "danger" : "primary"}
              size="icon"
              $rounded
              title={isLiked ? "Descurtir" : "Curtir"}
              onClick={handleLikeToggle}
              disabled={loading}>
              {isLiked ? <ThumbsDown size={16} /> : <ThumbsUp size={16} />}
            </Button>
            <Button type="button" size="icon" $rounded title="Compartilhar" onClick={handleShare} disabled={loading}>
              <Share2 size={16} />
            </Button>
            <Button variant="secondary" $rounded disabled>
              {likeCount} <ThumbsUp size={16} /> / {commentCount} <MessageCircle size={16} /> / {shareCount} <Share2 size={16} />
            </Button>
            {video.user._id === user?._id && (
              <>
                <Button type="button" variant="warning" size="icon" $rounded title="Editar" disabled={true}>
                  <Pencil size={16} />
                </Button>
                <Button type="button" variant="danger" size="icon" $rounded title="Deletar" onClick={handleDeleteVideo}>
                  <Trash size={16} />
                </Button>
              </>
            )}
          </div>
          <MessageCircle className="text-lightFg-primary dark:text-darkFg-primary" size={16} />
          <CommentForm onSubmit={handleAddComment} />
          <div className="flex flex-col gap-2">
            {loading && comments.length === 0 && <Button variant="outline" $rounded loading={loading} disabled />}
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                videoId={videoId}
                disabled={loading}
                onCommentDeleted={handleDeleteComment}
                onReplyAdded={handleAddReply}
              />
            ))}
          </div>
        </div>
      )}
    </SideMenu>
  )
}

export default VideoDetail
