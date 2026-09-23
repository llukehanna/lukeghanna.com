import { Rail, type RailNavItem } from '@/components/Rail'

const nav: RailNavItem[] = [
  { id: 'about', label: 'About', index: '01' },
  { id: 'work', label: 'Work', index: '02' },
  { id: 'contact', label: 'Contact', index: '03' },
]

export default function Home() {
  return (
    <>
      <Rail variant="home" nav={nav} />
      <main className="px-6 pb-20 pt-12 lg:pl-[400px] lg:pr-12">
        <section id="about" className="min-h-[60vh] scroll-mt-12">About</section>
        <section id="work" className="min-h-[100vh] scroll-mt-12">Work</section>
        <section id="contact" className="min-h-[60vh] scroll-mt-12">Contact</section>
      </main>
    </>
  )
}
