import { memo, useState } from "react"
import { Folder, Github } from "lucide-react"

import Paper from "../Paper"
import Button from "../Button"

import LocalInputView from "./LocalInputView"
import GithubInputView from "./GithubInputView"
import RecentItemsList from "./RecentItemsList"

const InputScreen = memo((props) => {
  const [inputMethod, setInputMethod] = useState("local")

  return (
    <Paper className="!h-full !flex !flex-1 !flex-col !gap-4 !p-4">
      <div className="flex justify-center gap-2">
        <Button variant={inputMethod === "local" ? "primary" : "secondary"} $squared onClick={() => setInputMethod("local")}><Folder size={16} className="mr-2" /> Local</Button>
        <Button variant={inputMethod === "github" ? "primary" : "secondary"} $squared onClick={() => setInputMethod("github")}><Github size={16} className="mr-2" /> GitHub</Button>
      </div>
      <div className="flex-grow">
        {inputMethod === "local"
          ? <LocalInputView onDrop={props.onDrop} onSelectFolder={props.onSelectFolder} />
          : <GithubInputView githubRepo={props.githubRepo} onRepoChange={props.onRepoChange} onFetch={props.onFetch} isProcessing={props.isProcessing} />
        }
      </div>
      <RecentItemsList items={props.recentItems} onClick={props.onRecentClick} onRemove={props.onRemoveRecent} onClearAll={props.onClearRecents} />
    </Paper>
  )
})

export default InputScreen
