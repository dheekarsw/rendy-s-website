import { useEffect, useState } from 'react'
import { CheckCircle2, Save } from 'lucide-react'
import { usePortfolio } from '../context/PortfolioContext'
import { Field, FormSection, ImageField, Input, PageHeading, SaveButton, StringListEditor, Textarea } from './components/Field'

export default function ProfileEditor() {
  const { profile, updateProfile } = usePortfolio()
  const [form, setForm] = useState({ ...profile, aboutTags: [...(profile.aboutTags || [])] })
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  useEffect(() => setForm({ ...profile, aboutTags: [...(profile.aboutTags || [])] }), [profile])
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  async function submit(event) {
    event.preventDefault(); setSaving(true); setNotice(''); setError('')
    try { await updateProfile(form); setNotice('Profile updated successfully.'); }
    catch (err) { setError(err.message || 'Could not save profile changes.') }
    finally { setSaving(false) }
  }

  return <>
    <PageHeading eyebrow="Personal identity" title="Profile & introduction" description="Shape the first impression visitors get—from your portrait and hero copy to the story behind your work." />
    {notice && <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-semibold text-emerald-800"><CheckCircle2 size={17} />{notice}</div>}
    {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">{error}</div>}
    <form onSubmit={submit} className="space-y-5">
      <FormSection title="Identity & hero" description="These details appear in the navbar, hero section, and contact actions.">
        <div className="grid gap-5 md:grid-cols-2"><Field label="Display name"><Input required value={form.name || ''} onChange={(e) => set('name', e.target.value)} placeholder="Your full name" /></Field><Field label="Brand / navbar name"><Input required value={form.brand || ''} onChange={(e) => set('brand', e.target.value)} placeholder="Your portfolio brand" /></Field><Field label="Professional role"><Input value={form.role || ''} onChange={(e) => set('role', e.target.value)} placeholder="Software & Game Developer" /></Field><Field label="Location"><Input value={form.location || ''} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" /></Field><Field label="Hero greeting"><Input value={form.greeting || ''} onChange={(e) => set('greeting', e.target.value)} placeholder="Hello, I'm ..." /></Field><Field label="Public email"><Input type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} placeholder="hello@example.com" /></Field></div>
        <Field className="mt-5" label="Short introduction" hint="Displayed under your hero heading. Keep it clear and personal."><Textarea required rows={4} value={form.intro || ''} onChange={(e) => set('intro', e.target.value)} placeholder="A short introduction about what you build and enjoy." /></Field>
      </FormSection>
      <FormSection title="Profile photo" description="Upload a portrait. In FastAPI mode this field sends the image to your configured upload endpoint; Cloudinary credentials should remain on the server.">
        <ImageField label="Portrait image" value={form.photo || ''} publicId={form.photoPublicId || ''} onChange={(value, publicId) => { set('photo', value); if (publicId !== undefined) set('photoPublicId', publicId) }} folder="profiles" />
        <div className="mt-4"><Field label="Photo URL (optional)" hint="Useful when an image is already hosted on Cloudinary."><Input value={form.photo || ''} publicId={form.photoPublicId || ''} onChange={(e) => { set('photo', e.target.value); set('photoPublicId', '') }} placeholder="https://res.cloudinary.com/..." /></Field></div>
      </FormSection>
      <FormSection title="A little more about me" description="Controls the personal story section near the bottom of the homepage.">
        <div className="grid gap-5 md:grid-cols-2"><Field label="Small section label"><Input value={form.aboutLabel || ''} onChange={(e) => set('aboutLabel', e.target.value)} placeholder="A little more about me" /></Field><Field label="Section headline"><Input value={form.aboutTitle || ''} onChange={(e) => set('aboutTitle', e.target.value)} placeholder="Curious by nature. A builder by practice." /></Field></div>
        <Field className="mt-5" label="Personal story" hint="This can be longer than the hero introduction."><Textarea rows={5} value={form.aboutText || ''} onChange={(e) => set('aboutText', e.target.value)} placeholder="Share what you're curious about, what motivates you, or how you like to work." /></Field>
        <div className="mt-5"><StringListEditor label="Interest tags" values={form.aboutTags || []} onChange={(items) => set('aboutTags', items)} placeholder="e.g. Game development" addLabel="Add interest" /></div>
      </FormSection>
      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row"><button type="button" onClick={() => { setForm({ ...profile, aboutTags: [...(profile.aboutTags || [])] }); setNotice(''); setError('') }} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Discard changes</button><SaveButton saving={saving}><Save size={15} /> Save profile</SaveButton></div>
    </form>
  </>
}
