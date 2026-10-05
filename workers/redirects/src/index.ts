// Permanent redirects for legacy and alias hostnames on lukeghanna.com. Each host below is
// attached to this Worker as a custom domain; the path and query string carry over.
const REDIRECTS: Record<string, string> = {
  'www.lukeghanna.com': 'lukeghanna.com',
  'ccc.lukeghanna.com': 'clippers.lukeghanna.com',
  'solitare.lukeghanna.com': 'solitaire.lukeghanna.com',
}

const worker = {
  fetch(request: Request): Response {
    const url = new URL(request.url)
    const target = REDIRECTS[url.hostname]
    if (!target) return new Response('Not found', { status: 404 })
    url.hostname = target
    url.protocol = 'https:'
    url.port = ''
    return Response.redirect(url.toString(), 301)
  },
}

export default worker
