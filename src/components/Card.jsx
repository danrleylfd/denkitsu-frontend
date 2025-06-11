import { Link } from "react-router-dom"
import { LuThumbsUp, LuMessageCircle, LuShare2 } from "react-icons/lu"

import Input from "./Input"
import Button from "./Button"

const Card = ({ video }) => {
  if (!video) return null

  return (
    <div className="h-fit w-full md:max-w-xs overflow-hidden rounded-lg border border-solid border-light-border dark:border-dark-border">
      <div className="flex h-40 w-full">
        <img
          src={video.thumbnail}
          alt={video.content}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex h-fit flex-col gap-2 bg-light-cardBg p-2 transition-colors duration-300 ease-in-out dark:bg-dark-cardBg">
        <Link
          to={`/video/${video._id}`}
          title={video.content}
          className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium"
        >
          {video.content}
        </Link>
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

export default Card
