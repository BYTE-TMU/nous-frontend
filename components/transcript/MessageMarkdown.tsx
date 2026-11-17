import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Models answer in Markdown (lists, bold, code, tables). react-markdown builds React
// elements and never injects raw HTML, so model output can't add markup of its own.
const components: Components = {
  p: (props) => <p className="my-2 first:mt-0 last:mb-0" {...props} />,
  ul: (props) => <ul className="my-2 list-disc space-y-1 pl-6" {...props} />,
  ol: (props) => <ol className="my-2 list-decimal space-y-1 pl-6" {...props} />,
  h1: (props) => <h3 className="mt-3 mb-1 text-2xl font-bold" {...props} />,
  h2: (props) => <h3 className="mt-3 mb-1 text-xl font-bold" {...props} />,
  h3: (props) => <h4 className="mt-3 mb-1 text-xl font-semibold" {...props} />,
  h4: (props) => <h4 className="mt-3 mb-1 text-xl font-semibold" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-2 border-l-4 border-current/30 pl-3 opacity-90" {...props} />
  ),
  a: (props) => <a className="underline" target="_blank" rel="noopener noreferrer" {...props} />,
  hr: () => <hr className="my-3 border-current/20" />,
  pre: (props) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-black/10 p-3 text-base" {...props} />
  ),
  code: ({ className, ...props }) => (
    <code
      className={`${className ?? ""} rounded bg-black/10 px-1 font-mono text-[0.9em] [pre_&]:bg-transparent [pre_&]:p-0`}
      {...props}
    />
  ),
  table: (props) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-base" {...props} />
    </div>
  ),
  th: (props) => <th className="border border-current/30 px-2 py-1 text-left" {...props} />,
  td: (props) => <td className="border border-current/30 px-2 py-1" {...props} />,
};

export default function MessageMarkdown({ children }: { children: string }) {
  return (
    <div className="min-w-0 break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
