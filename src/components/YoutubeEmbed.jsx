const YouTubeEmbed = ({ videoId }) => {
  if (!videoId) return null
  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-lg" style={{ paddingTop: "56.25%" }}>
      <iframe
        className="absolute top-0 left-0 h-full w-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

export default YouTubeEmbed
