import { Caption } from '@/components/Figure'
import { Reveal } from '@/components/Reveal'

export type FlowNode = { title: string; detail?: string; note?: string }
// A step is one node, or a row of nodes that run side by side (parallel sources, fan-out).
export type FlowStep = FlowNode | FlowNode[]

function Node({ node }: { node: FlowNode }) {
  return (
    <div className="glass min-w-0 rounded-[12px] px-4 py-3">
      <div className="text-[13.5px] font-semibold leading-[1.3] text-ink">{node.title}</div>
      {node.detail && <div className="mt-1 text-[12.5px] leading-[1.45] text-mute">{node.detail}</div>}
      {node.note && <div className="mt-[6px] font-mono text-[10.5px] uppercase tracking-[0.08em] text-accent">{node.note}</div>}
    </div>
  )
}

function Arrow() {
  return (
    <div aria-hidden className="flex justify-center py-[2px]">
      <svg width="14" height="22" viewBox="0 0 14 22" className="text-dim">
        <path d="M7 0v16" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M2 14l5 6 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// A diagram of a real pipeline or loop: a vertical sequence of steps drawn from the code,
// never a box that does not correspond to a module, table, or state in the repository.
export function Flow({ n, caption, source, steps }: { n: number; caption: string; source: string; steps: FlowStep[] }) {
  return (
    <Reveal>
      <figure className="my-7">
        <div className="mx-auto max-w-[560px]">
          {steps.map((step, i) => (
            <div key={i}>
              {i > 0 && <Arrow />}
              {Array.isArray(step) ? (
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${step.length}, minmax(0, 1fr))` }}>
                  {step.map((node) => <Node key={node.title} node={node} />)}
                </div>
              ) : (
                <Node node={step} />
              )}
            </div>
          ))}
        </div>
        <Caption n={n} source={source}>{caption}</Caption>
      </figure>
    </Reveal>
  )
}
