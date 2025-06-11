import { useState, useEffect, useCallback, useRef } from "react"
import ReactMarkdown from "react-markdown"

import { useAuth } from "../../../contexts/AuthContext"
import { getNewsPaginate } from "../../../services/news"

import SideMenu from "../../../components/SideMenu"
import Paper from "../../../components/Paper"
import Button from "../../../components/Button"

import { SideContentContainer } from "./styles"

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
    console.log("News component mounted")
    return () => {
      isMounted.current = false
    }
  }, [])

  const loadNews = useCallback(
    async (currentPage) => {
      console.log("Loading news... Page", currentPage)
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
        console.log(error)
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
    console.log("Loading news on mount...")
    loadNews(page)
  }, [])

  const handleScroll = useCallback(() => {
    console.log("Scroll event detected")
    if (!isMounted.current || isLoadingRef.current || loading || !hasMore) return
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement
    const threshold = 10
    if (scrollHeight - (scrollTop + clientHeight) < threshold && !loading && hasMore) {
      loadNews(page)
    }
  }, [loading, hasMore, loadNews, page])

  useEffect(() => {
    console.log("Adding scroll event listener")
    const scrollHandler = handleScroll
    window.addEventListener("scroll", scrollHandler)
    return () => window.removeEventListener("scroll", scrollHandler)
  }, [handleScroll])

  return (
    <SideMenu style={{ position: "fixed" }} ContentView={SideContentContainer}>
      {error && <Paper>{error}</Paper>}
      {news.map((article) => (
        <Paper key={article._id}>
          <ReactMarkdown
            components={{
              img: ({ node, ...props }) => <img {...props} style={{ width: "100%", borderRadius: ".5rem" }} />,
              a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
              h1: ({ node, ...props }) => <strong {...props} />,
              h2: ({ node, ...props }) => <strong {...props} />,
              h3: ({ node, ...props }) => <strong {...props} />,
              h4: ({ node, ...props }) => <strong {...props} />,
              h5: ({ node, ...props }) => <strong {...props} />,
              h6: ({ node, ...props }) => <strong {...props} />
            }}>
            {article.content}
          </ReactMarkdown>
          <small>Publicado em {new Date(article.createdAt).toLocaleString()}</small>
        </Paper>
      ))}
      <Button variant="primary" $rounded onClick={loadNews} loading={loading} disabled={!hasMore}>
        {!hasMore ? "Fim" : !loading ? "Mais" : ""}
      </Button>
    </SideMenu>
  )
}

export default News
