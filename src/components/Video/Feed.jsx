import VideoCard from "./Card"

const VideoFeed = ({ videos }) => {
  return (
    <div className="flex-1 grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  )
}

export default VideoFeed
