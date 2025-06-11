import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { Article, ArticlePreview, ArticleFigure, ArticleImage, ArticleVideo } from "./styles.jsx"

const Card = ({ video }) => {
  if (!video) return null
  const [isHover, setIsHover] = useState(false)
  const ref = useRef(null)
  return (
      <Article>
        <ArticleFigure
          onMouseOver={() => {setIsHover(true); ref.current && ref.current.play()}}
          onMouseOut={() => {setIsHover(false); ref.current && ref.current.pause()}}
        >
          {isHover ? (
            <ArticleVideo muted loop src={video.fileUrl} ref={ref} />
          ) : (
            <ArticleImage src={video.thumbnail} alt={video.content} />
          )}
        </ArticleFigure>
        <ArticlePreview>
          <Link to={`/video/${video._id}`}>{video.content}</Link>
          {video.user && (
            <small>Publicado por <Link to={`/profile/${video.user._id}`}>{video.user.name}</Link></small>
          )}
        </ArticlePreview>
      </Article>
  )
}

export default Card
