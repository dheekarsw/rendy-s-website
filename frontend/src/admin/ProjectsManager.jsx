import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, CheckCircle2, Eye, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePortfolio } from '../context/PortfolioContext'
import { deleteUnusedImage } from '../services/portfolioApi'
import { Field, FormSection, ImageField, Input, PageHeading, SaveButton, Select, StringListEditor, Textarea } from './components/Field'

const identify = (item) => String(item._id ?? item.id ?? item.slug ?? '')
const slugify = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const blankProject = { title: '', slug: '', category: '', year: new Date().getFullYear().toString(), shortDescription: '', summary: '', description: '', highlights: [''], stack: [''], coverImage: '', coverPublicId: '', projectUrl: '', repositoryUrl: '', visual: 'vision', accent: '#c7e8d7', previewLabel: 'Project preview', snapshots: [{ title: 'Overview', caption: '', image: '', imagePublicId: '' }] }

export function ProjectsManager() {
  const { projects, removeProject } = usePortfolio()
  async function remove(item) {
    if (!window.confirm(`Delete “${item.title}” and its project detail content? This cannot be undone.`)) return
    try { await removeProject(identify(item)) } catch (error) { window.alert(error.message || 'Could not delete project.') }
  }
  return <>
    <PageHeading eyebrow="Selected work" title="Projects" description="Manage the project cards on your homepage and every field on the full case-study page." action={<Link to="/admin/projects/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#234f40] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#183c30]"><Plus size={16} /> Add project</Link>} />
    <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"><span className="text-sm font-semibold text-slate-600">Project library</span><span className="rounded-full bg-[#edf4ee] px-2.5 py-1 text-xs font-extrabold text-[#426b57]">{projects.length} projects</span></div>
    {projects.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h3 className="font-display font-extrabold text-slate-800">No projects yet</h3><p className="mt-1 text-sm text-slate-500">Create a project to start your public portfolio showcase.</p></div> : <div className="grid gap-4 xl:grid-cols-2">{projects.map((item) => <article key={identify(item)} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"><div className="relative flex aspect-[2.2/1] items-center justify-center overflow-hidden bg-[#e6eee8]">{item.coverImage ? <img src={item.coverImage} alt={`${item.title} cover`} className="h-full w-full object-cover" /> : <div className="px-6 text-center"><span className="rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#426b57]">{item.category || 'Project'}</span><p className="mt-3 font-display text-2xl font-extrabold text-[#234f40]">{item.title || 'Untitled project'}</p><p className="mt-1 text-xs text-[#426b57]/70">Add a cover image to make this card yours</p></div>}<span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-600">{item.year}</span></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="font-display text-lg font-extrabold text-slate-900">{item.title}</h2><p className="mt-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#557b68]">{item.category}</p></div><span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">{item.snapshots?.length || 0} snapshots</span></div><p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{item.shortDescription || 'No short description yet.'}</p><div className="mt-4 flex flex-wrap gap-1.5">{(item.stack || []).slice(0, 4).map((tag) => <span key={tag} className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-500">{tag}</span>)}</div><div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4"><Link to={`/projects/${item.slug}`} target="_blank" className="inline-flex items-center gap-1.5 px-1 py-2 text-xs font-bold text-slate-500 transition hover:text-[#426b57]"><Eye size={14} /> Preview case study</Link><div className="flex gap-2"><Link to={`/admin/projects/${encodeURIComponent(item.slug)}/edit`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"><Pencil size={13} /> Edit</Link><button type="button" onClick={() => remove(item)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"><Trash2 size={13} /><span className="hidden sm:inline">Delete</span></button></div></div></div></article>)}</div>}
  </>
}

export function ProjectEditor() {
  const { slug: routeSlug } = useParams()
  const navigate = useNavigate()
  const { projects, saveProject } = usePortfolio()
  const existing = projects.find((item) => item.slug === routeSlug || identify(item) === routeSlug)
  const isEdit = Boolean(routeSlug)
  const [form, setForm] = useState(existing ? { ...blankProject, ...existing, highlights: [...(existing.highlights || [])], stack: [...(existing.stack || [])], snapshots: (existing.snapshots || []).map((snapshot) => ({ title: '', caption: '', image: '', imagePublicId: '', ...snapshot })) } : { ...blankProject, snapshots: [{ ...blankProject.snapshots[0] }] })
  const [saving, setSaving] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(existing?.slug))
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  useEffect(() => {
    if (existing) {
      setForm({ ...blankProject, ...existing, highlights: [...(existing.highlights || [])], stack: [...(existing.stack || [])], snapshots: (existing.snapshots || []).map((snapshot) => ({ title: '', caption: '', image: '', imagePublicId: '', ...snapshot })) })
      setSlugManuallyEdited(true)
    } else if (!routeSlug) {
      setForm({ ...blankProject, snapshots: [{ ...blankProject.snapshots[0] }] })
      setSlugManuallyEdited(false)
    }
  }, [existing, routeSlug])
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const updateSnapshot = (index, key, value) => setForm((current) => ({ ...current, snapshots: current.snapshots.map((snapshot, i) => i === index ? { ...snapshot, [key]: value } : snapshot) }))
  const moveSnapshot = (index, direction) => setForm((current) => { const snapshots = [...current.snapshots]; const target = index + direction; if (target < 0 || target >= snapshots.length) return current; [snapshots[index], snapshots[target]] = [snapshots[target], snapshots[index]]; return { ...current, snapshots } })
  const removeSnapshot = (index) => {
    const oldId = form.snapshots[index]?.imagePublicId
    setForm((current) => ({ ...current, snapshots: current.snapshots.filter((_, i) => i !== index) }))
    if (oldId) deleteUnusedImage(oldId).catch((error) => { if (!error.message.includes('still used')) console.warn(error) })
  }

  async function submit(event) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('')
    const payload = { ...form, slug: slugify(form.slug || form.title), id: isEdit ? identify(existing || { slug: routeSlug }) : slugify(form.slug || form.title) || `project-${Date.now()}`, highlights: form.highlights.map((item) => item.trim()).filter(Boolean), stack: form.stack.map((item) => item.trim()).filter(Boolean), snapshots: form.snapshots.filter((snapshot) => snapshot.title.trim() || snapshot.caption.trim() || snapshot.image).map((snapshot) => ({ ...snapshot, title: snapshot.title.trim() || 'Project snapshot' })) }
    if (!payload.slug) { setError('Please add a project title or slug.'); setSaving(false); return }
    try { await saveProject(payload, isEdit ? identify(existing || { slug: routeSlug }) : null); setNotice('Project saved.'); window.setTimeout(() => navigate('/admin/projects'), 500) }
    catch (err) { setError(err.message || 'Could not save this project.') }
    finally { setSaving(false) }
  }

  return <>
    <PageHeading eyebrow="Selected work" title={isEdit ? 'Edit project' : 'Create project'} description="Edit the project card and the complete case study. Your changes update the homepage and project detail page in demo mode." action={<Link to="/admin/projects" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</Link>} />
    {isEdit && !existing && <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Project not found. Check that the project slug or ID matches the loaded API content.</div>}
    {notice && <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800"><CheckCircle2 size={16} />{notice}</div>}
    {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">{error}</div>}
    <form onSubmit={submit} className="space-y-5">
      <FormSection title="Project card & hero" description="These fields are used in the homepage card and the top of the case study.">
        <div className="grid gap-5 md:grid-cols-2"><Field label="Project title"><Input required value={form.title || ''} onChange={(e) => { set('title', e.target.value); if (!isEdit && !slugManuallyEdited) set('slug', slugify(e.target.value)) }} placeholder="Project name" /></Field><Field label="URL slug" hint="Used in the public URL: /projects/your-slug"><Input required value={form.slug || ''} onChange={(e) => { setSlugManuallyEdited(true); set('slug', slugify(e.target.value)) }} placeholder="project-name" /></Field><Field label="Category"><Input required value={form.category || ''} onChange={(e) => set('category', e.target.value)} placeholder="Game Development · Unity 2D" /></Field><Field label="Year / status"><Input value={form.year || ''} onChange={(e) => set('year', e.target.value)} placeholder="2025 or Prototype" /></Field></div>
        <Field className="mt-5" label="Short description" hint="Keep it to one or two sentences for the project card."><Textarea required rows={3} value={form.shortDescription || ''} onChange={(e) => set('shortDescription', e.target.value)} placeholder="A short introduction shown on the homepage." /></Field>
        <Field className="mt-5" label="Hero summary" hint="A slightly fuller introduction at the top of the detail page."><Textarea rows={3} value={form.summary || ''} onChange={(e) => set('summary', e.target.value)} placeholder="What is this project about?" /></Field>
        <div className="mt-5"><ImageField label="Project cover / hero image" value={form.coverImage || ''} publicId={form.coverPublicId || ''} onChange={(value, publicId) => { set('coverImage', value); if (publicId !== undefined) set('coverPublicId', publicId) }} folder="projects" /></div>
      </FormSection>
      <FormSection title="Full project story" description="This information fills the About the project section on its own detail page.">
        <Field label="Detailed description"><Textarea required rows={7} value={form.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Explain the problem, your approach, implementation, and what you learned." /></Field>
        <div className="mt-5"><StringListEditor label="Key highlights" values={form.highlights || []} onChange={(items) => set('highlights', items)} placeholder="What did you build or achieve?" addLabel="Add highlight" /></div>
        <div className="mt-5"><StringListEditor label="Tools & technologies" values={form.stack || []} onChange={(items) => set('stack', items)} placeholder="e.g. React" addLabel="Add technology" /></div>
        <div className="mt-5 grid gap-5 md:grid-cols-2"><Field label="Live project URL (optional)"><Input type="url" value={form.projectUrl || ''} onChange={(e) => set('projectUrl', e.target.value)} placeholder="https://..." /></Field><Field label="Repository URL (optional)"><Input type="url" value={form.repositoryUrl || ''} onChange={(e) => set('repositoryUrl', e.target.value)} placeholder="https://github.com/..." /></Field></div>
      </FormSection>
      <FormSection title="Project snapshots" description="Upload screenshots or visuals for the carousel. Drag ordering can be changed with the up/down controls.">
        <div className="space-y-4">{(form.snapshots || []).map((snapshot, index) => <div key={`snapshot-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#557b68]">Snapshot {String(index + 1).padStart(2, '0')}</p><p className="mt-1 text-xs text-slate-400">The order here becomes the public carousel order.</p></div><div className="flex gap-1"><button type="button" onClick={() => moveSnapshot(index, -1)} disabled={index === 0} aria-label="Move snapshot up" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={14} /></button><button type="button" onClick={() => moveSnapshot(index, 1)} disabled={index === form.snapshots.length - 1} aria-label="Move snapshot down" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={14} /></button><button type="button" onClick={() => removeSnapshot(index)} aria-label="Remove snapshot" className="rounded-lg border border-slate-200 bg-white p-2 text-rose-500 hover:bg-rose-50"><Trash2 size={14} /></button></div></div><div className="grid gap-4 md:grid-cols-2"><Field label="Snapshot title"><Input value={snapshot.title || ''} onChange={(e) => updateSnapshot(index, 'title', e.target.value)} placeholder="Gameplay screen" /></Field><Field label="Caption"><Input value={snapshot.caption || ''} onChange={(e) => updateSnapshot(index, 'caption', e.target.value)} placeholder="What does this screenshot show?" /></Field></div><div className="mt-4"><ImageField label="Snapshot image" value={snapshot.image || ''} publicId={snapshot.imagePublicId || ''} onChange={(value, publicId) => { updateSnapshot(index, 'image', value); if (publicId !== undefined) updateSnapshot(index, 'imagePublicId', publicId) }} folder="projects/snapshots" hint="Use a readable screenshot. Wide images work best in the carousel." /></div></div>)}</div>
        <button type="button" onClick={() => set('snapshots', [...(form.snapshots || []), { title: '', caption: '', image: '', imagePublicId: '' }])} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-[#426b57] transition hover:border-[#9fb9a5] hover:bg-[#f5f8f5]"><Plus size={15} /> Add snapshot</button>
      </FormSection>
      <FormSection title="Visual settings" description="Used by the illustrated fallback when no cover or snapshot image has been uploaded.">
        <div className="grid gap-5 md:grid-cols-3"><Field label="Fallback artwork"><Select value={form.visual || 'vision'} onChange={(e) => set('visual', e.target.value)}><option value="vision">Computer vision</option><option value="commerce">Product / website</option><option value="game">Game / prototype</option></Select></Field><Field label="Accent color"><Input type="color" value={form.accent || '#c7e8d7'} onChange={(e) => set('accent', e.target.value)} className="h-11 cursor-pointer p-1.5" /></Field><Field label="Preview label"><Input value={form.previewLabel || ''} onChange={(e) => set('previewLabel', e.target.value)} placeholder="Game development" /></Field></div>
      </FormSection>
      <div className="flex justify-end"><SaveButton saving={saving}><Save size={15} /> {isEdit ? 'Save project' : 'Create project'}</SaveButton></div>
    </form>
  </>
}
