import { Link } from "react-router-dom"
import { Lock, UserPlus, LogIn, MessageCirclePlus } from "lucide-react"

import Paper from "../Paper"
import Button from "../Button"
import { useAI } from "../../contexts/AIContext"

const AIBarSignOut = () => {
  const { clearHistory } = useAI()
  return (
    <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mb-2 mx-auto">
      <Button variant="secondary" size="icon" $rounded disabled>
        <Lock size={16} />
      </Button>
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
        <p className="text-lightFg-secondary dark:text-darkFg-secondary">Faça login ou crie sua conta para conversar.</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory}><MessageCirclePlus size={16} /></Button>
          <Link to="/signup">
            <Button variant="outline" size="icon" $rounded>
              <UserPlus size={16} />
            </Button>
          </Link>
          <Link to="/signin">
            <Button variant="primary" size="icon" $rounded>
              <LogIn size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </Paper>
  )
}

export default AIBarSignOut
