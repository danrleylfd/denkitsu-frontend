import { useState, useEffect, useCallback, useRef } from "react"
import ReactMarkdown from "react-markdown"

import { useAuth } from "../contexts/AuthContext"
import { getNewsPaginate } from "../services/news"

import SideMenu from "../components/SideMenu"
import Markdown from "../components/Markdown"
import Paper from "../components/Paper"
import Input from "../components/Input"
import Button from "../components/Button"

const ContentView = ({ children }) => <main className="flex flex-col items-center p-2 gap-2 mx-auto min-h-screen w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[67%] ml-[3.5rem] md:ml-auto">{children}</main>

const News = () => {
  const { user } = useAuth()
  const [news, setNews] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)
  const isMounted = useRef(true)
  const isLoadingRef = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const loadNews = useCallback(
    async (currentPage) => {
      if (isLoadingRef.current || loading || !hasMore || !isMounted.current) return
      isLoadingRef.current = true
      setError(null)
      setLoading(true)
      try {
        const articles = await getNewsPaginate(currentPage)
        if (!articles || !isMounted.current) return
        setNews((prevNews) => [...prevNews, ...articles.news])
        setHasMore(articles.pagination.hasNextPage)
        articles.pagination.hasNextPage && setPage(articles.pagination.currentPage + 1)
      } catch (error) {
        if (!isMounted.current) return
        setError("Não foi possível carregar as notícias")
        setTimeout(() => isMounted.current && setError(null), 3000)
      } finally {
        isMounted.current && setLoading(false)
        isLoadingRef.current = false
      }
    },
    [loading, hasMore]
  )

  useEffect(() => {
    loadNews(page)
  }, [])

  const handleScroll = useCallback(() => {
    if (!isMounted.current || isLoadingRef.current || loading || !hasMore) return
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement
    const threshold = 10
    if (scrollHeight - (scrollTop + clientHeight) < threshold && !loading && hasMore) {
      loadNews(page)
    }
  }, [loading, hasMore, loadNews, page])

  useEffect(() => {
    const scrollHandler = handleScroll
    window.addEventListener("scroll", scrollHandler)
    return () => window.removeEventListener("scroll", scrollHandler)
  }, [handleScroll])

  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple">
      {error && <Paper>{error}</Paper>}
      <Paper>
        <Input>
          <Button variant="primary" $rounded>Gerar</Button>
        </Input>
      </Paper>
      {news.map((article) => (
        <Paper key={article._id}>
          <Markdown content={article.content} />
          <small className="text-xs text-lightFg-secondary dark:text-darkFg-secondary">Publicado em {new Date(article.createdAt).toLocaleString()}</small>
        </Paper>
      ))}
      <Button variant="outline" $rounded onClick={loadNews} loading={loading} disabled={!hasMore}>
        {!hasMore ? "Fim" : !loading ? "Mais" : ""}
      </Button>
    </SideMenu>
  )
}

export default News
