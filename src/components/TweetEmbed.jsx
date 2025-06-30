import { Tweet } from "react-tweet"
import { useTheme } from "../contexts/ThemeContext"

const TweetContainer = ({ children }) => (
  <div className="flex justify-center my-2 w-full [&>div]:w-full max-w-lg" data-oid="n0brv98">
    {children}
  </div>
)

const TweetEmbed = ({ tweetID }) => {
  const { theme } = useTheme()

  if (!tweetID) return null

  return (
    <TweetContainer data-oid="ug5gjik">
      <Tweet id={tweetID} data-oid="tewqz1n" />
    </TweetContainer>
  )
}

export default TweetEmbed
