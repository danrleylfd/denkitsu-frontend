import { useState } from "react"
import { Minimize2, Maximize2, Brain, ScanText } from "lucide-react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import Mermaid from "./Mermaid"
import "highlight.js/styles/atom-one-dark.css"

import Button from "./Button"
import YoutubeEmbed from "./Embeds/YoutubeEmbed"
import TweetEmbed from "./Embeds/TweetEmbed"

const getYouTubeVideoId = (url) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|music\.youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|shorts\/|browse\/)?([\w-]{11})(?:\S+)?/
  const match = url.match(regex)
  return match ? match[1] : null
}

const getTweetId = (url) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:x|twitter)\.com\/\w+\/status\/(\d+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

const Markdown = ({ loading, content, think, page }) => {
  const [thinkCollapsed, setThinkCollapsed] = useState((think && !loading))
  const [pageCollapsed, setPageCollapsed] = useState((page && !loading))

  const toggleThinkCollapse = () => setThinkCollapsed((prev) => !prev)
  const togglePageCollapse = () => setPageCollapsed((prev) => !prev)

  const commonContainerClass = "italic break-words p-2 rounded-md text-lightFg-secondary dark:text-darkFg-secondary bg-lightBg-tertiary dark:bg-darkBg-tertiary opacity-80 dark:opacity-90"

  const markdownComponents = {
    h1: ({ node, children, ...props }) => (
      <h1 className="text-lightFg-primary dark:text-darkFg-primary" {...props}>
        {children}
      </h1>
    ),
    h2: ({ node, children, ...props }) => (
      <h2 className="text-lightFg-primary dark:text-darkFg-primary" {...props}>
        {children}
      </h2>
    ),
    h3: ({ node, children, ...props }) => (
      <h3 className="text-lightFg-primary dark:text-darkFg-primary" {...props}>
        {children}
      </h3>
    ),
    h4: ({ node, children, ...props }) => (
      <h4 className="text-lightFg-primary dark:text-darkFg-primary" {...props}>
        {children}
      </h4>
    ),
    h5: ({ node, children, ...props }) => (
      <h5 className="text-lightFg-primary dark:text-darkFg-primary" {...props}>
        {children}
      </h5>
    ),
    h6: ({ node, children, ...props }) => (
      <h6 className="text-lightFg-primary dark:text-darkFg-primary" {...props}>
        {children}
      </h6>
    ),
    strong: ({ node, children, ...props }) => (
      <strong className="text-lightFg-primary dark:text-darkFg-primary" {...props}>
        {children}
      </strong>
    ),
    blockquote: ({ node, children, ...props }) => (
      <blockquote
        className="bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-secondary dark:text-darkFg-secondary border border-solid border-brand-purple rounded border-l-4 border-r-0 border-y-0 p-2 my-1 italic"
        {...props}>
        {children}
      </blockquote>
    ),
    p: ({ node, children, ...props }) => (
      <p {...props} className="text-lightFg-primary dark:text-darkFg-primary">
        {children}
      </p>
    ),
    a: ({ node, href, children, ...props }) => {
      const videoId = getYouTubeVideoId(href)
      if (videoId) {
        return <YoutubeEmbed videoId={videoId} />
      }
      const tweetId = getTweetId(href)
      if (tweetId) {
        return <TweetEmbed tweetID={tweetId} />
      }
      return (
        <a
          href={href}
          className="text-primary-base hover:text-primary-light active:text-primary-dark"
          target="_blank"
          rel="noopener noreferrer"
          {...props}>
          {children}
        </a>
      )
    },
    span: ({ node, children, ...props }) => (
      <span className="text-lightFg-secondary dark:text-darkFg-secondary" {...props}>
        {children}
      </span>
    ),
    img: ({ node, children, ...props }) => (
      <img className="w-full rounded" {...props}>
        {children}
      </img>
    ),
    pre: ({ node, children, ...props }) => (
      <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary break-words text-pretty text-xs rounded-md" {...props}>
        {children}
      </pre>
    ),
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "")
      if (match && match[1] === "mermaid") {
        return (
          <div className="flex justify-center bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-md">
            <Mermaid chart={String(children).trim()} />
          </div>
        )
      }
      return (
        <code
          className={`bg-lightBg-tertiary dark:bg-darkBg-tertiary break-words text-pretty text-xs p-2 rounded-md ${className}`}
          {...props}>
          {children}
        </code>
      )
    },
    li: ({ node, children, ...props }) => (
      <li {...props} className="text-lightFg-primary dark:text-darkFg-primary">
        {children}
      </li>
    ),
    table: ({ node, children, ...props }) => (
      <table className="my-2 border-collapse border border-bLight dark:border-bDark rounded-lg" {...props}>
        {children}
      </table>
    ),
    thead: ({ node, children, ...props }) => (
      <thead className="bg-lightBg-secondary dark:bg-darkBg-secondary rounded-t-lg" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ node, children, ...props }) => (
      <tbody className="divide-y divide-bLight dark:divide-bDark" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ node, children, ...props }) => (
      <tr className="hover:bg-lightBg-tertiary dark:hover:bg-darkBg-tertiary transition-colors rounded-lg" {...props}>
        {children}
      </tr>
    ),
    th: ({ node, children, ...props }) => (
      <th className="text-lightFg-primary dark:text-darkFg-primary px-2 py-1 text-left font-medium text-xs" {...props}>
        {children}
      </th>
    ),
    td: ({ node, children, ...props }) => (
      <td className="text-lightFg-secondary dark:text-darkFg-secondary px-2 py-1 text-left text-xs" {...props}>
        {children}
      </td>
    )
  }

  const markdownProps = {
    children: content,
    rehypePlugins: [rehypeHighlight, rehypeRaw],
    remarkPlugins: [remarkGfm],
    components: markdownComponents,
  }

  if (think) {
    return (
      <div className={commonContainerClass}>
        <div className="flex gap-2 items-center">
          <Button variant="secondary" size="icon" $rounded onClick={toggleThinkCollapse}>
            {thinkCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </Button>
          <Brain size={16} />
          <span>Pensamentos de Denkitsu...</span>
        </div>
        {!thinkCollapsed && (
          <>
            <ReactMarkdown {...markdownProps} />
            <Button variant="secondary" size="icon" $rounded onClick={toggleThinkCollapse}>
              <Minimize2 size={16} />
            </Button>
          </>
        )}
      </div>
    )
  }

  if (page) {
    return (
      <div className={commonContainerClass}>
        <div className="flex gap-2 items-center">
          <Button variant="secondary" size="icon" $rounded onClick={togglePageCollapse}>
            {pageCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </Button>
          <ScanText size={16} />
          <span>Conteúdo da Página...</span>
        </div>
        {!pageCollapsed && (
          <>
            <ReactMarkdown {...markdownProps} />
            <Button variant="secondary" size="icon" $rounded onClick={togglePageCollapse}>
              <Minimize2 size={16} />
            </Button>
          </>
        )}
      </div>
    )
  }

  return <ReactMarkdown {...markdownProps} />
}

export default Markdown
