import Card from "./Card"
import { MessageBase } from "./Notifications"

const Feed = ({ videos }) => {
  return (
    <div className="w-full md:max-w-max mx-auto grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {videos.length > 0 ? (
        videos.map((video) => <Card key={video._id} video={video} />)
      ) : (
        <MessageBase>Nenhum vídeo encontrado.</MessageBase>
      )}
    </div>
  )
}

export default Feed
