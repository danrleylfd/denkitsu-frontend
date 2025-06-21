import { Tweet } from "react-tweet"
import { useTheme } from "../contexts/ThemeContext"

const TweetContainer = ({ children }) => (
  <div className="flex justify-center my-2 w-full [&>div]:w-full max-w-lg">
    {children}
  </div>
)

const TweetEmbed = ({ tweetID }) => {
  const { theme } = useTheme()

  if (!tweetID) return null

  return (
    <TweetContainer>
      <Tweet id={tweetID} theme={theme} />
    </TweetContainer>
  )
}

export default TweetEmbed
