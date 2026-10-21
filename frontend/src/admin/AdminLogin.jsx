import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const destination = location.state?.from?.pathname || '/admin'
  if (status === 'authenticated') return <Navigate replace to={destination} />

  async function submit(event) {
    event.preventDefault()
    setBusy(true); setError('')
    try {
      await login(username, password)
      navigate(destination, { replace: true })
    } catch (err) { setError(err.message || 'Login gagal') }
    finally { setBusy(false) }
  }
  return <div className="flex min-h-screen items-center justify-center bg-[#f4f6f3] p-5">
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9">
      <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#234f40] text-white"><LockKeyhole size={23} /></div>
      <h1 className="font-display text-2xl font-extrabold text-slate-900">Admin login</h1>
      <p className="mt-2 text-sm text-slate-500">Masuk untuk mengubah konten portfolio.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <label className="block text-sm font-semibold text-slate-700">Username<input required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#234f40]" /></label>
        <label className="block text-sm font-semibold text-slate-700">Password<input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#234f40]" /></label>
        <button disabled={busy || status === 'checking'} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#234f40] py-3 font-bold text-white disabled:opacity-50" type="submit"><LogIn size={17} /> {busy ? 'Memeriksa…' : 'Sign in'}</button>
      </form>
      <a href="/" className="mt-5 block text-center text-sm font-medium text-slate-500 hover:text-[#234f40]">Kembali ke portfolio</a>
    </div>
  </div>
}
