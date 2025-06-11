import { useState, useEffect, useCallback, useRef } from "react"
import ReactMarkdown from "react-markdown"

import { useAuth } from "../contexts/AuthContext"
import { getNewsPaginate } from "../services/news"

import SideMenu from "../components/SideMenu"
import Paper from "../components/Paper"
import Button from "../components/Button"

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
    <SideMenu style={{ position: "fixed" }}
      ContentView={({ children }) => (
        <div className="flex-1 flex flex-col items-center p-2 gap-2 h-auto absolute right-0 md:static md:mx-auto bg-repeat-y bg-cover bg-[url('/background.jpg')] bg-brand-purple">
          {children}
        </div>
      )}
    >
      {error && <Paper>{error}</Paper>}
      {news.map((article) => (
        <Paper key={article._id} className="max-w-[90%] md:max-w-[67%]">
          <ReactMarkdown
            components={{
              img: ({ node, ...props }) => <img className="w-full rounded" {...props} />,
              a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
              h1: ({ node, ...props }) => <strong {...props} />,
              h2: ({ node, ...props }) => <strong {...props} />,
              h3: ({ node, ...props }) => <strong {...props} />,
              h4: ({ node, ...props }) => <strong {...props} />,
              h5: ({ node, ...props }) => <strong {...props} />,
              h6: ({ node, ...props }) => <strong {...props} />,
              p: ({ node, ...props }) => <p {...props}/>,
              code: ({ node, ...props }) => <p {...props}/>,
              pre: ({ node, ...props }) => <p {...props}/>,
            }}
          >
            {article.content}
          </ReactMarkdown>
          <small className="text-xs text-gray-500">Publicado em {new Date(article.createdAt).toLocaleString()}</small>
        </Paper>
      ))}
      <Button variant="outline" $rounded onClick={loadNews} loading={loading} disabled={!hasMore}>
        {!hasMore ? "Fim" : !loading ? "Mais" : ""}
      </Button>
    </SideMenu>
  )
}

export default News
