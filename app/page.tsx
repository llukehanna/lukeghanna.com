import { Rail, type RailNavItem } from '@/components/Rail'
import { ActiveSectionProvider } from '@/components/ActiveSection'
import { Section } from '@/components/Section'
import { ProjectList } from '@/components/ProjectList'
import { projects } from '@/content/projects'
import { buildLabel } from '@/lib/colophon'
import { links } from '@/lib/site'

const nav: RailNavItem[] = [
  { id: 'about', label: 'About', index: '01' },
  { id: 'work', label: 'Work', index: '02' },
  { id: 'contact', label: 'Contact', index: '03' },
]

const facts = [
  ['Now', 'Senior year, USC'],
  ['Summer 2026', 'Corp dev, Houlihan Lokey'],
  ['Builds with', 'Next.js, Postgres, Swift, Python'],
  ['Based in', 'Los Angeles'],
] as const

const built = buildLabel()

export default function Home() {
  return (
    <ActiveSectionProvider items={nav}>
      <Rail variant="home" nav={nav} />
      <main className="px-6 pb-20 pt-12 lg:pl-[400px] lg:pr-12">
        <Section id="about" title="About" index="01">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
            <p className="text-[17px] leading-[1.6] text-mute">
              I&apos;m a senior at USC studying <b className="font-medium text-ink">computer science and business</b>, and I spent summer 2026 in
              corporate development at <b className="font-medium text-ink">Houlihan Lokey</b>. I build software on the side because it&apos;s the
              fastest way I know to understand how something works: the product shape, the systems behind it, the data, and getting it deployed.
              Everything on this page is self-initiated and running.
            </p>
            <dl className="grid grid-cols-2 gap-[10px] content-start max-md:grid-cols-1">
              {facts.map(([k, v]) => (
                <div key={k} className="rounded-[12px] border border-line bg-[var(--card)] p-[14px]">
                  <dt className="label mb-2">{k}</dt>
                  <dd className="text-[14px] font-medium leading-[1.3]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        <Section id="work" title="Work" index="02" note={`${projects.length} projects`}>
          <ProjectList projects={projects} />
        </Section>

        <Section id="contact" title="Contact" index="03">
          <p className="max-w-[640px] text-[17px] leading-[1.6] text-mute">
            The fastest way to reach me is{' '}
            <a href={links.email.href} className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
              {links.email.handle}
            </a>
            . I&apos;m also on{' '}
            <a href={links.github.href} target="_blank" rel="noreferrer" className="font-medium text-ink">GitHub</a> and{' '}
            <a href={links.linkedin.href} target="_blank" rel="noreferrer" className="font-medium text-ink">LinkedIn</a>.
          </p>
          <p className="mt-4 text-[13px] text-dim">Built with Next.js, deployed on Vercel, last updated {built}.</p>
        </Section>
      </main>
    </ActiveSectionProvider>
  )
}
