import { useState, useCallback, useEffect } from "react"
import { LuLanguages, LuCopy, LuLoader } from "react-icons/lu"

import SideMenu from "../components/SideMenu"
import Button from "../components/Button"
import Paper from "../components/Paper"
import { MessageError } from "../components/Notifications"

const ContentView = ({ children }) => (
  <main className="flex flex-1 flex-col justify-center items-center p-2 gap-2 w-full h-screen">
    {children}
  </main>
)

const Translator = () => {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [sourceLang, setSourceLang] = useState("auto") // 'auto' para detecção automática
  const [targetLang, setTargetLang] = useState("pt")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isApiAvailable, setIsApiAvailable] = useState(false)

  // Verifica se a API está disponível quando o componente é montado
  useEffect(() => {
    if (chrome.ml && chrome.ml.translator) {
      setIsApiAvailable(true)
      // Define o idioma de destino padrão com base no idioma do navegador
      const browserLang = chrome.i18n.getUILanguage().split('-')[0]
      setTargetLang(browserLang)
    } else {
      setError("A API de tradução offline não está disponível neste navegador.")
    }
  }, [])

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return
    setLoading(true)
    setError(null)
    setOutputText("")

    try {
      let finalSourceLang = sourceLang
      // 1. Detecta o idioma se a opção 'auto' estiver selecionada
      if (sourceLang === "auto") {
        const { languages } = await chrome.i18n.detectLanguage(inputText)
        if (!languages || languages.length === 0) {
          throw new Error("Não foi possível detectar o idioma de origem.")
        }
        finalSourceLang = languages[0].language
      }

      if (finalSourceLang === targetLang) {
        setOutputText(inputText)
        return
      }

      // 2. Cria o tradutor e verifica o status do modelo
      const translator = await chrome.ml.translator.createTranslator(finalSourceLang, targetLang)
      const modelStatus = await translator.getModelStatus()

      if (modelStatus === "not_supported") {
        throw new Error(`A tradução de ${finalSourceLang} para ${targetLang} não é suportada.`)
      }
      if (modelStatus === "needs_download") {
        setError("O pacote de tradução para este idioma precisa ser baixado. Tente novamente em alguns instantes.")
        return
      }

      // 3. Realiza a tradução
      const result = await translator.translate(inputText)
      setOutputText(result.translation)

    } catch (err) {
      setError(err.message || "Ocorreu um erro desconhecido.")
    } finally {
      setLoading(false)
    }
  }, [inputText, sourceLang, targetLang])

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText)
    // Opcional: mostrar uma notificação de "copiado!"
  }

  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple">
      <Paper className="w-full max-w-2xl flex flex-col gap-4">
        <div className="flex items-center gap-2 text-lightFg-primary dark:text-darkFg-primary">
          <LuLanguages size={24} />
          <h2 className="text-xl font-bold">Tradutor Offline</h2>
        </div>

        {isApiAvailable ? (
          <>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite o texto para traduzir..."
              className="w-full h-32 p-2 rounded-md resize-none bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary"
              disabled={loading}
            />

            <div className="flex items-center justify-between gap-4">
              <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="p-2 rounded-md bg-lightBg-secondary dark:bg-darkBg-secondary">
                <option value="auto">Detectar Idioma</option>
                <option value="en">Inglês</option>
                <option value="pt">Português</option>
                <option value="es">Espanhol</option>
                <option value="fr">Francês</option>
                {/* Adicione outros idiomas conforme necessário */}
              </select>

              <Button onClick={handleTranslate} disabled={loading || !inputText.trim()} $rounded>
                {loading ? <LuLoader className="animate-spin" /> : "Traduzir"}
              </Button>

              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="p-2 rounded-md bg-lightBg-secondary dark:bg-darkBg-secondary">
                <option value="pt">Português</option>
                <option value="en">Inglês</option>
                <option value="es">Espanhol</option>
                <option value="fr">Francês</option>
                {/* Adicione outros idiomas conforme necessário */}
              </select>
            </div>

            <div className="relative">
              <textarea
                value={outputText}
                readOnly
                placeholder="Tradução..."
                className="w-full h-32 p-2 rounded-md resize-none bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary"
              />
              {outputText && (
                <Button size="icon" $rounded onClick={handleCopy} className="absolute top-2 right-2" title="Copiar">
                  <LuCopy />
                </Button>
              )}
            </div>
          </>
        ) : null}

        {error && <MessageError>{error}</MessageError>}
      </Paper>
    </SideMenu>
  )
}

export default Translator
