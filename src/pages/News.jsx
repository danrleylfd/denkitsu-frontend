import { useState, useEffect, useCallback, useRef } from "react"
import { SearchSlash, Brain, Copy, Mic } from "lucide-react"

import { useAI } from "../contexts/AIContext"
import { useNotification } from "../contexts/NotificationContext"

import { getNewsPaginate } from "../services/news"
import { generateNews } from "../services/aiChat"

import SideMenu from "../components/SideMenu"
import Markdown from "../components/Markdown"
import Paper from "../components/Paper"
import Input from "../components/Input"
import Button from "../components/Button"

const ContentView = ({ children }) => (
  <main
    className="flex flex-col items-center p-2 gap-2 mx-auto min-h-dvh w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[67%] ml-[3.5rem] md:ml-auto">
    {children}
  </main>
)

const News = () => {
  const { aiProvider, aiProviderToggle, speakResponse } = useAI()
  const { notifyError, notifyInfo } = useNotification()
  const [searchTerm, setSearchTerm] = useState("")
  const [news, setNews] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef()

  const loadNews = useCallback(async (currentPage) => {
    setLoading(true)
    try {
      const data = await getNewsPaginate(currentPage)
      if (data && data.news) {
        setNews((prevNews) => [...prevNews, ...data.news])
        setHasMore(data.pagination.hasNextPage)
        if (data.pagination.hasNextPage) setPage(data.pagination.currentPage + 1)
      } else setHasMore(false)
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Não foi possível carregar as notícias.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setNews([])
    setPage(1)
    setHasMore(true)
    loadNews(1)
  }, [loadNews])

  const lastNewsElementRef = useCallback(node => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) loadNews(page)
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore, page, loadNews])

  const handleGenerate = async () => {
    if (!searchTerm) return
    setLoading(true)
    try {
      const article = await generateNews(searchTerm, aiProvider)
      setNews([{ ...article, id: Date.now() }, ...news])
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
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
      <Paper>
        <Input
          placeholder="Pesquisar um tópico para gerar uma notícia com IA..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}>
          <Button
            variant="outline" size="icon" $rounded onClick={handleGenerate}
            loading={loading} disabled={!searchTerm.trim()} title="Pesquisar e Gerar">
            {!loading && <SearchSlash size={16} />}
          </Button>
          <Button
            variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"}
            size="icon" $rounded onClick={aiProviderToggle} title={aiProvider === "groq" ? "Groq" : "OpenRouter"}>
            <Brain size={16} />
          </Button>
        </Input>
      </Paper>
      {news.map((article, index) => {
        if (news.length === index + 1) {
          return (
            <Paper ref={lastNewsElementRef} key={article._id}>
              <Markdown content={article.content} />
              <small className="text-xs text-lightFg-secondary dark:text-darkFg-secondary">
                Publicado em {new Date(article.createdAt).toLocaleString()}
              </small>
            </Paper>
          )
        } else {
          return (
            <Paper key={article._id}>
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
            </Paper>
          )
        }
      })}
      {loading && <Button variant="outline" $rounded loading={true} disabled />}
      {!hasMore && news.length > 0 && <p className="text-center text-white">Fim das notícias.</p>}
    </SideMenu>
  )
}

export default News
