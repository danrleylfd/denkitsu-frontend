import { useState } from "react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import "highlight.js/styles/atom-one-dark.css"

import Button from "./Button"
import YoutubeEmbed from "./YoutubeEmbed"
import TweetEmbed from "./TweetEmbed"

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

const Markdown = ({ content, think }) => {
  const [collapsed, setCollapsed] = useState(false)

  const toggleCollapse = () => setCollapsed((prev) => !prev)

  const containerClass = think
    ? "italic break-words p-2 rounded-md text-lightFg-secondary dark:text-darkFg-secondary bg-lightBg-tertiary dark:bg-darkBg-tertiary opacity-75 dark:opacity-90"
    : ""

  return (
    <div className={containerClass} data-oid="lh0jqb8">
      {think && (
        <Button variant="secondary" $rounded onClick={toggleCollapse} data-oid="4y.jcqz">
          {collapsed ? "Mostrar raciocínio" : "Esconder raciocínio"}
        </Button>
      )}
      {!collapsed && (
        <ReactMarkdown
          children={content}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, children, ...props }) => (
              <h4 className="text-lightFg-primary dark:text-darkFg-primary" {...props} data-oid="lhf1q:4">
                {children}
              </h4>
            ),
            h2: ({ node, children, ...props }) => (
              <h6 className="text-lightFg-primary dark:text-darkFg-primary" {...props} data-oid="pfvfguy">
                {children}
              </h6>
            ),
            h3: ({ node, children, ...props }) => (
              <h5 className="text-lightFg-primary dark:text-darkFg-primary" {...props} data-oid="45cx3w4">
                {children}
              </h5>
            ),
            h4: ({ node, children, ...props }) => (
              <h6 className="text-lightFg-primary dark:text-darkFg-primary" {...props} data-oid="ain7_qd">
                {children}
              </h6>
            ),
            h5: ({ node, children, ...props }) => (
              <h5 className="text-lightFg-primary dark:text-darkFg-primary" {...props} data-oid="w3js725">
                {children}
              </h5>
            ),
            h6: ({ node, children, ...props }) => (
              <h6 className="text-lightFg-primary dark:text-darkFg-primary" {...props} data-oid="0ygja9t">
                {children}
              </h6>
            ),
            strong: ({ node, children, ...props }) => (
              <strong className="text-lightFg-primary dark:text-darkFg-primary" {...props} data-oid="h7qrhw2">
                {children}
              </strong>
            ),
            blockquote: ({ node, children, ...props }) => (
              <blockquote
                className="bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-secondary dark:text-darkFg-secondary border border-solid border-brand-purple rounded border-l-4 border-r-0 border-y-0 p-2 italic"
                {...props}
                data-oid="3qhkqbv">
                {children}
              </blockquote>
            ),
            p: ({ node, children, ...props }) => (
              <p {...props} className="text-lightFg-primary dark:text-darkFg-primary" data-oid="ejrtx4r">
                {children}
              </p>
            ),
            a: ({ node, href, children, ...props }) => {
              const videoId = getYouTubeVideoId(href)
              if (videoId) {
                return <YoutubeEmbed videoId={videoId} data-oid=".5:2y0b" />
              }
              const tweetId = getTweetId(href)
              if (tweetId) {
                return <TweetEmbed tweetID={tweetId} data-oid=".am3f2." />
              }
              return (
                <a
                  href={href}
                  className="text-primary-base hover:text-primary-light active:text-primary-dark"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                  data-oid="q_sehdd">
                  {children}
                </a>
              )
            },
            span: ({ node, children, ...props }) => (
              <span className="text-lightFg-secondary dark:text-darkFg-secondary" {...props} data-oid="ntr6xzf">
                {children}
              </span>
            ),
            img: ({ node, children, ...props }) => (
              <img className="w-full rounded" {...props} data-oid="i9zhcq.">
                {children}
              </img>
            ),
            pre: ({ node, children, ...props }) => (
              <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary break-words text-pretty text-xs p-2 rounded-md" {...props} data-oid="hscu81v">
                {children}
              </pre>
            ),
            code: ({ node, className, children, ...props }) => (
              <code
                className={`bg-lightBg-tertiary dark:bg-darkBg-tertiary break-words text-pretty text-xs p-2 rounded-md ${className}`}
                {...props}
                data-oid="4pfd1p7">
                {children}
              </code>
            ),
            table: ({ node, children, ...props }) => (
              <table className="w-full my-4 border-collapse border border-lightBorder dark:border-darkBorder rounded" {...props} data-oid="u6dkttp">
                {children}
              </table>
            ),
            thead: ({ node, children, ...props }) => (
              <thead className="bg-lightBg-secondary dark:bg-darkBg-secondary" {...props} data-oid="37_07ge">
                {children}
              </thead>
            ),
            tbody: ({ node, children, ...props }) => (
              <tbody className="divide-y divide-lightBorder dark:divide-darkBorder" {...props} data-oid="b.k79o3">
                {children}
              </tbody>
            ),
            tr: ({ node, children, ...props }) => (
              <tr className="hover:bg-lightBg-tertiary dark:hover:bg-darkBg-tertiary transition-colors" {...props} data-oid="b-gfvc-">
                {children}
              </tr>
            ),
            th: ({ node, children, ...props }) => (
              <th className="text-lightFg-primary dark:text-darkFg-primary px-4 py-2 text-left font-medium" {...props} data-oid="bcyf_ob">
                {children}
              </th>
            ),
            td: ({ node, children, ...props }) => (
              <td className="text-lightFg-secondary dark:text-darkFg-secondary px-4 py-2 text-left" {...props} data-oid="_4dbg6r">
                {children}
              </td>
            )
          }}
          data-oid="02trwg_"
        />
      )}
      {think && (
        <Button variant="secondary" $rounded onClick={toggleCollapse} data-oid="g.rmjd2">
          {collapsed ? "Mostrar raciocínio" : "Esconder raciocínio"}
        </Button>
      )}
    </div>
  )
}

export default Markdown
