import { useState, useCallback, useEffect } from "react"
import { LuLanguages, LuCopy, LuLoader, LuArrowRightLeft, LuArrowUpDown } from "react-icons/lu" // CORRIGIDO: LuLoader2

import SideMenu from "../components/SideMenu"
import Button from "../components/Button"
import Paper from "../components/Paper"
import { MessageError } from "../components/Notifications"

const ContentView = ({ children }) => (
  <main className="flex flex-1 flex-col justify-center items-center p-2 gap-2 w-full h-screen">
    {children}
  </main>
)

const supportedLanguages = [
  { code: 'af', name: 'Africâner' },
  { code: 'de', name: 'Alemão' },
  { code: 'ar', name: 'Árabe' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ca', name: 'Catalão' },
  { code: 'zh', name: 'Chinês (Simplificado)' },
  { code: 'ko', name: 'Coreano' },
  { code: 'da', name: 'Dinamarquês' },
  { code: 'sk', name: 'Eslovaco' },
  { code: 'sl', name: 'Esloveno' },
  { code: 'es', name: 'Espanhol' },
  { code: 'fi', name: 'Finlandês' },
  { code: 'fr', name: 'Francês' },
  { code: 'el', name: 'Grego' },
  { code: 'he', name: 'Hebraico' },
  { code: 'hi', name: 'Hindi' },
  { code: 'nl', name: 'Holandês' },
  { code: 'hu', name: 'Húngaro' },
  { code: 'id', name: 'Indonésio' },
  { code: 'en', name: 'Inglês' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: 'Japonês' },
  { code: 'ms', name: 'Malaio' },
  { code: 'no', name: 'Norueguês' },
  { code: 'fa', name: 'Persa' },
  { code: 'pl', name: 'Polonês' },
  { code: 'pt', name: 'Português' },
  { code: 'ro', name: 'Romeno' },
  { code: 'ru', name: 'Russo' },
  { code: 'sv', name: 'Sueco' },
  { code: 'th', name: 'Tailandês' },
  { code: 'cs', name: 'Tcheco' },
  { code: 'tr', name: 'Turco' },
  { code: 'uk', name: 'Ucraniano' },
  { code: 'vi', name: 'Vietnamita' }
].sort((a, b) => a.name.localeCompare(b.name))

const Tradutor = () => {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [sourceLang, setSourceLang] = useState("en")
  const [targetLang, setTargetLang] = useState("pt")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isApiAvailable, setIsApiAvailable] = useState(false)

  useEffect(() => {
    if ('Translator' in self) {
      setIsApiAvailable(true)
      const browserLang = navigator.language.split('-')[0]
      if (browserLang) setTargetLang(browserLang)
    } else {
      setError("A API de tradução não está disponível neste navegador.")
    }
  }, [])
  const handleTranslate = useCallback(async () => {
    if (!inputText.trim() || !sourceLang) {
        setError("Por favor, digite um texto e selecione o idioma de origem.")
        return
    }
    setLoading(true)
    setError(null)
    setOutputText("")
    try {
      if (sourceLang === targetLang) {
        setOutputText(inputText)
        return
      }
      const availability = await Translator.availability({ sourceLanguage: sourceLang, targetLanguage: targetLang });
      if (availability.state === "not_supported") {
        throw new Error(`A tradução de '${sourceLang}' para '${targetLang}' não é suportada.`);
      }
      if (availability.state === "needs_download") {
        setError("O pacote de tradução precisa ser baixado. Tente novamente em alguns instantes.");
        return;
      }
      const translator = await Translator.create({ sourceLanguage: sourceLang, targetLanguage: targetLang });
      const result = await translator.translate(inputText)
      setOutputText(result)
    } catch (err) {
      setError(err.message || "Ocorreu um erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, [inputText, sourceLang, targetLang]);


  const handleCopy = () => {
    navigator.clipboard.writeText(outputText)
  }

  const swapLanguages = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
  }

  const swapText = () => {
    setInputText(outputText)
    setOutputText(inputText)
  }

  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple">
      <Paper className="w-full max-w-2xl flex flex-col gap-2 bg-lightBg-primary dark:bg-darkBg-primary">
        <div className="flex items-center gap-2 text-lightFg-primary dark:text-darkFg-primary">
          <LuLanguages size={24} />
          <h2 className="text-xl font-bold">Tradutor</h2>
        </div>
        {isApiAvailable ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="p-2 rounded-md bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary">
                {supportedLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <Button variant="secondary" size="icon" $rounded onClick={swapLanguages} disabled={loading}>
                <LuArrowRightLeft size={16} />
              </Button>
              <Button size="icon" onClick={handleTranslate} disabled={loading || !inputText.trim()} $rounded>
                {loading ? <LuLoader className="animate-spin" size={16} /> : <LuLanguages size={16} />}
              </Button>
              <Button variant="secondary" size="icon" $rounded onClick={swapText} disabled={loading}>
                <LuArrowUpDown size={16} />
              </Button>
              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="p-2 rounded-md bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary">
                {supportedLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite o texto para traduzir..."
              className="w-full h-32 p-2 rounded-md resize-none bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary"
              disabled={loading}
            />
            <div className="relative">
              <textarea
                value={outputText}
                readOnly
                className="w-full h-32 p-2 rounded-md resize-none bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary"
              />
              {outputText && (
                <Button variant="secondary" size="icon" $rounded onClick={handleCopy} title="Copiar">
                  <LuCopy size={16} />
                </Button>
              )}
            </div>
          </div>
        ) : null}
        {error && <MessageError>{error}</MessageError>}
      </Paper>
    </SideMenu>
  )
}

export default Tradutor
