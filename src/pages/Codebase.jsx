import { useState, useEffect, useCallback } from "react"
import { SideMenu } from "@/components/side-menu"
import { ContentView } from "@/components/content-view"

import { RECENTS_KEY, storage, openDB } from "../utils/codebase"

import FileViewer from "./components/Codebase/FileViewer"
import LocalInputView from "./components/Codebase/LocalInputView"
import GithubInputView from "./components/Codebase/GithubInputView"
import RecentItemsList from "./components/Codebase/RecentItemsList"
import FileExplorer from "./components/Codebase/FileExplorer"

const Codebase = () => {
  const [step, setStep] = useState("options")
  const [isProcessing, setIsProcessing] = useState(false)
  const [allFiles, setAllFiles] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [recentItems, setRecentItems] = useState([])

  useEffect(() => {
    const fetchRecentItems = async () => {
      const items = (await storage.getItem(RECENTS_KEY)) || []
      setRecentItems(items)
    }
    fetchRecentItems()
  }, [])

  const handleGenerateCodebase = useCallback(() => {
    console.log("Gerar codebase com arquivos:", selectedFiles)
    // lógica futura
  }, [selectedFiles])

  return (
    <SideMenu>
      <ContentView title="Codebase">
        {step === "options" && (
          <div className="flex flex-col gap-4">
            <LocalInputView setStep={setStep} setIsProcessing={setIsProcessing} />
            <GithubInputView setStep={setStep} setIsProcessing={setIsProcessing} />
            <RecentItemsList items={recentItems} setStep={setStep} setIsProcessing={setIsProcessing} />
          </div>
        )}

        {step === "explorer" && (
          <FileExplorer
            allFiles={allFiles}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            onGenerate={handleGenerateCodebase}
          />
        )}

        {step === "viewer" && <FileViewer />}
      </ContentView>
    </SideMenu>
  )
}

export default Codebase
