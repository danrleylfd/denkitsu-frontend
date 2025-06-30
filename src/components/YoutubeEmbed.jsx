const YouTubeEmbed = ({ videoId }) => {
  if (!videoId) return null
  return (
    <div className="w-full overflow-hidden rounded-lg shadow-lg" data-oid="njfgftl">
      <iframe
        className="w-full h-full min-w-96 min-h-56"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        data-oid="9a13-4w"
      />
    </div>
  )
}

export default YouTubeEmbed
