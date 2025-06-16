import { useState } from "react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import "highlight.js/styles/gml.css"

import Button from "./Button"

const Markdown = ({ content, think }) => {
  const [collapsed, setCollapsed] = useState(think)

  const toggleCollapse = () => setCollapsed((prev) => !prev)

  const containerClass = think
    ? "italic break-words p-2 rounded-md text-lightFg-secondary dark:text-darkFg-secondary bg-lightBg-tertiary dark:bg-darkBg-tertiary opacity-75 dark:opacity-90"
    : ""

  return (
    <div className={containerClass}>
      {think && (
        <Button variant="secondary" $rounded onClick={toggleCollapse}>
          {collapsed ? "Mostrar raciocínio" : "Esconder raciocínio"}
        </Button>
      )}
      {!collapsed && (
        <ReactMarkdown
          children={content}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ node, ...props }) => <img className="w-full rounded" {...props} />,
            a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
            h1: ({ node, ...props }) => <strong {...props} />,
            h2: ({ node, ...props }) => <strong {...props} />,
            h3: ({ node, ...props }) => <strong {...props} />,
            h4: ({ node, ...props }) => <strong {...props} />,
            h5: ({ node, ...props }) => <strong {...props} />,
            h6: ({ node, ...props }) => <strong {...props} />,
            p: ({ node, ...props }) => <p {...props} />,
            pre: ({ node, ...props }) => <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary break-words text-pretty text-xs p-2 rounded-md" {...props} />,
            code: ({ node, inline, className, children, ...props }) => (
              <code className="bg-lightBg-tertiary dark:bg-darkBg-tertiary break-words text-pretty text-xs p-2 rounded-md" {...props}>
                {children}
              </code>
            )
          }}
        />
      )}
    </div>
  )
}

export default Markdown
