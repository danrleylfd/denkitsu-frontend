import { memo } from "react"
import { Github } from "lucide-react"
import Input from "../Input"
import Button from "../Button"

const GithubInputView = memo(({ githubRepo, onRepoChange, onFetch, isProcessing }) => (
  <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
    <Github size={48} className="text-lightFg-secondary dark:text-darkFg-secondary" />
    <p className="text-xl font-semibold text-lightFg-primary dark:text-darkFg-primary">Extrair de um Repositório Público</p>
    <Input placeholder="owner/repo" value={githubRepo} onChange={onRepoChange} onKeyDown={(e) => e.key === "Enter" && onFetch()} disabled={isProcessing}>
      <Button variant="outline" $rounded onClick={() => onFetch()} loading={isProcessing} disabled={isProcessing || !githubRepo.trim()}>
        {isProcessing ? "Buscando..." : "Buscar"}
      </Button>
    </Input>
  </div>
))

export default GithubInputView
