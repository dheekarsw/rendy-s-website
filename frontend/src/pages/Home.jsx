import { ArrowDown, ArrowRight, ArrowUpRight, Users, Cog, Gamepad2, MapPin, Sparkles, Database } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { usePortfolio } from '../context/PortfolioContext'
import SectionHeading from '../components/SectionHeading'
import ExperienceItem from '../components/ExperienceItem'
import ProjectCard from '../components/ProjectCard'
import { sortExperiencesByDate } from '../utils/experienceSort'

const focusAreas = [
  { icon: <Users size={17} />, label: 'Leadership & Teamwork' },
  { icon: <Database size={17} />, label: 'Data Analyst' },
  { icon: <Sparkles size={17} />, label: 'Learning by building' },
]

export default function Home() {
  const { profile, experiences, projects } = usePortfolio()
  const sortedExperiences = useMemo(() => sortExperiencesByDate(experiences), [experiences])
  return (
    <main>
      <section id="top" className="hero-section page-shell scroll-mt-20">
        <div className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.08fr_.92fr] lg:gap-16 lg:py-24">
          <div className="order-2 lg:order-1">
            {/* <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/70 px-3.5 py-2 text-xs font-semibold text-forest shadow-sm dark:border-lime/20 dark:bg-white/5 dark:text-lime">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
              Open to interesting opportunities
            </div> */}
            <p className="mb-3 text-sm font-semibold tracking-wide text-muted">{profile.location} <span className="mx-1.5 text-stone-300 dark:text-white/20"></span></p>
            <h1 className="max-w-2xl font-display text-[clamp(2.9rem,7vw,5.35rem)] font-extrabold leading-[1.02] tracking-tighter2 text-ink dark:text-white">
              {profile.greeting.replace(/\.$/, '')}<br />
              {/* <span className="relative inline-block text-forest dark:text-lime">I build<span className="absolute -bottom-1 left-0 h-[5px] w-full rounded-full bg-lime dark:bg-forest" /></span> digital experiences. */}
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">{profile.intro}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#projects" className="primary-button">Explore my work <ArrowRight size={16} /></a>
              <a href={`mailto:${profile.email}`} className="secondary-button">Get in touch <ArrowUpRight size={16} /></a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-5 gap-y-3 border-t border-stone-200/80 pt-6 dark:border-white/10">
              {focusAreas.map((item) => <span key={item.label} className="flex items-center gap-2 text-xs font-semibold text-muted"><span className="text-forest dark:text-lime">{item.icon}</span>{item.label}</span>)}
            </div>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-[440px] lg:order-2 lg:mx-0 lg:ml-auto">
            <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-lime/80 blur-2xl dark:bg-forest/50" />
            <div className="absolute -bottom-6 -left-6 h-36 w-36 rounded-full bg-[#d6e9e0] blur-3xl dark:bg-[#35594c]/50" />
            <div className="relative rounded-[30px] border border-white/80 bg-white/70 p-3 shadow-soft dark:border-white/10 dark:bg-white/5">
              <div className="relative overflow-hidden rounded-[22px] bg-[#e1ece5]">
                <img src={profile.photo} alt="Profile photo placeholder — replace with your own photo" className="aspect-[.92/1] w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#12251e]/80 via-[#12251e]/25 to-transparent p-6 pt-20 text-white">
                  <p className="font-display text-xl font-extrabold tracking-tight">{profile.name}</p>
                  <p className="mt-1 text-sm text-white/80">{profile.role}</p>
                </div>
              </div>
              <div className="absolute -left-7 top-[22%] hidden items-center gap-2 rounded-2xl border border-stone-100 bg-white px-3.5 py-3 shadow-soft sm:flex dark:border-white/10 dark:bg-[#1d2722]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e0eee5] text-forest dark:bg-forest dark:text-lime"><Cog size={18} /></span>
                <span><span className="block text-xs font-bold text-ink dark:text-white">Do better</span><span className="mt-0.5 block text-[10px] text-muted">Build · Learn · Improve</span></span>
              </div>
              <div className="absolute -bottom-4 right-5 flex items-center gap-2 rounded-2xl border border-stone-100 bg-white px-3.5 py-3 shadow-soft dark:border-white/10 dark:bg-[#1d2722]">
                <MapPin size={16} className="text-forest dark:text-lime" />
                <span className="text-xs font-bold text-ink dark:text-white">Based in Indonesia</span>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold text-muted lg:justify-end"><ArrowDown size={14} /> Scroll to discover</div>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200/80 bg-white/55 dark:border-white/10 dark:bg-white/[.025]">
        <div className="page-shell py-8 sm:py-10">
          <div className="grid gap-5 sm:grid-cols-3 sm:gap-8">
            <div className="flex items-start gap-3"><span className="stat-number">01</span><div><p className="text-sm font-bold text-ink dark:text-white">Think analytically</p><p className="mt-1 text-xs leading-5 text-muted">A mathematics background helps me break down complex problems.</p></div></div>
            <div className="flex items-start gap-3"><span className="stat-number">02</span><div><p className="text-sm font-bold text-ink dark:text-white">Build with purpose</p><p className="mt-1 text-xs leading-5 text-muted">I care about clear interfaces, thoughtful systems, and useful outcomes.</p></div></div>
            <div className="flex items-start gap-3"><span className="stat-number">03</span><div><p className="text-sm font-bold text-ink dark:text-white">Keep iterating</p><p className="mt-1 text-xs leading-5 text-muted">Testing, feedback, and small improvements are part of the process.</p></div></div>
          </div>
        </div>
      </section>

      <section className="page-shell section-space">
        <SectionHeading eyebrow="Where I've been" title="Experience" description="A few places where I have learned by collaborating, solving problems, and helping others grow." id="experience" />
        <div className="divide-y divide-stone-200/80 dark:divide-white/10">
          {sortedExperiences.map((item) => <ExperienceItem key={item.id ?? item._id} item={item} />)}
        </div>
      </section>

      <section className="section-space border-y border-stone-200/80 bg-[#f1f5f2]/75 dark:border-white/10 dark:bg-white/[.025]">
        <div className="page-shell">
          <SectionHeading eyebrow="Selected work" title="Projects that keep me curious." description="A mix of web experiences, computer vision experiments, and games. Each project taught me something new." id="projects" />
          <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 md:gap-y-14">
            {projects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}
          </div>
          <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-[24px] border border-stone-200/80 bg-white/70 p-6 sm:flex-row sm:items-center sm:p-8 dark:border-white/10 dark:bg-white/[.035]">
            <div><p className="font-display text-xl font-extrabold tracking-tight text-ink dark:text-white">Have a project in mind?</p><p className="mt-1.5 text-sm text-muted">I'm always happy to talk about good ideas and new challenges.</p></div>
            <a className="primary-button shrink-0" href={`mailto:${profile.email}`}>Let’s talk <ArrowUpRight size={16} /></a>
          </div>
        </div>
      </section>

      <section id="about" className="page-shell scroll-mt-28 py-16 sm:py-20">
        <div className="grid gap-8 rounded-[28px] bg-forest px-6 py-8 text-white sm:px-10 sm:py-10 md:grid-cols-[1fr_auto] md:items-center dark:bg-[#1b342b]">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-lime">{profile.aboutLabel || 'A little more about me'}</p><h2 className="mt-3 max-w-2xl font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{profile.aboutTitle || 'Curious by nature. A builder by practice.'}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">{profile.aboutText || ''}</p></div>
          <div className="flex flex-wrap gap-2 md:max-w-[250px] md:justify-end">{(profile.aboutTags || []).filter(Boolean).map((tag) => <span key={tag} className="rounded-full border border-white/15 px-3 py-2 text-xs text-white/80">{tag}</span>)}</div>
        </div>
      </section>
    </main>
  )
}
