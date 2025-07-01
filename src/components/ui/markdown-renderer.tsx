'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import Image from 'next/image'
import { useTranslation } from '@/contexts/AppContext'
import 'katex/dist/katex.min.css'

interface MarkdownRendererProps {
    content: string
    className?: string
}

// Separate CodeBlock component to use hooks
const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [copied, setCopied] = React.useState(false)
    const { t } = useTranslation()

    const handleCopy = () => {
        // Extract text content from nested elements
        const extractText = (element: unknown): string => {
            if (typeof element === 'string') return element
            if (typeof element === 'number') return element.toString()
            if (React.isValidElement(element)) {
                const props = element.props as { children?: unknown }
                if (props.children) {
                    if (Array.isArray(props.children)) {
                        return props.children.map(extractText).join('')
                    }
                    return extractText(props.children)
                }
            }
            return ''
        }

        const codeText = extractText(children)

        navigator.clipboard.writeText(codeText).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = codeText
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    return (
        <div className="relative group">
            <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-3 sm:p-4 rounded-xl overflow-x-auto font-mono my-3 sm:my-4 border border-slate-700/50 shadow-lg text-xs sm:text-sm">
                {children}
            </pre>
            <button
                className={`absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 sm:p-2 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${copied ? 'copy-success' : ''}`}
                onClick={handleCopy}
                title={copied ? t('common.copied') : t('common.copyCode')}
                aria-label={copied ? t('common.copied') : t('common.copyCode')}
            >
                {copied ? '✅' : '📋'}
            </button>
        </div>
    )
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
    content,
    className = ''
}) => {
    return (
        <div className={`prose prose-sm max-w-none dark:prose-invert
      prose-p:my-3 prose-p:leading-relaxed
      prose-headings:font-semibold prose-headings:tracking-tight
      prose-h1:text-lg sm:prose-h1:text-xl prose-h2:text-base sm:prose-h2:text-lg prose-h3:text-sm sm:prose-h3:text-base prose-h4:text-xs sm:prose-h4:text-sm
      prose-ul:my-3 prose-ol:my-3 prose-li:my-1
      prose-code:text-xs sm:prose-code:text-sm prose-code:font-mono
      prose-pre:my-4 prose-pre:p-0
      prose-table:my-4 prose-table:text-xs sm:prose-table:text-sm
      prose-blockquote:my-4 prose-blockquote:not-italic
      prose-img:my-4 prose-img:rounded-lg
      ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeHighlight, rehypeKatex, rehypeRaw]}
                components={{
                    // Enhanced code block styling with copy button
                    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,

                    // Enhanced inline code styling
                    code: ({ children, className, ...props }) => {
                        const isInline = !className?.includes('language-')
                        if (isInline) {
                            return (
                                <code
                                    className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-mono border border-slate-200 dark:border-slate-700"
                                    {...props}
                                >
                                    {children}
                                </code>
                            )
                        }
                        // Enhanced styling for code blocks
                        return (
                            <code
                                className={`${className} font-mono text-sm leading-relaxed`}
                                {...props}
                            >
                                {children}
                            </code>
                        )
                    },

                    // Enhanced table styling with better responsiveness
                    table: ({ children, ...props }) => (
                        <div className="overflow-x-auto my-4 sm:my-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props}>
                                {children}
                            </table>
                        </div>
                    ),

                    thead: ({ children, ...props }) => (
                        <thead className="bg-slate-50 dark:bg-slate-800/50" {...props}>
                            {children}
                        </thead>
                    ),

                    th: ({ children, ...props }) => (
                        <th
                            className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                            {...props}
                        >
                            {children}
                        </th>
                    ),

                    td: ({ children, ...props }) => (
                        <td
                            className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700"
                            {...props}
                        >
                            {children}
                        </td>
                    ),

                    // Enhanced blockquote styling with responsiveness
                    blockquote: ({ children, ...props }) => (
                        <blockquote
                            className="border-l-4 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 pl-4 sm:pl-6 pr-3 sm:pr-4 py-3 sm:py-4 my-4 sm:my-6 rounded-r-lg shadow-sm"
                            {...props}
                        >
                            <div className="text-indigo-900 dark:text-indigo-100 italic text-sm sm:text-base">
                                {children}
                            </div>
                        </blockquote>
                    ),

                    // Enhanced heading styling with anchor links
                    h1: ({ children, ...props }) => (
                        <h1
                            className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700"
                            {...props}
                        >
                            {children}
                        </h1>
                    ),

                    h2: ({ children, ...props }) => (
                        <h2
                            className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700"
                            {...props}
                        >
                            {children}
                        </h2>
                    ),

                    h3: ({ children, ...props }) => (
                        <h3
                            className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-6 mb-3"
                            {...props}
                        >
                            {children}
                        </h3>
                    ),

                    h4: ({ children, ...props }) => (
                        <h4
                            className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-6 mb-3"
                            {...props}
                        >
                            {children}
                        </h4>
                    ),

                    // Enhanced paragraph styling with better spacing
                    p: ({ children, ...props }) => (
                        <p
                            className="text-slate-700 dark:text-slate-300 leading-relaxed my-4"
                            {...props}
                        >
                            {children}
                        </p>
                    ),

                    // Enhanced list styling with better spacing
                    ul: ({ children, ...props }) => (
                        <ul
                            className="list-disc list-outside space-y-1 my-4 pl-6 text-slate-700 dark:text-slate-300"
                            {...props}
                        >
                            {children}
                        </ul>
                    ),

                    ol: ({ children, ...props }) => (
                        <ol
                            className="list-decimal list-outside space-y-1 my-4 pl-6 text-slate-700 dark:text-slate-300"
                            {...props}
                        >
                            {children}
                        </ol>
                    ),

                    li: ({ children, ...props }) => (
                        <li
                            className="leading-relaxed marker:text-indigo-600 dark:marker:text-indigo-400 marker:text-base"
                            {...props}
                        >
                            {children}
                        </li>
                    ),

                    // Enhanced link styling
                    a: ({ children, href, ...props }) => (
                        <a
                            href={href}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-2 hover:underline-offset-4 transition-all duration-200"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                        >
                            {children}
                        </a>
                    ),

                    // Enhanced image styling with Next.js optimization
                    img: ({ src, alt }) => {
                        if (!src || typeof src !== 'string') return null

                        // Check if it's a data URL or external URL
                        const isDataUrl = src.startsWith('data:')
                        const isExternalUrl = src.startsWith('http')

                        if (isDataUrl || isExternalUrl) {
                            // For data URLs and external URLs, use regular img tag
                            return (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={src}
                                    alt={alt || ''}
                                    className="max-w-full h-auto rounded-lg shadow-md my-4 border border-slate-200 dark:border-slate-700"
                                />
                            )
                        }

                        // For local images, use Next.js Image component
                        return (
                            <div className="relative my-4">
                                <Image
                                    src={src}
                                    alt={alt || ''}
                                    width={800}
                                    height={600}
                                    className="max-w-full h-auto rounded-lg shadow-md border border-slate-200 dark:border-slate-700"
                                    style={{ width: 'auto', height: 'auto' }}
                                />
                            </div>
                        )
                    },

                    // Enhanced horizontal rule styling
                    hr: ({ ...props }) => (
                        <hr
                            className="my-8 border-t-2 border-slate-200 dark:border-slate-700"
                            {...props}
                        />
                    ),

                    // Enhanced strong and emphasis styling
                    strong: ({ children, ...props }) => (
                        <strong
                            className="font-semibold text-slate-900 dark:text-slate-100"
                            {...props}
                        >
                            {children}
                        </strong>
                    ),

                    em: ({ children, ...props }) => (
                        <em
                            className="italic text-slate-700 dark:text-slate-300"
                            {...props}
                        >
                            {children}
                        </em>
                    ),

                    // Task list styling
                    input: ({ type, checked, ...props }) => {
                        if (type === 'checkbox') {
                            return (
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    className="mr-2 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                    disabled
                                    {...props}
                                />
                            )
                        }
                        return <input type={type} {...props} />
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
} 