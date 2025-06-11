import { useState, useEffect, useCallback } from "react"
import { Link, useParams } from "react-router-dom"
import { MdThumbUp, MdThumbDown, MdComment, MdShare, MdEdit, MdDelete } from "react-icons/md"

import { useAuth } from "../../contexts/AuthContext"
import {
  getVideoById,
  deleteVideoById,
  likeVideo,
  unlikeVideo,
  shareVideo,
  addComment,
  // deleteComment,
  replyToComment,
  // deleteReply,
  getCommentsForVideo
} from "../../services/video"

import SideMenu from "../../components/SideMenu"
import MainContainer from "../../components/MainContainer"
import Player from "../../components/Player"
import Button from "../../components/Button"
import CommentForm from "../../components/CommentForm"
import CommentItem from "../../components/CommentItem"
import { MessageSuccess, MessageError } from "../../components/Notifications"

const SideContentContainer = (props) => (
  <div
    {...props}
    className="flex h-screen flex-1 flex-col items-center justify-start gap-2 p-2 max-w-[89%] ml-[3.5rem] md:mx-auto md:max-w-[67%]"
  />
)

const VideoDetail = () => {
  const { videoId } = useParams()
  const { signed, user } = useAuth()
  const [video, setVideo] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [shareCount, setShareCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)

  const fetchVideoAndComments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const videoData = await getVideoById(videoId)
      setVideo(videoData)
      setLikeCount(videoData.likes?.length || 0)
      setCommentCount(videoData.comments?.length || 0)
      setShareCount((videoData.shares?.length || 0) + (videoData.sharesExtras || 0))

      const commentsData = await getCommentsForVideo(videoId)
      setComments(commentsData || [])
      setCommentCount(commentsData?.length || 0)

      if (signed && videoData.likes?.includes(user?._id)) {
        setIsLiked(true)
      } else {
        setIsLiked(false)
      }
    } catch (err) {
      setError("Falha ao carregar detalhes do vídeo ou comentários.")
      console.error(err)
      setVideo(null)
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [videoId, signed, user?._id])

  useEffect(() => {
    if (videoId) {
      fetchVideoAndComments()
    }
  }, [videoId, fetchVideoAndComments])

  const handleDeleteVideo = async () => {
    if (!signed) {
      alert("Você precisa estar logado para excluir um vídeo.")
      return
    }
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este vídeo? Você perderá todas as curtidas, comentários e compartilhamentes relacionados a este vídeo."
    )
    if (!confirmDelete) return
    setLoading(true)
    try {
      await deleteVideoById(videoId)
      alert("Vídeo excluído com sucesso!")
      setLoading(false)
      window.location.href = "/my-videos"
    } catch (error) {
      console.error("Erro ao excluir vídeo:", error)
      alert("Falha ao excluir vídeo.")
      setLoading(false)
    }
  }

  const handleLikeToggle = async () => {
    setLoading(true)
    const originalIsLiked = isLiked
    const originalLikeCount = likeCount
    setIsLiked(!originalIsLiked)
    setLikeCount(originalIsLiked ? originalLikeCount - 1 : originalLikeCount + 1)
    try {
      if (originalIsLiked) await unlikeVideo(videoId)
      else await likeVideo(videoId)
      setLoading(false)
    } catch (err) {
      console.error("Erro ao curtir/descurtir:", err)
      alert("Ocorreu um erro ao processar sua curtida.")
      setIsLiked(originalIsLiked)
      setLikeCount(originalLikeCount)
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!signed) {
      alert("Você precisa estar logado para compartilhar vídeos.")
      return
    }
    setLoading(true)
    const originalShareCount = shareCount
    setShareCount(originalShareCount + 1)
    try {
      await shareVideo(videoId)
      setLoading(false)
    } catch (err) {
      console.error("Erro ao compartilhar:", err)
      alert("Ocorreu um erro ao compartilhar o vídeo.")
      setShareCount(originalShareCount)
      setLoading(false)
    }
  }

  const handleAddComment = async (content) => {
    if (!signed) {
      alert("Você precisa estar logado para comentar.")
      return
    }
    setLoading(true)
    try {
      const newComment = await addComment(videoId, content)
      setComments((prevComments) => [newComment, ...prevComments])
      setCommentCount((prev) => prev + 1)
      setLoading(false)
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error)
      alert("Falha ao adicionar comentário.")
      setLoading(false)
      throw error
    }
  }

  const handleDeleteComment = (commentId) => {
    setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId))
    setCommentCount((prev) => prev - 1)
  }

  const handleAddReply = async (commentId, replyContent) => {
    if (!signed) {
      alert("Você precisa estar logado para responder.")
      return
    }
    try {
      const reply = await replyToComment(commentId, replyContent)
      fetchVideoAndComments()
      return reply
    } catch (error) {
      console.error("Erro ao adicionar resposta:", error)
      alert("Falha ao adicionar resposta.")
      throw error
    }
  }

  return (
    <SideMenu fixed ContentView={SideContentContainer}>
      {loading && <Button variant="outline" style={{ marginTop: ".5rem" }} $rounded loading={loading} disabled />}
      {error && <MessageError>{error}</MessageError>}
      {!error && video && (
        <MainContainer>
          <Player src={video.fileUrl} poster={video.thumbnail}/>
          <h5>{video.content}</h5>
          {video.user && (
            <div className="flex flex-row items-center gap-2 py-2">
              <img className="w-6 h-6 rounded-full" src={video.user.avatarUrl} alt={video.user.name} />
              <Link to={`/profile/${video.user._id}`}>{video.user.name}</Link>
              <small>Publicou em {new Date(video.createdAt).toLocaleString()}</small>
            </div>
          )}
          <div className="flex flex-row items-center gap-2 py-2">
            <Button type="button" variant={isLiked ? "danger" : "primary"} size="icon" $rounded title={isLiked ? "Descurtir" : "Curtir"} onClick={handleLikeToggle} disabled={loading}>
              {isLiked?  <MdThumbDown size={16}/> : <MdThumbUp size={16}/>}
            </Button>
            <Button type="button" size="icon" $rounded title="Compartilhar" onClick={handleShare} disabled={loading}>
              <MdShare size={16}/>
            </Button>
            <Button variant="secondary" $rounded disabled>{likeCount} <MdThumbUp /> / {commentCount} <MdComment /> / {shareCount} <MdShare /></Button>
            {video.user._id === user?._id && (
              <>
                <Button type="button" variant="warning" size="icon" $rounded title="Editar" disabled={true}>
                  <MdEdit size={16}/>
                </Button>
                <Button type="button" variant="danger" size="icon" $rounded title="Deletar" onClick={handleDeleteVideo}>
                  <MdDelete size={16}/>
                </Button>
              </>
            )}
          </div>
          <div className="flex flex-col gap-2 py-2">
          <MdComment size={22}/>
            <div style={{ padding: "0 1rem" }}>
              <CommentForm onSubmit={handleAddComment} />
            </div>
            <div className="flex flex-col gap-2 py-2">
              {loading && comments.length === 0 && <Button variant="outline" $rounded loading={loading} disabled />}
              {!loading && comments.length === 0 && <MessageSuccess>Nenhum comentário ainda. Seja o primeiro!</MessageSuccess>}
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
        </MainContainer>
      )}
    </SideMenu>
  )
}

export default VideoDetail
