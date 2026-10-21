import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowUpRight, BriefcaseBusiness, CircleUserRound, ExternalLink, FolderKanban, Gauge, Globe2, PanelLeft, ShieldCheck, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
import { API_MODE } from '../services/portfolioApi'
import { usePortfolio } from '../context/PortfolioContext'
import { useAuth } from '../context/AuthContext'

const navigation = [
  { to: '/admin', label: 'Overview', icon: Gauge, end: true },
  { to: '/admin/profile', label: 'Profile', icon: CircleUserRound },
  { to: '/admin/experiences', label: 'Experiences', icon: BriefcaseBusiness },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/socials', label: 'Social links', icon: Globe2 },
]

export default function AdminLayout() {
  const location = useLocation()
  const { loadError } = usePortfolio()
  const { user, logout } = useAuth()
  const [mobileNav, setMobileNav] = useState(false)
  const [cleanupWarning, setCleanupWarning] = useState(false)
  const [retrying, setRetrying] = useState(false)
  useEffect(() => {
    const handler = () => setCleanupWarning(true)
    window.addEventListener('portfolio-cleanup-warning', handler)
    return () => window.removeEventListener('portfolio-cleanup-warning', handler)
  }, [])
  async function retryCleanup() {
    setRetrying(true)
    try {
      const response = await apiRequest('/media/retry-deletions', { method: 'POST' })
      if (response.remaining === 0) setCleanupWarning(false)
      else window.alert(`${response.remaining} Cloudinary images still require cleanup. Check backend logs.`)
    } catch (err) { window.alert(err.message || 'Cleanup retry failed') }
    finally { setRetrying(false) }
  }
  const title = navigation.find((item) => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to))?.label || 'Editor'
  return <div className="min-h-screen bg-[#f4f6f3] text-slate-800">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] flex-col border-r border-slate-200/80 bg-white lg:flex">
      <div className="flex h-[78px] items-center gap-3 border-b border-slate-100 px-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#234f40] font-display text-lg font-extrabold text-[#d6ef9a]">r.</span><div><p className="font-display text-sm font-extrabold text-slate-900">Portfolio Studio</p><p className="mt-0.5 text-[10px] font-medium tracking-wide text-slate-400">RENDY / ADMIN</p></div></div>
      <div className="px-4 pt-7"><p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-400">Workspace</p><nav className="space-y-1">{navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${isActive ? 'bg-[#edf4ee] text-[#234f40]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}><Icon size={17} strokeWidth={1.9} />{label}</NavLink>)}</nav></div>
      <div className="mt-auto p-4"><div className="rounded-2xl bg-[#f4f7f3] p-4"><div className="flex items-center gap-2 text-[#426b57]"><ShieldCheck size={16} /><span className="text-xs font-extrabold">Admin protected</span></div><p className="mt-2 text-xs leading-5 text-slate-500">Write and upload endpoints require a valid JWT bearer token.</p></div><a href="/" target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-between rounded-xl px-3 py-3 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900">View live portfolio <ArrowUpRight size={14} /></a></div>
    </aside>

    <div className="lg:pl-[250px]">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"><div className="flex min-h-[78px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-9"><div className="flex items-center gap-3"><button type="button" onClick={() => setMobileNav((v) => !v)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 lg:hidden" aria-label="Toggle admin navigation"><PanelLeft size={18} /></button><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Website management</p><h2 className="mt-1 font-display text-base font-extrabold text-slate-900">{title}</h2></div></div><div className="flex items-center gap-2 sm:gap-3"><span className={`hidden items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-extrabold sm:inline-flex ${API_MODE === 'mock' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}><span className={`h-1.5 w-1.5 rounded-full ${API_MODE === 'mock' ? 'bg-amber-500' : 'bg-emerald-500'}`} /> {API_MODE === 'mock' ? 'DEMO MODE' : 'FASTAPI MODE'}</span><a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"><ExternalLink size={14} /> <span className="hidden sm:inline">Preview site</span></a><span className="hidden text-xs font-semibold text-slate-600 md:inline">{user}</span><button type="button" onClick={logout} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-600" aria-label="Log out"><LogOut size={16} /><span className="hidden sm:inline">Logout</span></button></div></div>
        {mobileNav && <div className="border-t border-slate-100 px-4 py-3 lg:hidden"><nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">{navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} onClick={() => setMobileNav(false)} to={to} end={end} className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-3 text-xs font-bold ${isActive ? 'bg-[#edf4ee] text-[#234f40]' : 'text-slate-500 hover:bg-slate-50'}`}><Icon size={15} />{label}</NavLink>)}</nav></div>}
      </header>
      {cleanupWarning && <div role="alert" className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 sm:mx-7 lg:mx-9"><span>Some replaced images could not be deleted from Cloudinary. The failures were queued for retry.</span><button type="button" disabled={retrying} onClick={retryCleanup} className="rounded-lg border border-amber-300 bg-white px-3 py-2 font-bold disabled:opacity-50">{retrying ? 'Retrying…' : 'Retry cleanup'}</button></div>}
      {loadError && <div role="alert" className="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-800 sm:mx-7 lg:mx-9"><strong>Content API could not be loaded:</strong> {loadError}. Verify the backend URL, endpoint paths, server availability, and CORS configuration.</div>}
      <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-7 lg:p-9"><Outlet /></main>
      {/* <footer className="px-4 pb-7 text-center text-[11px] text-slate-400 sm:px-7 lg:px-9">Portfolio Studio · Content management starter for React + FastAPI</footer> */}
    </div>
  </div>
}
