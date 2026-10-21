import { useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, CheckCircle2, MapPin, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePortfolio } from '../context/PortfolioContext'
import { Field, FormSection, ImageField, Input, PageHeading, SaveButton, Select, Textarea } from './components/Field'
import { sortExperiencesByDate } from '../utils/experienceSort'

const identify = (item) => String(item._id ?? item.id ?? item.slug ?? '')

export function ExperiencesManager() {
  const { experiences, removeExperience } = usePortfolio()
  const sortedExperiences = useMemo(() => sortExperiencesByDate(experiences), [experiences])
  async function remove(item) {
    if (!window.confirm(`Delete “${item.role || item.company}”? This cannot be undone.`)) return
    try { await removeExperience(identify(item)) } catch (error) { window.alert(error.message || 'Could not delete experience.') }
  }
  return <>
    <PageHeading eyebrow="Career history" title="Experiences" description="Manage the roles, collaborations, and organizations that shaped your skills." action={<Link to="/admin/experiences/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#234f40] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#183c30]"><Plus size={16} /> Add experience</Link>} />
    <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"><span className="text-sm font-semibold text-slate-600">All experience entries</span><span className="rounded-full bg-[#edf4ee] px-2.5 py-1 text-xs font-extrabold text-[#426b57]">{experiences.length} entries</span></div>
    {experiences.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><BriefcaseBusiness size={28} className="mx-auto text-slate-300" /><h3 className="mt-3 font-display font-extrabold text-slate-800">No experiences yet</h3><p className="mt-1 text-sm text-slate-500">Add a role or collaboration to start building your timeline.</p></div> : <div className="space-y-3">{sortedExperiences.map((item) => <article key={identify(item)} className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:p-5"><div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-[#edf4ee] text-sm font-extrabold text-[#426b57]">{item.logoUrl || item.logo ? <img src={item.logoUrl || item.logo} alt={`${item.company} logo`} className="h-full w-full object-contain p-1" /> : (item.mark || item.shortCompany || item.company || 'EX').slice(0, 4)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-base font-extrabold text-slate-900">{item.role || 'Untitled role'}</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{item.period || 'Period not set'}</span></div><p className="mt-1 text-sm font-semibold text-[#426b57]">{item.company || 'Company not set'}</p><p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={13} />{item.location || 'Location not set'}</p><p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{item.description || 'No description yet.'}</p><div className="mt-3 flex flex-wrap gap-1.5">{(item.type || '').split(' · ').filter(Boolean).map((tag) => <span key={tag} className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-500">{tag}</span>)}</div></div><div className="flex shrink-0 gap-2"><Link to={`/admin/experiences/${encodeURIComponent(identify(item))}/edit`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"><Pencil size={13} /> Edit</Link><button type="button" onClick={() => remove(item)} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50" aria-label={`Delete ${item.company}`}><Trash2 size={14} /></button></div></article>)}</div>}
  </>
}


const blankExperience = { company: '', shortCompany: '', role: '', location: '', period: '', type: '', description: '', mark: '', color: 'forest', logoUrl: '', logoPublicId: '' }
const slugify = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function ExperienceEditor() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { experiences, saveExperience } = usePortfolio()
  const existing = experiences.find((item) => identify(item) === itemId)
  const isEdit = Boolean(itemId)
  const [form, setForm] = useState(existing ? { ...blankExperience, ...existing, logoUrl: existing.logoUrl || existing.logo || '', logoPublicId: existing.logoPublicId || existing.logo_public_id || '' } : { ...blankExperience })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  useEffect(() => {
    if (existing) setForm({ ...blankExperience, ...existing, logoUrl: existing.logoUrl || existing.logo || '', logoPublicId: existing.logoPublicId || existing.logo_public_id || '' })
    else if (!itemId) setForm({ ...blankExperience })
  }, [existing, itemId])
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  async function submit(event) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('')
    const payload = { ...form, id: isEdit ? identify(existing || { id: itemId }) : slugify(`${form.company}-${form.role}`) || `experience-${Date.now()}`, mark: form.mark || (form.shortCompany || form.company).slice(0, 4).toUpperCase() }
    try { await saveExperience(payload, isEdit ? identify(existing || { id: itemId }) : null); setNotice('Experience saved.'); window.setTimeout(() => navigate('/admin/experiences'), 500) }
    catch (err) { setError(err.message || 'Could not save this experience.') }
    finally { setSaving(false) }
  }

  return <>
    <PageHeading eyebrow="Career history" title={isEdit ? 'Edit experience' : 'Add experience'} description="Use concise, outcome-focused details. The logo and company information appear in your public experience timeline." action={<Link to="/admin/experiences" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</Link>} />
    {isEdit && !existing && <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">This experience could not be found in the loaded content. Check that the backend returns the selected record ID.</div>}
    {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">{error}</div>}
    {notice && <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800"><CheckCircle2 size={16} />{notice}</div>}
    <form onSubmit={submit} className="space-y-5">
      <FormSection title="Role & organization" description="The key information visitors scan first.">
        <div className="grid gap-5 md:grid-cols-2"><Field label="Role / position"><Input required value={form.role || ''} onChange={(e) => set('role', e.target.value)} placeholder="Programming Laboratory Assistant" /></Field><Field label="Company / organization"><Input required value={form.company || ''} onChange={(e) => set('company', e.target.value)} placeholder="Organization name" /></Field><Field label="Short company name"><Input value={form.shortCompany || ''} onChange={(e) => set('shortCompany', e.target.value)} placeholder="ITS" /></Field><Field label="Location"><Input value={form.location || ''} onChange={(e) => set('location', e.target.value)} placeholder="Surabaya, Indonesia" /></Field><Field label="Date range shown on website" hint="Example: Feb 2022 – Feb 2025. For an ongoing role, use Present or Sekarang as the end date."><Input required value={form.period || ''} onChange={(e) => set('period', e.target.value)} placeholder="Jan 2024 – Dec 2024" /></Field><Field label="Skills / category tags" hint="Separate tags with a middle dot: ·"><Input value={form.type || ''} onChange={(e) => set('type', e.target.value)} placeholder="Teaching · Java · OOP" /></Field></div>
        <Field className="mt-5" label="Role description"><Textarea required rows={5} value={form.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Describe your responsibilities, contribution, and outcome." /></Field>
      </FormSection>
      <FormSection title="Company branding" description="Upload a company logo or use a short text mark as a fallback.">
        <ImageField label="Company logo" value={form.logoUrl || ''} publicId={form.logoPublicId || ''} onChange={(value, publicId) => { set('logoUrl', value); if (publicId !== undefined) set('logoPublicId', publicId) }} folder="experiences" hint="Prefer a square PNG or WebP with a transparent background." />
        <div className="mt-5 grid gap-5 md:grid-cols-2"><Field label="Logo fallback text"><Input maxLength={8} value={form.mark || ''} onChange={(e) => set('mark', e.target.value)} placeholder="ITS" /></Field><Field label="Fallback color"><Select value={form.color || 'forest'} onChange={(e) => set('color', e.target.value)}><option value="forest">Forest green</option><option value="blue">Blue</option><option value="amber">Amber</option></Select></Field></div>
      </FormSection>
      <div className="flex justify-end"><SaveButton saving={saving}><Save size={15} /> {isEdit ? 'Save experience' : 'Create experience'}</SaveButton></div>
    </form>
  </>
}
