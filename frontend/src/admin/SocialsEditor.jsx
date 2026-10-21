import { useEffect, useState } from 'react'
import { CheckCircle2, ExternalLink, Globe2, Plus, Save, Trash2 } from 'lucide-react'
import { usePortfolio } from '../context/PortfolioContext'
import { Field, FormSection, Input, PageHeading, SaveButton } from './components/Field'

const cleanId = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function SocialsEditor() {
  const { socials, updateSocials } = usePortfolio()
  const [form, setForm] = useState(socials.map((item) => ({ enabled: true, handle: '', ...item })))
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  useEffect(() => setForm(socials.map((item) => ({ enabled: true, handle: '', ...item }))), [socials])

  const update = (index, key, value) => setForm((current) => current.map((item, i) => i === index ? { ...item, [key]: value, ...(key === 'label' && !item.customId ? {} : {}) } : item))
  const remove = (index) => setForm((current) => current.filter((_, i) => i !== index))
  const add = () => setForm((current) => [...current, { id: `social-${Date.now()}`, label: '', url: '', handle: '', enabled: true, customId: true }])

  async function submit(event) {
    event.preventDefault(); setSaving(true); setNotice(''); setError('')
    const normalized = form.map((item) => ({ ...item, label: item.label.trim(), id: item.customId ? (cleanId(item.label) || item.id) : item.id, url: item.url.trim(), handle: item.handle.trim() })).filter((item) => item.label)
    const duplicate = normalized.some((item, index) => normalized.findIndex((other) => other.id === item.id) !== index)
    if (duplicate) { setError('Each social profile must have a unique platform ID. Remove duplicates or use different platform names.'); setSaving(false); return }
    try { await updateSocials(normalized); setNotice('Social links updated successfully.') }
    catch (err) { setError(err.message || 'Could not save social links.') }
    finally { setSaving(false) }
  }

  return <>
    <PageHeading eyebrow="Stay connected" title="Social links" description="Control the links used by the LinkedIn button, footer, and other contact points on your public portfolio." />
    {notice && <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-semibold text-emerald-800"><CheckCircle2 size={16} />{notice}</div>}
    {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">{error}</div>}
    <form onSubmit={submit} className="space-y-5">
      <FormSection title="Contact & social profiles" description="Disabled links are kept in the admin editor but hidden from the public site. Use full https:// URLs for external profiles.">
        <div className="space-y-3">{form.map((item, index) => <div key={item.id} className={`rounded-2xl border p-4 sm:p-5 ${item.enabled ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-75'}`}><div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4ee] text-[#426b57]"><Globe2 size={16} /></span><div><p className="text-sm font-extrabold text-slate-800">{item.label || 'New platform'}</p><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">{item.id}</p></div></div><div className="flex items-center gap-3"><label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-500"><input type="checkbox" checked={Boolean(item.enabled)} onChange={(e) => update(index, 'enabled', e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-[#426b57]" /> Show publicly</label><button type="button" onClick={() => remove(index)} aria-label={`Remove ${item.label}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button></div></div><div className="grid gap-4 md:grid-cols-2"><Field label="Platform name"><Input required value={item.label || ''} onChange={(e) => update(index, 'label', e.target.value)} placeholder="LinkedIn" /></Field><Field label="Profile URL"><Input type="url" value={item.url || ''} onChange={(e) => update(index, 'url', e.target.value)} placeholder="https://..." /></Field><Field label="Short descriptor / handle"><Input value={item.handle || ''} onChange={(e) => update(index, 'handle', e.target.value)} placeholder="Professional network" /></Field><Field label="Platform ID" hint="Used for built-in icons and compatibility. Custom IDs are generated from platform name."><Input disabled={!item.customId} value={item.id || ''} onChange={(e) => update(index, 'id', cleanId(e.target.value))} placeholder="linkedin" /></Field></div>{item.url && <a href={item.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#426b57] hover:underline">Open link to verify <ExternalLink size={13} /></a>}</div>)}</div>
        <button type="button" onClick={add} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-[#426b57] transition hover:border-[#9fb9a5] hover:bg-[#f5f8f5]"><Plus size={15} /> Add social link</button>
      </FormSection>
      <div className="flex justify-end"><SaveButton saving={saving}><Save size={15} /> Save social links</SaveButton></div>
    </form>
  </>
}
