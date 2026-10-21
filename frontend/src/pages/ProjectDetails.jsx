import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { usePortfolio } from '../context/PortfolioContext'
import ProjectArtwork from '../components/ProjectArtwork'
import SectionHeading from '../components/SectionHeading'

export default function ProjectDetails() {
  const { slug } = useParams()
  const { projects, profile } = usePortfolio()
  const project = projects.find((item) => item.slug === slug)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    setActiveSlide(0)
    window.scrollTo(0, 0)
  }, [slug])

  if (!project) {
    return (
      <main className="page-shell flex min-h-[65vh] flex-col items-start justify-center py-20">
        <p className="eyebrow">404 · Project not found</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink dark:text-white">That project isn't here.</h1>
        <p className="mt-4 text-sm text-muted">The link may be incorrect, or the project may have moved.</p>
        <Link to="/#projects" className="primary-button mt-7"><ArrowLeft size={16} /> Back to projects</Link>
      </main>
    )
  }

  const projectIndex = projects.findIndex((item) => item.slug === project.slug)
  const nextProject = projects[(projectIndex + 1) % projects.length] || project
  const previousProject = projects[(projectIndex - 1 + projects.length) % projects.length] || project
  // Only usable images participate in the carousel. Keep the original index
  // so ProjectArtwork selects the correct entry from project.snapshots.
  const snapshots = (Array.isArray(project.snapshots) ? project.snapshots : [])
    .map((snapshot, index) => ({ ...snapshot, sourceIndex: index }))
    .filter((snapshot) => typeof snapshot.image === 'string' && snapshot.image.trim())
  const hasSnapshots = snapshots.length > 0
  const canNavigateSnapshots = snapshots.length > 1
  const safeActiveSlide = hasSnapshots ? activeSlide % snapshots.length : 0
  const slide = hasSnapshots ? snapshots[safeActiveSlide] : null
  const goToSlide = (direction) => {
    if (!canNavigateSnapshots) return
    setActiveSlide((current) => (current + direction + snapshots.length) % snapshots.length)
  }

  return (
    <main>
      <section className="page-shell pb-12 pt-8 sm:pb-16 sm:pt-12">
        <Link to="/#projects" className="back-link"><ArrowLeft size={15} /> All projects</Link>
        <div className="grid items-center gap-10 py-9 lg:grid-cols-[.88fr_1.12fr] lg:gap-14 lg:py-14">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2"><span className="tag-pill">{project.category}</span><span className="tag-pill">{project.year}</span></div>
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.8rem)] font-extrabold leading-[1.04] tracking-tighter2 text-ink dark:text-white">{project.title}<span className="text-forest dark:text-lime">.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">{project.summary}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={`mailto:${profile.email}?subject=${encodeURIComponent(`Let's talk about ${project.title}`)}`} className="primary-button">Discuss a similar project <ArrowUpRight size={16} /></a>
              <a href="#snapshots" className="secondary-button">Explore snapshots <ArrowRight size={16} /></a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">{(project.stack || []).map((tech) => <span key={tech} className="tag-pill">{tech}</span>)}</div>
            {(project.projectUrl || project.repositoryUrl) && <div className="mt-5 flex flex-wrap gap-2">{project.projectUrl && <a href={project.projectUrl} target="_blank" rel="noreferrer" className="secondary-button">Live project <ExternalLink size={14} /></a>}{project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noreferrer" className="secondary-button">Source code <ExternalLink size={14} /></a>}</div>}
          </div>
          <div className="min-w-0"><ProjectArtwork project={project} variant="cover" /></div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/80 pt-5 dark:border-white/10">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted"><span><strong className="font-bold text-ink dark:text-white">Focus</strong> &nbsp; {project.category}</span><span><strong className="font-bold text-ink dark:text-white">Stack</strong> &nbsp; {(project.stack || []).slice(0, 3).join(' · ')}</span></div>
          <a href="#overview" className="inline-flex items-center gap-2 text-xs font-bold text-forest hover:gap-3 dark:text-lime">Read the story <ArrowRight size={14} /></a>
        </div>
      </section>

      <section id="snapshots" className="scroll-mt-24 border-y border-stone-200/80 bg-white/60 py-14 sm:py-20 dark:border-white/10 dark:bg-white/[.025]">
        <div className="page-shell">
          <SectionHeading eyebrow="Inside the project" title="Project snapshots" description="A closer look at the concept, the workflow, and the details behind the build." />
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(250px,.55fr)] lg:gap-12">
            <div className="min-w-0">
              <div className="relative">
                <ProjectArtwork project={project} variant="snapshot" slide={slide?.sourceIndex ?? 0} />
                {canNavigateSnapshots && (
                  <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between sm:inset-x-5">
                    <button type="button" onClick={() => goToSlide(-1)} aria-label="Previous project snapshot" className="carousel-arrow"><ChevronLeft size={21} /></button>
                    <button type="button" onClick={() => goToSlide(1)} aria-label="Next project snapshot" className="carousel-arrow"><ChevronRight size={21} /></button>
                  </div>
                )}
              </div>
              {hasSnapshots && (
                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="text-xs text-muted">Snapshot {safeActiveSlide + 1} of {snapshots.length}</p>
                  {canNavigateSnapshots && (
                    <div className="flex items-center gap-2" aria-label="Choose snapshot">
                      {snapshots.map((item, index) => (
                        <button key={item.imagePublicId || item.image || index} type="button" onClick={() => setActiveSlide(index)} className={`h-2 rounded-full transition-all ${safeActiveSlide === index ? 'w-8 bg-forest dark:bg-lime' : 'w-2 bg-stone-300 hover:bg-stone-400 dark:bg-white/20 dark:hover:bg-white/40'}`} aria-label={`Show snapshot ${index + 1}`} aria-pressed={safeActiveSlide === index} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="lg:pl-1">
              {hasSnapshots ? (
                <>
                  <p className="eyebrow">{String(safeActiveSlide + 1).padStart(2, '0')} / {String(snapshots.length).padStart(2, '0')}</p>
                  <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink dark:text-white">{slide.title || `Snapshot ${safeActiveSlide + 1}`}</h3>
                  {slide.caption && <p className="mt-4 text-sm leading-7 text-muted">{slide.caption}</p>}
                  {canNavigateSnapshots && (
                    <div className="mt-7 flex gap-2">
                      <button type="button" className="secondary-button !px-3" onClick={() => goToSlide(-1)}><ChevronLeft size={16} /> Previous</button>
                      <button type="button" className="secondary-button !px-3" onClick={() => goToSlide(1)}>Next <ChevronRight size={16} /></button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="eyebrow">Gallery</p>
                  <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink dark:text-white">No snapshots yet</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">Screenshots for this project will appear here once they're added.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="overview" className="page-shell section-space scroll-mt-24">
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
          <div><p className="eyebrow">The story</p><h2 className="section-title mt-2">About the project</h2><p className="mt-4 text-sm leading-7 text-muted">A little context on the thinking, the implementation, and what I took away from the process.</p></div>
          <div>
            <p className="text-base leading-8 text-muted">{project.description}</p>
            <h3 className="mt-9 font-display text-xl font-extrabold tracking-tight text-ink dark:text-white">What I focused on</h3>
            <div className="mt-4 space-y-3">
              {(project.highlights || []).map((item) => <div key={item} className="flex gap-3 text-sm leading-6 text-muted"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e3f0e7] text-forest dark:bg-forest dark:text-lime"><Check size={12} strokeWidth={3} /></span>{item}</div>)}
            </div>
            <h3 className="mt-9 font-display text-xl font-extrabold tracking-tight text-ink dark:text-white">Tools & technologies</h3>
            <div className="mt-4 flex flex-wrap gap-2">{(project.stack || []).map((tech) => <span key={tech} className="tag-pill">{tech}</span>)}</div>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200/80 bg-[#f1f5f2]/75 py-10 dark:border-white/10 dark:bg-white/[.025] sm:py-12">
        <div className="page-shell">
          <div className="mb-5 flex items-center justify-between gap-4"><p className="eyebrow !mb-0">Keep exploring</p><Link to="/#projects" className="back-link">All projects <ArrowUpRight size={14} /></Link></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to={`/projects/${previousProject.slug}`} className="next-project-card"><ArrowDownLeft size={16} className="text-muted" /><div className="mt-4 text-[11px] font-bold uppercase tracking-[.12em] text-muted">Previous project</div><div className="mt-1 font-display text-lg font-extrabold tracking-tight text-ink dark:text-white">{previousProject.title}</div></Link>
            <Link to={`/projects/${nextProject.slug}`} className="next-project-card text-right"><ArrowUpRight size={16} className="ml-auto text-muted" /><div className="mt-4 text-[11px] font-bold uppercase tracking-[.12em] text-muted">Next project</div><div className="mt-1 font-display text-lg font-extrabold tracking-tight text-ink dark:text-white">{nextProject.title}</div></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
