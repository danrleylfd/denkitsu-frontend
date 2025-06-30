import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import { MdThumbUp, MdThumbDown, MdComment, MdShare, MdEdit, MdDelete } from "react-icons/md"

import { useAuth } from "../contexts/AuthContext"
import { getVideoById, deleteVideoById, likeVideo, unlikeVideo, shareVideo, addComment, replyToComment, getCommentsForVideo } from "../services/video"

import SideMenu from "../components/SideMenu"
import Player from "../components/Player"
import Button from "../components/Button"
import CommentForm from "../components/CommentForm"
import CommentItem from "../components/CommentItem"
import { MessageSuccess, MessageError } from "../components/Notifications"
import PurpleLink from "../components/PurpleLink"

const ContentView = ({ children, ...props }) => (
  <main
    {...props}
    className="flex flex-col items-center p-2 gap-2 mx-auto w-full xs:max-w-[100%] sm:max-w-[90%] ml-[3.5rem] md:max-w-[75%] lg:max-w-[100%]"
    data-oid="ynqafzg">
    {children}
  </main>
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
    <SideMenu fixed ContentView={ContentView} className="bg-lightBg-primary dark:bg-darkBg-primary min-h-screen" data-oid="x5k83dv">
      {loading && <Button variant="outline" style={{ marginTop: ".5rem" }} $rounded loading={loading} disabled data-oid="diei16e" />}
      {error && <MessageError data-oid="7g2e1ui">{error}</MessageError>}
      {!error && video && (
        <div className="flex flex-col py-2 gap-2 w-full sm:max-w-lg md:max-w-2xl" data-oid="iwppakg">
          <Player src={video.fileUrl} poster={video.thumbnail} data-oid="-s8cx2s" />
          <h5 className="text-lightFg-primary dark:text-darkFg-primary" data-oid="5.wmbs-">
            {video.content}
          </h5>
          {video.user && (
            <div className="flex flex-row items-center gap-2" data-oid="3hgrz0r">
              <img className="w-8 h-8 rounded-full" src={video.user.avatarUrl} alt={video.user.name} data-oid="d2hquzc" />
              <PurpleLink to={`/profile/${video.user._id}`} data-oid="qqvc0ub">
                {video.user.name}
              </PurpleLink>
              <small className="font-medium text-lightFg-tertiary dark:text-darkFg-tertiary" data-oid="--1rxyu">
                {new Date(video.createdAt).toLocaleString()}
              </small>
            </div>
          )}
          <div className="flex flex-row items-center gap-2 " data-oid="juzb.wp">
            <Button
              type="button"
              variant={isLiked ? "danger" : "primary"}
              size="icon"
              $rounded
              title={isLiked ? "Descurtir" : "Curtir"}
              onClick={handleLikeToggle}
              disabled={loading}
              data-oid="9uql8wl">
              {isLiked ? <MdThumbDown size={16} data-oid="68yqcoq" /> : <MdThumbUp size={16} data-oid="dsl9eym" />}
            </Button>
            <Button type="button" size="icon" $rounded title="Compartilhar" onClick={handleShare} disabled={loading} data-oid="ilwtkw7">
              <MdShare size={16} data-oid="komrvw0" />
            </Button>
            <Button variant="secondary" $rounded disabled data-oid="98vekdi">
              {likeCount} <MdThumbUp data-oid="2ogqz88" /> / {commentCount} <MdComment data-oid="km6f7pw" /> / {shareCount} <MdShare data-oid="kh_jg6q" />
            </Button>
            {video.user._id === user?._id && (
              <>
                <Button type="button" variant="warning" size="icon" $rounded title="Editar" disabled={true} data-oid=":qoats_">
                  <MdEdit size={16} data-oid="0xqy156" />
                </Button>
                <Button type="button" variant="danger" size="icon" $rounded title="Deletar" onClick={handleDeleteVideo} data-oid="yx3xmnu">
                  <MdDelete size={16} data-oid="q7j_oz-" />
                </Button>
              </>
            )}
          </div>
          <MdComment className="text-lightFg-primary dark:text-darkFg-primary" size={16} data-oid="t_eaghz" />
          <CommentForm onSubmit={handleAddComment} data-oid="k0qedg8" />
          <div className="flex flex-col gap-2" data-oid="206q-t1">
            {loading && comments.length === 0 && <Button variant="outline" $rounded loading={loading} disabled data-oid="s:t-nx_" />}
            {!loading && comments.length === 0 && <MessageSuccess data-oid="hjfh7_m">Nenhum comentário ainda. Seja o primeiro!</MessageSuccess>}
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                videoId={videoId}
                disabled={loading}
                onCommentDeleted={handleDeleteComment}
                onReplyAdded={handleAddReply}
                data-oid="-zax0ci"
              />
            ))}
          </div>
        </div>
      )}
    </SideMenu>
  )
}

export default VideoDetail
