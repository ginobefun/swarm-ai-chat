'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'

// Note: Import highlight.js styles in your main layout or global CSS:
// import 'highlight.js/styles/github-dark.css'

interface SafeMarkdownProps {
  content: string
  className?: string
}

/**
 * SafeMarkdown Component
 *
 * Safely renders markdown content with:
 * - XSS protection via rehype-sanitize
 * - GitHub Flavored Markdown support
 * - Syntax highlighting for code blocks
 * - Proper styling for all markdown elements
 */
const SafeMarkdown: React.FC<SafeMarkdownProps> = React.memo(({ content, className = '' }) => {
  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{
        // Custom styling for code blocks
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '')
          const isInline = !match

          if (isInline) {
            return (
              <code
                className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-md text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            )
          }

          return (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
        // Custom styling for pre blocks
        pre: ({ node, children, ...props }) => (
          <pre
            className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm font-mono my-3 border border-slate-700"
            {...props}
          >
            {children}
          </pre>
        ),
        // Custom styling for lists
        ul: ({ node, children, ...props }) => (
          <ul className="list-disc pl-4 space-y-1 my-2" {...props}>
            {children}
          </ul>
        ),
        ol: ({ node, children, ...props }) => (
          <ol className="list-decimal pl-4 space-y-1 my-2" {...props}>
            {children}
          </ol>
        ),
        li: ({ node, children, ...props }) => (
          <li className="ml-4 mb-1" {...props}>
            {children}
          </li>
        ),
        // Custom styling for links
        a: ({ node, children, ...props }) => (
          <a
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        ),
        // Custom styling for blockquotes
        blockquote: ({ node, children, ...props }) => (
          <blockquote
            className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic my-2"
            {...props}
          >
            {children}
          </blockquote>
        ),
        // Custom styling for tables
        table: ({ node, children, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table
              className="min-w-full divide-y divide-slate-200 dark:divide-slate-700"
              {...props}
            >
              {children}
            </table>
          </div>
        ),
        th: ({ node, children, ...props }) => (
          <th
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-semibold text-left"
            {...props}
          >
            {children}
          </th>
        ),
        td: ({ node, children, ...props }) => (
          <td className="px-4 py-2 border-t border-slate-200 dark:border-slate-700" {...props}>
            {children}
          </td>
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}, (prevProps, nextProps) => {
  // Only re-render if content or className changes
  return prevProps.content === nextProps.content && prevProps.className === nextProps.className
})

export default SafeMarkdown
