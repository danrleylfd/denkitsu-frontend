import { useState, useEffect } from "react"

import { getRecentVideos } from "../../services/video"

import SideMenu from "../../components/SideMenu"
import Feed from "../../components/Feed"
import Button from "../../components/Button"
import { MessageError } from "../../components/Notifications"

const SideContentContainer = (props) => (
  <div {...props} className="flex h-screen flex-1 flex-col items-center justify-start gap-2 p-2 max-w-[89%] absolute right-0 md:relative md:mx-auto md:max-w-none" />
)

const Recents = () => {
  const [recentVideos, setRecentVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        setError(null)
        const [recentData] = await Promise.all([getRecentVideos()])
        setRecentVideos(recentData || [])
      } catch (err) {
        if (err.response.status === 404) {
          setRecentVideos([])
          return
        }
        setError("Falha ao carregar vídeos. Tente novamente mais tarde.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  return (
    <SideMenu style={{ position: "fixed" }} ContentView={SideContentContainer}>
      {loading && <Button $rounded loading={loading} disabled />}
      {error && <MessageError>{error}</MessageError>}
      {!loading && !error && <Feed videos={recentVideos} />}
    </SideMenu>
  )
}

export default Recents
