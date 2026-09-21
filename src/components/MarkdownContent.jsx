import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

function MarkdownContent({ children, className = '' }) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children: content }) => <p className="m-0">{content}</p>,
          pre: ({ children: content }) => <pre className="my-3 overflow-x-auto rounded-xl bg-[#263b31] p-4 text-sm text-[#e8eee8]">{content}</pre>,
          code: ({ children: content, className: codeClassName }) => codeClassName
            ? <code className={codeClassName}>{content}</code>
            : <code className="rounded bg-[#eef3e8] px-1.5 py-0.5 font-mono text-[0.9em] text-[#49623f]">{content}</code>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownContent
