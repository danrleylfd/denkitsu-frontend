import { useState, useCallback, useEffect } from "react"
import { Languages, Copy, Loader, ArrowRightLeft, ArrowUpDown } from "lucide-react"

import { useNotification } from "../contexts/NotificationContext"

import SideMenu from "../components/SideMenu"
import Button from "../components/Button"
import Paper from "../components/Paper"

const ContentView = ({ children }) => <main className="flex flex-1 flex-col justify-center items-center p-2 gap-2 w-full h-dvh">{children}</main>

const supportedLanguages = [
  { code: "af", name: "Africâner" },
  { code: "de", name: "Alemão" },
  { code: "ar", name: "Árabe" },
  { code: "bn", name: "Bengali" },
  { code: "ca", name: "Catalão" },
  { code: "zh", name: "Chinês (Simplificado)" },
  { code: "ko", name: "Coreano" },
  { code: "da", name: "Dinamarquês" },
  { code: "sk", name: "Eslovaco" },
  { code: "sl", name: "Esloveno" },
  { code: "es", name: "Espanhol" },
  { code: "fi", name: "Finlandês" },
  { code: "fr", name: "Francês" },
  { code: "el", name: "Grego" },
  { code: "he", name: "Hebraico" },
  { code: "hi", name: "Hindi" },
  { code: "nl", name: "Holandês" },
  { code: "hu", name: "Húngaro" },
  { code: "id", name: "Indonésio" },
  { code: "en", name: "Inglês" },
  { code: "it", name: "Italiano" },
  { code: "ja", name: "Japonês" },
  { code: "ms", name: "Malaio" },
  { code: "no", name: "Norueguês" },
  { code: "fa", name: "Persa" },
  { code: "pl", name: "Polonês" },
  { code: "pt", name: "Português" },
  { code: "ro", name: "Romeno" },
  { code: "ru", name: "Russo" },
  { code: "sv", name: "Sueco" },
  { code: "th", name: "Tailandês" },
  { code: "cs", name: "Tcheco" },
  { code: "tr", name: "Turco" },
  { code: "uk", name: "Ucraniano" },
  { code: "vi", name: "Vietnamita" }
].sort((a, b) => a.name.localeCompare(b.name))

const Tradutor = () => {
  const { notifyWarning, notifyError } = useNotification()
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [sourceLang, setSourceLang] = useState("en")
  const [targetLang, setTargetLang] = useState("pt")
  const [loading, setLoading] = useState(false)
  const [isApiAvailable, setIsApiAvailable] = useState(false)

  useEffect(() => {
    if ("Translator" in self) {
      setIsApiAvailable(true)
      const browserLang = navigator.language.split("-")[0]
      if (browserLang) setTargetLang(browserLang)
    } else {
      notifyError("A API de tradução não está disponível neste navegador.")
    }
  }, [])
  const handleTranslate = useCallback(async () => {
    if (!inputText.trim() || !sourceLang) {
      notifyWarning("Por favor, digite um texto e selecione o idioma de origem.")
      return
    }
    setLoading(true)
    setOutputText("")
    try {
      if (sourceLang === targetLang) {
        setOutputText(inputText)
        return
      }
      const availability = await Translator.availability({ sourceLanguage: sourceLang, targetLanguage: targetLang })
      if (availability.state === "not_supported") {
        throw new Error(`A tradução de "${sourceLang}" para "${targetLang}" não é suportada.`)
      }
      if (availability.state === "needs_download") {
        notifyError("O pacote de tradução precisa ser baixado. Tente novamente em alguns instantes.")
        return
      }
      const translator = await Translator.create({ sourceLanguage: sourceLang, targetLanguage: targetLang })
      const result = await translator.translate(inputText)
      setOutputText(result)
    } catch (err) {
      console.error(err)
      notifyError("Ocorreu um erro desconhecido.")
    } finally {
      setLoading(false)
    }
  }, [inputText, sourceLang, targetLang])

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
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
      <Paper className="!max-w-2xl flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-lightFg-primary dark:text-darkFg-primary">
          <Languages size={24} />
          <h2 className="text-xl font-bold">Tradutor</h2>
        </div>
        {isApiAvailable ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="p-2 rounded-md bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary">
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <Button variant="secondary" size="icon" $rounded onClick={swapLanguages} disabled={loading}>
                <ArrowRightLeft size={16} />
              </Button>
              <Button size="icon" onClick={handleTranslate} disabled={loading || !inputText.trim()} $rounded>
                {loading ? <Loader className="animate-spin" size={16} /> : <Languages size={16} />}
              </Button>
              <Button variant="secondary" size="icon" $rounded onClick={swapText} disabled={loading}>
                <ArrowUpDown size={16} />
              </Button>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="p-2 rounded-md bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary">
                {supportedLanguages.map((lang) => (
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
                  <Copy size={16} />
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </Paper>
    </SideMenu>
  )
}

export default Tradutor
