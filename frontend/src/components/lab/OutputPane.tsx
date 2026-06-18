"use client"

import { useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Loader2, Copy, Check } from "lucide-react"
import { useState } from "react"

interface Props {
  output: string
  isLoading: boolean
  placeholder?: string
}

export function OutputPane({ output, isLoading, placeholder = "Output will appear here..." }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [output])

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
          Output
        </div>
        {output && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-gray-950 text-gray-100 rounded-b-lg min-h-[300px]">
        {output ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const isBlock = className?.includes("language-")
                return isBlock ? (
                  <pre className="bg-gray-800 rounded p-3 overflow-x-auto my-2 text-green-300">
                    <code {...props}>{children}</code>
                  </pre>
                ) : (
                  <code className="bg-gray-700 px-1 py-0.5 rounded text-green-300" {...props}>
                    {children}
                  </code>
                )
              },
              p({ children }) {
                return <p className="mb-2 text-gray-200 font-sans">{children}</p>
              },
              h2({ children }) {
                return <h2 className="text-base font-bold text-white mt-4 mb-2 font-sans">{children}</h2>
              },
              h3({ children }) {
                return <h3 className="text-sm font-bold text-gray-300 mt-3 mb-1 font-sans">{children}</h3>
              },
            }}
          >
            {output}
          </ReactMarkdown>
        ) : (
          <p className="text-gray-500 italic">{isLoading ? "Generating..." : placeholder}</p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
