import { LuThumbsUp, LuMessageCircle, LuShare2 } from "react-icons/lu"

import Input from "./Input"
import Button from "./Button"
import PurpleLink from "./PurpleLink"

const VideoCard = ({ video }) => {
  if (!video) return
  return (
    <div className="h-fit w-full md:max-w-xs overflow-hidden rounded-lg border border-solid border-bLight dark:border-bDark" data-oid="56mww:2">
      <div className="flex h-40 w-full" data-oid="4l8rfa0">
        <img src={video.thumbnail} alt={video.content} className="h-full w-full object-cover" data-oid="rxfzb-d" />
      </div>
      <div className="flex h-fit flex-col gap-2 bg-lightBg-secondary p-2 transition-colors duration-300 ease-in-out dark:bg-darkBg-secondary" data-oid="9hmrokt">
        <PurpleLink to={`/video/${video._id}`} title={video.content} className="overflow-hidden text-ellipsis whitespace-nowrap" data-oid="gj56nmn">
          {video.content}
        </PurpleLink>
        <div className="flex items-center gap-2" data-oid="_lom6im">
          <Button variant="outline" size="icon" $rounded data-oid="wdltf3:">
            <LuThumbsUp size={16} data-oid="x0-:mcs" />
          </Button>
          <Input type="text" placeholder="Escreva um comentário..." data-oid="5qckwzg">
            <Button variant="outline" size="icon" $rounded data-oid="jgm9opn">
              <LuMessageCircle size={16} data-oid="85yf94-" />
            </Button>
          </Input>
          <Button variant="outline" size="icon" $rounded data-oid="qg4pq3_">
            <LuShare2 size={16} data-oid="6wy4661" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VideoCard
