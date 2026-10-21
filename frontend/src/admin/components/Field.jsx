import { useRef, useState } from 'react'
import { ImagePlus, LoaderCircle, Trash2, UploadCloud } from 'lucide-react'
import { uploadImage, deleteUnusedImage } from '../../services/portfolioApi'

export function Field({ label, hint, children, className = '' }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}{hint && <span className="mt-1.5 block text-xs leading-5 text-slate-500">{hint}</span>}</label>
}

const controlClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#557b68] focus:ring-4 focus:ring-[#557b68]/10'
export function Input(props) { return <input {...props} className={`${controlClass} ${props.className || ''}`} /> }
export function Textarea(props) { return <textarea {...props} className={`${controlClass} min-h-[120px] resize-y leading-6 ${props.className || ''}`} /> }
export function Select(props) { return <select {...props} className={`${controlClass} ${props.className || ''}`} /> }
export function FormSection({ title, description, children, className = '' }) {
  return <section className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 ${className}`}><div className="mb-5 border-b border-slate-100 pb-4"><h2 className="font-display text-base font-extrabold text-slate-900">{title}</h2>{description && <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p>}</div>{children}</section>
}

export function PageHeading({ eyebrow, title, description, action }) {
  return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#557b68]">{eyebrow || 'Portfolio studio'}</p><h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}</div>{action}</div>
}

export function SaveButton({ children = 'Save changes', saving = false, type = 'submit', disabled = false }) {
  return <button type={type} disabled={disabled || saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#234f40] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#183c30] disabled:cursor-not-allowed disabled:opacity-55">{saving && <LoaderCircle size={16} className="animate-spin" />}{saving ? 'Saving…' : children}</button>
}

export function GhostButton({ children, ...props }) {
  return <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 ${props.className || ''}`}>{children}</button>
}

export function ImageField({ label, value, publicId, onChange, folder = 'portfolio', hint = 'JPG, PNG, or WebP. The file is uploaded through the configured API in FastAPI mode.' }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')

  async function handleFile(file) {
    if (!file) return
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Please choose a JPG, PNG, or WebP image.')
      return
    }
    setError(''); setBusy(true); setFileName(file.name)
    try {
      const previousId = publicId
      const asset = await uploadImage(file, folder)
      onChange(asset.url, asset.publicId)
      if (previousId && previousId !== asset.publicId) {
        // 409 is expected for an image still saved in MongoDB; the backend
        // will delete it after the parent record is successfully saved.
        deleteUnusedImage(previousId).catch((error) => { if (!error.message.includes('still used')) console.warn(error) })
      }
    }
    catch (err) { setError(err.message || 'The image could not be uploaded.') }
    finally { setBusy(false); if (inputRef.current) inputRef.current.value = '' }
  }

  return <div>
    <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
    <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 sm:flex-row sm:items-center">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-300">
        {value ? <img src={value} alt={`${label} preview`} className="h-full w-full object-cover" /> : <ImagePlus size={28} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-700">{fileName || (value ? 'Image selected' : 'No image selected')}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-50">{busy ? <LoaderCircle size={14} className="animate-spin" /> : <UploadCloud size={14} />}{busy ? 'Uploading…' : value ? 'Replace image' : 'Choose image'}</button>
          {value && <button type="button" onClick={() => { onChange('', ''); setFileName(''); if (publicId) deleteUnusedImage(publicId).catch((error) => { if (!error.message.includes('still used')) console.warn(error) }) }} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50"><Trash2 size={13} /> Remove</button>}
        </div>
        {error && <p role="alert" className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
      </div>
    </div>
  </div>
}

export function StringListEditor({ label, values = [], onChange, placeholder = 'Add an item', addLabel = 'Add item' }) {
  const updateAt = (index, value) => onChange(values.map((entry, i) => i === index ? value : entry))
  const removeAt = (index) => onChange(values.filter((_, i) => i !== index))
  return <div><div className="mb-2 flex items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-700">{label}</span><span className="text-xs text-slate-400">{values.length} item{values.length === 1 ? '' : 's'}</span></div><div className="space-y-2">{values.map((value, index) => <div key={`${label}-${index}`} className="flex gap-2"><Input value={value} onChange={(event) => updateAt(index, event.target.value)} placeholder={placeholder} /><button type="button" onClick={() => removeAt(index)} aria-label={`Remove item ${index + 1}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button></div>)}</div><button type="button" onClick={() => onChange([...values, ''])} className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold text-[#426b57] hover:bg-[#eef4ef]">+ {addLabel}</button></div>
}
