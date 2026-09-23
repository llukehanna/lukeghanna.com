import type { MDXComponents } from 'mdx/types'
import { CodeBlock } from '@/components/CodeBlock'
import { TableBox } from '@/components/TableBox'
import { Figure } from '@/components/Figure'
import { Flow } from '@/components/Flow'

const components: MDXComponents = {
  h2: (props) => <h2 className="mb-[14px] mt-10 scroll-mt-16 text-[24px] font-semibold leading-[1.25] tracking-[-0.02em] text-ink first:mt-0" {...props} />,
  p: (props) => <p className="mb-4 text-[16px] leading-[1.65] text-mute" {...props} />,
  strong: (props) => <strong className="font-medium text-ink" {...props} />,
  pre: (props) => <CodeBlock {...props} />,
  code: (props) => <code className="font-mono text-[0.95em]" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-[26px] rounded-[12px] border-l-2 border-accent bg-accent-soft px-5 py-[18px] text-[18px] font-medium leading-[1.45] text-ink [&>p]:m-0 [&>p]:text-ink [&>p]:text-[18px]" {...props} />
  ),
  ul: (props) => <ul className="mb-4 list-disc pl-5 text-[16px] leading-[1.65] text-mute" {...props} />,
  ol: (props) => <ol className="mb-4 list-decimal pl-5 text-[16px] leading-[1.65] text-mute" {...props} />,
  a: (props) => <a className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink" {...props} />,
  table: (props) => <TableBox {...props} />,
  thead: (props) => <thead className="bg-[var(--card)]" {...props} />,
  th: (props) => <th className="border-b border-line px-3 py-2 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-dim" {...props} />,
  td: (props) => <td className="border-b border-line px-3 py-2 align-top text-mute last:border-b-0 [tr:last-child>&]:border-b-0" {...props} />,
  Figure,
  Flow,
}

export function useMDXComponents(): MDXComponents {
  return components
}
