import GithubSlugger from 'github-slugger'

export function extractToc(mdxSource: string): { id: string; text: string }[] {
  const slugger = new GithubSlugger()
  const out: { id: string; text: string }[] = []
  let inFence = false
  for (const raw of mdxSource.split('\n')) {
    const line = raw.trimEnd()
    if (/^```/.test(line)) { inFence = !inFence; continue }
    if (inFence) continue
    const m = /^## (.+)$/.exec(line)
    if (m) {
      const text = m[1].trim()
      out.push({ id: slugger.slug(text), text })
    }
  }
  return out
}
