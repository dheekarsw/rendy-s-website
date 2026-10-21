import { ArrowUpRight, MoveUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProjectArtwork from './ProjectArtwork'

export default function ProjectCard({ project, index = 0 }) {
  return (
    <article className="project-card group">
      <Link to={`/projects/${project.slug}`} className="block overflow-hidden rounded-[22px]" aria-label={`View ${project.title} details`}>
        <ProjectArtwork project={project} variant="cover" slide={index % 3} className="transition-transform duration-500 group-hover:scale-[1.015]" />
      </Link>
      <div className="flex flex-col gap-4 px-1 pt-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[.12em] text-muted">
            <span>{project.category}</span><span className="text-stone-300 dark:text-white/20">/</span><span>{project.year}</span>
          </div>
          <h3 className="font-display text-xl font-extrabold tracking-tight text-ink transition-colors group-hover:text-forest dark:text-white dark:group-hover:text-lime">{project.title}</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{project.shortDescription}</p>
        </div>
        <Link to={`/projects/${project.slug}`} className="details-link shrink-0">
          Details <MoveUpRight size={15} />
        </Link>
      </div>
    </article>
  )
}
