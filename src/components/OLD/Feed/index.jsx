import { VideoGrid } from "./styles"
import Card from "../Card"
import { MessageBase } from "../Notifications"

const Feed = ({ videos }) => {
  return (
    <VideoGrid>
      {videos.length > 0 ? (
        videos.map((video) => <Card key={video._id} video={video} />)
      ) : (
        <MessageBase>Nenhum vídeo encontrado.</MessageBase>
      )}
    </VideoGrid>
  )
}

export default Feed
