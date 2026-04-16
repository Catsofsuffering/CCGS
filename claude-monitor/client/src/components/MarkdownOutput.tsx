import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownOutputProps {
  markdown: string;
  className?: string;
}

export function MarkdownOutput({ markdown, className = "" }: MarkdownOutputProps) {
  return (
    <div className={`markdown-output ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold text-gray-100 tracking-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-6 text-base font-semibold text-gray-100 tracking-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="text-sm leading-7 text-gray-300">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 text-sm text-gray-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 text-sm text-gray-300">{children}</ol>,
          li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
          hr: () => <hr className="border-border/80" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l border-accent/40 pl-4 italic text-gray-400">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline decoration-accent/30 underline-offset-4 hover:text-accent-hover"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[12px] text-gray-200">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-md border border-border bg-surface-1 px-4 py-3">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-sm text-gray-300">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="border-b border-border text-left">{children}</thead>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border-b border-border/60 px-3 py-2 align-top">{children}</td>,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
