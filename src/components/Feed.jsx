import Card from "./Card"
import { MessageBase } from "./Notifications"

const Feed = ({ videos }) => {
  return (
    <div className="mx-auto grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
      {videos.length > 0 ? (
        videos.map((video) => <Card key={video._id} video={video} />)
      ) : (
        <MessageBase>Nenhum vídeo encontrado.</MessageBase>
      )}
    </div>
  )
}

export default Feed
