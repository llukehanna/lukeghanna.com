import { Rail, type RailNavItem } from '@/components/Rail'
import { ActiveSectionProvider } from '@/components/ActiveSection'
import { Section } from '@/components/Section'
import { ProjectList } from '@/components/ProjectList'
import { CopyEmail } from '@/components/CopyEmail'
import { projects } from '@/content/projects'
import { buildLabel } from '@/lib/colophon'
import { links } from '@/lib/site'

const nav: RailNavItem[] = [
  { id: 'about', label: 'About', index: '01' },
  {
    id: 'projects',
    label: 'Projects',
    index: '02',
    children: projects.map((p) => ({ id: p.slug, label: p.title, live: p.live })),
  },
  { id: 'contact', label: 'Contact', index: '03' },
]

// Derived from the project list so the row can never go stale.
const liveSites = projects.filter((p) => p.where.includes('lukeghanna.com')).length

const facts = [
  ['Fellowship', 'Palantir American Tech Fellowship', 'Frontiers · May–Jul 2026'],
  ['Builds with', 'TypeScript, Python, Swift, Postgres', null],
  ['Shipped', `${projects.length} projects · ${liveSites} live sites`, null],
] as const

const built = buildLabel()

const button = 'inline-flex h-11 items-center justify-center rounded-[12px] border border-line px-4 text-[13.5px] font-medium text-mute transition-colors hover:border-[var(--glass-line)] hover:text-ink'

export default function Home() {
  return (
    <ActiveSectionProvider items={nav}>
      <Rail variant="home" nav={nav} />
      <main className="px-6 pb-12 pt-12 [&>section:last-child]:mb-0 max-md:px-5 max-md:pt-8 lg:pl-[400px] lg:pr-12">
        <Section id="about" title="About" index="01">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] max-lg:gap-6">
            <p className="text-[18px] leading-[1.6] text-mute max-md:text-[16.5px]">
              I&apos;m fascinated by what AI makes possible, and I build software end-to-end because it&apos;s the fastest way I know to
              understand how something works:{' '}
              <span className="text-ink">the product shape, the systems behind it, the data, the interface, and getting it deployed.</span>{' '}
              Every project here has a write-up that says exactly what state it&apos;s in.
            </p>
            <dl className="flex flex-col self-start border-b border-line">
              {facts.map(([k, v, sub]) => (
                <div key={k} className="flex items-baseline justify-between gap-5 border-t border-line py-3">
                  <dt className="label shrink-0">{k}</dt>
                  <dd className="text-right text-[14px] font-medium leading-[1.35] tabular-nums">
                    {v}
                    {sub && <span className="block font-normal text-dim">{sub}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        <Section id="projects" title="Projects" index="02">
          <ProjectList projects={projects} />
        </Section>

        <Section id="contact" title="Contact" index="03">
          <p className="text-[18px] leading-[1.6] text-mute max-md:text-[16px]">
            The fastest way to reach me is email. I&apos;m also on GitHub and LinkedIn.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 max-md:grid max-md:grid-cols-2">
            <CopyEmail className="max-md:col-span-2" />
            <a href={links.github.href} target="_blank" rel="noreferrer" className={button}>
              GitHub <span aria-hidden className="ml-1">↗</span>
            </a>
            <a href={links.linkedin.href} target="_blank" rel="noreferrer" className={button}>
              LinkedIn <span aria-hidden className="ml-1">↗</span>
            </a>
          </div>
          <p className="mt-16 border-t border-line pt-4 font-mono text-[11px] tracking-[0.03em] text-dim">
            Built with Next.js, deployed on Vercel, last updated {built}.
          </p>
        </Section>
      </main>
    </ActiveSectionProvider>
  )
}
