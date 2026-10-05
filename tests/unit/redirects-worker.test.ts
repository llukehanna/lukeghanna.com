import { describe, expect, it } from 'vitest'
import worker from '@/workers/redirects/src/index'

const hit = (url: string) => worker.fetch(new Request(url))

describe('redirects worker', () => {
  it('sends www to the apex, keeping path and query', () => {
    const res = hit('https://www.lukeghanna.com/work/ccc?x=1')
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('https://lukeghanna.com/work/ccc?x=1')
  })

  it('sends the old CCC and misspelled Solitaire hosts to their real names', () => {
    expect(hit('https://ccc.lukeghanna.com/live').headers.get('location')).toBe('https://clippers.lukeghanna.com/live')
    expect(hit('https://solitare.lukeghanna.com/').headers.get('location')).toBe('https://solitaire.lukeghanna.com/')
  })

  it('404s any host it does not know', () => {
    expect(hit('https://lukeghanna-redirects.lllukehanna.workers.dev/').status).toBe(404)
  })
})
