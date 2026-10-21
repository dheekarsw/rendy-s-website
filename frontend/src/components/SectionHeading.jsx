export default function SectionHeading({ eyebrow, title, description, id }) {
  return (
    <div id={id} className="mb-9 scroll-mt-28">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <h2 className="section-title">{title}</h2>
        {description && <p className="max-w-md text-sm leading-6 text-muted md:text-right">{description}</p>}
      </div>
    </div>
  )
}
