import { useState, useEffect } from "react"

import { getRecentVideos } from "../services/video"

import SideMenu from "../components/SideMenu"
import Feed from "../components/Feed"
import Button from "../components/Button"
import { MessageError } from "../components/Notifications"

const ContentView = ({ children, ...props }) => (
  <main {...props} className="flex flex-col items-center p-2 gap-2 mx-auto w-full xs:max-w-[100%] sm:max-w-[90%] ml-[3.5rem] md:max-w-[75%] lg:max-w-[100%]">{children}</main>
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
    <SideMenu fixed ContentView={ContentView}>
      {loading && <Button $rounded loading={loading} disabled />}
      {error && <MessageError>{error}</MessageError>}
      {!loading && !error && <Feed videos={recentVideos} />}
    </SideMenu>
  )
}

export default Recents
