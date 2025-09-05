import { Link } from "react-router-dom"
import { Plus, Globe, Lightbulb, GraduationCap, Paperclip, Eye, Mic, Send, Bot, User } from "lucide-react"
import { useAI } from "../contexts/AIContext"
import { useAuth } from "../contexts/AuthContext"

const ActionButton = ({ icon: Icon, text }) => (
  <div className="text_icon flex items-center gap-2 border border-solid border-bLight dark:border-bDark py-1 px-3 rounded-full cursor-not-allowed opacity-50">
    <Icon size={16} />
    <span className="text-sm">{text}</span>
  </div>
)

const SuggestionCard = ({ icon: Icon, text }) => (
  <div className="text_icon flex flex-col items-center justify-center text-center gap-2 border border-solid border-bLight dark:border-bDark p-3 rounded-lg cursor-not-allowed opacity-50 h-full">
    <Icon size={20} />
    <span className="text-sm">{text}</span>
  </div>
)

const WelcomeScreen = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-8 p-4">
    <div className="text_div">
      <h1 className="text-4xl font-bold text-center">O que posso ajudar hoje?</h1>
    </div>
    <div className="icon_div grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full max-w-3xl">
      <SuggestionCard icon={GraduationCap} text="Obter conselho" />
      <SuggestionCard icon={Lightbulb} text="Brainstorm" />
      <SuggestionCard icon={Paperclip} text="Resumir texto" />
      <SuggestionCard icon={Eye} text="Analisar Imagens" />
      <div className="text_icon flex items-center justify-center text-center border border-solid border-bLight dark:border-bDark p-3 rounded-lg cursor-not-allowed opacity-50 h-full">
        <span className="text-sm">mais</span>
      </div>
    </div>
  </div>
)

const CloneMessage = ({ message }) => {
  const isAssistant = message.role === "assistant"

  const renderContent = () => {
    if (typeof message.content === "string") {
      return <p className="whitespace-pre-wrap">{message.content}</p>
    }

    if (Array.isArray(message.content)) {
      return message.content.map((part, index) => {
        if (part.type === "text") {
          return <p key={index} className="whitespace-pre-wrap">{part.content}</p>
        }
        // Futuramente, adicionar renderização de outros tipos, como imagens.
        return null
      })
    }
    return null
  }

  return (
    <div className={`flex items-start gap-4 py-4 px-2 rounded-md ${isAssistant ? "bg-lightBg-secondary dark:bg-darkBg-secondary" : ""}`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-lightBg-tertiary dark:bg-darkBg-tertiary">
        {isAssistant ? <Bot size={20} /> : <User size={20} />}
      </div>
      <div className="flex-grow pt-1">{renderContent()}</div>
    </div>
  )
}


const ClonePage = () => {
  const { signed } = useAuth()
  const { userPrompt, setUserPrompt, onSendMessage, messages, loadingMessages } = useAI()

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  // Ignora a mensagem inicial do sistema
  const chatMessages = messages.filter(msg => msg.role !== "system")

  return (
    <div className="flex flex-col h-dvh bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary font-['Roboto_Slab',_serif]">
      <nav className="flex items-center justify-between p-4 border-b border-bLight dark:border-bDark flex-shrink-0">
        <div className="left_nav">
          <h1 className="text-xl font-bold">
            <Link to="/chat">Denkitsu</Link>
          </h1>
        </div>
        {signed && (
          <div className="right_nav">
            <ul className="flex items-center gap-4">
              <li><Link to="/signin" className="bg-white text-black py-2 px-4 rounded-full text-sm font-bold">Log in</Link></li>
              <li><Link to="/signup" className="border border-white py-2 px-4 rounded-full text-sm font-bold">Sign up</Link></li>
            </ul>
          </div>
        )}
      </nav>

      <main className="flex-1 flex flex-col items-center w-full overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto flex-1">
          {chatMessages.length === 0 ? (
            <WelcomeScreen />
          ) : (
            <div className="p-4 space-y-2">
              {chatMessages.map((msg, index) => (
                <CloneMessage key={index} message={msg} />
              ))}
              {loadingMessages && (
                <div className="flex justify-center items-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-base"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="flex-shrink-0 p-4 w-full flex justify-center">
        <div className="input_div w-full max-w-3xl bg-lightBg-secondary dark:bg-darkBg-secondary rounded-2xl p-4 flex flex-col gap-4 shadow-lg">
          <div className="flex items-center gap-2">
            <textarea
              placeholder="Pergunte qualquer coisa..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loadingMessages}
              rows={1}
              className="w-full bg-transparent border-none outline-none text-lg placeholder:text-lightFg-tertiary dark:placeholder:text-darkFg-tertiary resize-none"
            />
            <button onClick={onSendMessage} disabled={loadingMessages || !userPrompt.trim()} className="p-2 rounded-full bg-primary-base text-white disabled:bg-gray-500">
              <Send size={20} />
            </button>
          </div>
          <div className="bottom_input_div flex items-center justify-between">
            <div className="bottom_left flex items-center gap-2 flex-wrap">
              <ActionButton icon={Plus} text="Anexar" />
              <ActionButton icon={Globe} text="Pesquisar" />
              <ActionButton icon={Lightbulb} text="Raciocinar" />
            </div>
            <div className="bottom_right flex items-center gap-2 cursor-pointer bg-white text-black py-1 px-3 rounded-full opacity-50">
              <Mic size={20} className="text-black bg-transparent" />
              <span className="text-black bg-transparent">Voz</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ClonePage
