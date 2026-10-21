import { ArrowUpRight, MapPin } from 'lucide-react'

const markClasses = {
  forest: 'bg-forest text-lime',
  blue: 'bg-[#e0ebf8] text-[#315c92] dark:bg-[#243d57] dark:text-[#a9ceff]',
  amber: 'bg-[#f8e8d1] text-[#9b5d25] dark:bg-[#4a3523] dark:text-[#f5c78a]',
}

export default function ExperienceItem({ item }) {
  return (
    <article className="experience-item group grid gap-4 py-7 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-12">
      <div>
        <div className="flex items-start gap-3.5">
          <div className={`company-mark overflow-hidden ${markClasses[item.color] || markClasses.forest}`}>{item.logoUrl || item.logo ? <img src={item.logoUrl || item.logo} alt={`${item.company} logo`} className="h-full w-full object-contain bg-white p-1" /> : item.mark}</div>
          <div className="min-w-0 pt-0.5">
            <p className="text-[11px] font-bold uppercase tracking-[.12em] text-muted">{item.period}</p>
            <h3 className="mt-1 font-display text-lg font-extrabold leading-snug tracking-tight text-ink dark:text-white">{item.role}</h3>
            <p className="mt-1 text-sm font-semibold text-forest dark:text-lime">{item.company}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted"><MapPin size={13} /> {item.location}</p>
          </div>
        </div>
      </div>
      <div className="md:pl-2">
        <p className="text-sm leading-7 text-muted">{item.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {item.type.split(' · ').map((tag) => <span key={tag} className="tag-pill">{tag}</span>)}
        </div>
      </div>
    </article>
  )
}
