import { useState } from "react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import "highlight.js/styles/atom-one-dark.css"

import Button from "./Button"

const Markdown = ({ content, think }) => {
  const [collapsed, setCollapsed] = useState(false)

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
            h1: ({ node, children, ...props }) => <h1 className="text-lightFg-primary dark:text-darkFg-primary" {...props}>{children}</h1>,
            h2: ({ node, children, ...props }) => <h2 className="text-lightFg-primary dark:text-darkFg-primary" {...props}>{children}</h2>,
            h3: ({ node, children, ...props }) => <h3 className="text-lightFg-primary dark:text-darkFg-primary" {...props}>{children}</h3>,
            h4: ({ node, children, ...props }) => <h4 className="text-lightFg-primary dark:text-darkFg-primary" {...props}>{children}</h4>,
            h5: ({ node, children, ...props }) => <h5 className="text-lightFg-primary dark:text-darkFg-primary" {...props}>{children}</h5>,
            h6: ({ node, children, ...props }) => <h6 className="text-lightFg-primary dark:text-darkFg-primary" {...props}>{children}</h6>,
            blockquote: ({ node, children, ...props }) => <blockquote className="bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-secondary dark:text-darkFg-secondary border border-solid border-brand-purple rounded border-l-4 border-r-0 border-y-0 p-2 italic" {...props}>{children}</blockquote>,
            p: ({ node, children, ...props }) => <p className="text-lightFg-primary dark:text-darkFg-primary" {...props}>{children}</p>,
            a: ({ node, children, ...props }) => <a className="text-primary-base hover:text-primary-light active:text-primary-dark" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>,
            span: ({ node, children, ...props }) => <span className="text-lightFg-secondary dark:text-darkFg-secondary" {...props}>{children}</span>,
            img: ({ node, ...props }) => <img className="w-full rounded" {...props} />,
            pre: ({ node, children, ...props }) => <pre className="bg-lightBg-tertiary dark:bg-darkBg-tertiary break-words text-pretty text-xs p-2 rounded-md" {...props}>{children}</pre>,
            code: ({ node, className, children, ...props }) => <code className={`bg-lightBg-tertiary dark:bg-darkBg-tertiary break-words text-pretty text-xs p-2 rounded-md ${className}`} {...props}>{children}</code>,
            table: ({ node, children, ...props }) => <table className="w-full my-4 border-collapse border border-lightBorder dark:border-darkBorder rounded" {...props}>{children}</table>,
            thead: ({ node, children, ...props }) => <thead className="bg-lightBg-secondary dark:bg-darkBg-secondary" {...props}>{children}</thead>,
            tbody: ({ node, children, ...props }) => <tbody className="divide-y divide-lightBorder dark:divide-darkBorder" {...props}>{children}</tbody>,
            tr: ({ node, children, ...props }) => <tr className="hover:bg-lightBg-tertiary dark:hover:bg-darkBg-tertiary transition-colors" {...props}>{children}</tr>,
            th: ({ node, children, ...props }) => <th className="text-lightFg-primary dark:text-darkFg-primary px-4 py-2 text-left font-medium" {...props}>{children}</th>,
            td: ({ node, children, ...props }) => <td className="text-lightFg-secondary dark:text-darkFg-secondary px-4 py-2 text-left" {...props}>{children}</td>,
          }}
        />
      )}
    </div>
  )
}

export default Markdown
