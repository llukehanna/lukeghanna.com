// A status dot: filled accent for something running right now, a hollow ring otherwise.
export function StatusDot({ live, className = '' }: { live: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-[6px] shrink-0 rounded-full ${live ? 'bg-accent' : 'border border-dim'} ${className}`}
    />
  )
}
