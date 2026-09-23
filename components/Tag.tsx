export function Tag({ children }: { children: string }) {
  return <span className="rounded-full border border-line bg-[var(--card)] px-[9px] py-[6px] text-[11px] font-medium text-accent">{children}</span>
}
