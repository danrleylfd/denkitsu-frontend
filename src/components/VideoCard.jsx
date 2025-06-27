import { LuThumbsUp, LuMessageCircle, LuShare2 } from "react-icons/lu"

import Input from "./Input"
import Button from "./Button"
import PurpleLink from "./PurpleLink"

const VideoCard = ({ video }) => {
  if (!video) return
  return (
    <div className="h-fit w-full md:max-w-xs overflow-hidden rounded-lg border border-solid border-bLight dark:border-bDark">
      <div className="flex h-40 w-full">
        <img
          src={video.thumbnail}
          alt={video.content}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex h-fit flex-col gap-2 bg-lightBg-secondary p-2 transition-colors duration-300 ease-in-out dark:bg-darkBg-secondary">
        <PurpleLink
          to={`/video/${video._id}`}
          title={video.content}
          className="overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {video.content}
        </PurpleLink>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" $rounded>
            <LuThumbsUp size={16}/>
          </Button>
          <Input type="text" placeholder="Escreva um comentário...">
            <Button variant="outline" size="icon" $rounded>
              <LuMessageCircle size={16}/>
            </Button>
          </Input>
          <Button variant="outline" size="icon" $rounded>
            <LuShare2 size={16}/>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VideoCard
