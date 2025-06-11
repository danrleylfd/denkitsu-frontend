import { useState, useEffect, useCallback } from "react"
import { Link, useParams } from "react-router-dom"
import { MdThumbUp, MdThumbDown, MdComment, MdShare, MdEdit, MdDelete } from "react-icons/md"

import { useAuth } from "../../../contexts/AuthContext"
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
} from "../../../services/video"

import SideMenu from "../../../components/SideMenu"
import MainContainer from "../../../components/MainContainer"
import Player from "../../../components/Player"
import Button from "../../../components/Button"
import CommentForm from "../../../components/CommentForm"
import CommentItem from "../../../components/CommentItem"
import { MessageSuccess, MessageError } from "../../../components/Notifications"

import { SideContentContainer, VideoPlayer, DetailContainer, InteractionContainer, AuthorAvatar } from "./styles"

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
    <SideMenu style={{ position: "fixed" }} ContentView={SideContentContainer}>
      {loading && <Button variant="outline" style={{ marginTop: ".5rem" }} $rounded loading={loading} disabled />}
      {error && <MessageError>{error}</MessageError>}
      {!error && video && (
        <MainContainer>
          <Player src={video.fileUrl} poster={video.thumbnail}></Player>
          {/* <VideoPlayer controls src={video.fileUrl} poster={video.thumbnail}>Seu navegador não suporta o elemento de vídeo.</VideoPlayer> */}
          <h5>{video.content}</h5>
          {video.user && (
            <InteractionContainer>
              <AuthorAvatar src={video.user.avatarUrl} alt={video.user.name} />
              <Link to={`/profile/${video.user._id}`}>{video.user.name}</Link>
              <small>Publicou em {new Date(video.createdAt).toLocaleString()}</small>
            </InteractionContainer>
          )}
          <InteractionContainer>
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
          </InteractionContainer>
          <DetailContainer>
          <MdComment size={22}/>
            <div style={{ padding: "0 1rem" }}>
              <CommentForm onSubmit={handleAddComment} />
            </div>
            <DetailContainer>
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
            </DetailContainer>
          </DetailContainer>
        </MainContainer>
      )}
    </SideMenu>
  )
}

export default VideoDetail
