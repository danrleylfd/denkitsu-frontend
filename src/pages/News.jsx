import { useState, useEffect, useCallback, useRef } from "react"
import { SearchSlash, Copy, Mic } from "lucide-react"

import { useAI } from "../contexts/AIContext"
import { useModels } from "../contexts/ModelContext"
import { useNotification } from "../contexts/NotificationContext"

import { getNewsByCursor } from "../services/news"
import { generateNews } from "../services/aiChat"

import SideMenu from "../components/SideMenu"
import Markdown from "../components/Markdown"
import Paper from "../components/Paper"
import Input from "../components/Input"
import Button from "../components/Button"
import ProviderSelector from "../components/AI/ProviderSelector"

const ContentView = ({ children }) => (
  <main
    className="flex flex-col items-center p-2 gap-2 mx-auto min-h-dvh w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[67%] ml-[3.5rem] md:ml-auto">
    {children}
  </main>
)

const News = () => {
  const { speakResponse } = useAI()
  const { aiProvider, aiProviderToggle } = useModels()
  const { notifyError, notifyInfo } = useNotification()
  const [searchTerm, setSearchTerm] = useState("")
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState(null)
  const observer = useRef()

  const isFetching = useRef(false)
  const initialLoadDone = useRef(false)

  const loadNews = useCallback(async () => {
    if (isFetching.current || !hasMore) return
    isFetching.current = true
    setLoading(true)
    const cursorToFetch = initialLoadDone.current ? nextCursor : null
    try {
      const data = await getNewsByCursor(cursorToFetch)
      if (data && data.news) {
        if (!initialLoadDone.current) setNews(data.news)
        else setNews(prev => [...prev, ...data.news])
        setNextCursor(data.nextCursor)
        setHasMore(data.nextCursor !== null)
        initialLoadDone.current = true
      } else setHasMore(false)
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Não foi possível carregar as notícias.")
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [nextCursor, hasMore])

  useEffect(() => {
    if (!initialLoadDone.current) loadNews()
  }, [loadNews])

  const lastNewsElementRef = useCallback(node => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) loadNews()
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore, loadNews])

  const handleGenerate = async () => {
    if (!searchTerm) return
    setLoading(true)
    try {
      const article = await generateNews(searchTerm, aiProvider)
      setNews([{ ...article, _id: Date.now() }, ...news])
      setSearchTerm("")
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Não foi possível gerar a notícia.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyMarkdown = (content) => {
    navigator.clipboard.writeText(content)
    notifyInfo("Markdown copiado!")
  }

  return (
    <div className="flex flex-1 flex-col gap-2 mt-2 overflow-y-auto">
      <Paper variant="secondary" className="mx-auto p-4 w-full max-w-[95%] xs:max-w-[97%] sm:max-w-[98%] md:max-w-[75%] lg:max-w-[67%]">
        <Input
          placeholder="Pesquisar um tópico para gerar uma notícia com IA..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}>
          <Button
            variant="outline" size="icon" $rounded onClick={handleGenerate}
            loading={loading} disabled={!searchTerm.trim()} title="Pesquisar e Gerar">
            {!loading && <SearchSlash size={16} />}
          </Button>
          <ProviderSelector />
        </Input>
      </Paper>

      {news.map((article, index) => {
        const cardContent = (
          <>
            <Markdown content={article.content} />
            <small className="text-xs text-lightFg-secondary dark:text-darkFg-secondary">
              Publicado em {new Date(article.createdAt).toLocaleString()}
            </small>
            <div className="flex gap-2 mt-2">
              <Button
                variant="secondary"
                size="icon"
                $rounded
                title="Copiar Markdown"
                onClick={() => handleCopyMarkdown(article.content)}
              >
                <Copy size={14} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                $rounded
                title="Ler em voz alta"
                onClick={() => speakResponse(article.content)}
              >
                <Mic size={14} />
              </Button>
            </div>
          </>
        )

        if (news.length === index + 1) return (<Paper variant="secondary" className="p-4" ref={lastNewsElementRef} key={article._id || index}>{cardContent}</Paper>)
        else return (<Paper variant="secondary" className="mx-auto p-4 w-full max-w-[95%] xs:max-w-[97%] sm:max-w-[98%] md:max-w-[75%] lg:max-w-[67%]" key={article._id || index}>{cardContent}</Paper>)
      })}
      {loading && <Button variant="outline" $rounded loading={true} disabled />}
      {!hasMore && news.length > 0 && <p className="text-center text-white mt-4">Fim das notícias.</p>}
    </div>
  )
}

export default News
