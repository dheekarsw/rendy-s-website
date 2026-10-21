import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ProjectDetails from './pages/ProjectDetails'
import { PortfolioProvider } from './context/PortfolioContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import ProfileEditor from './admin/ProfileEditor'
import { ExperienceEditor, ExperiencesManager } from './admin/ExperiencesManager'
import { ProjectEditor, ProjectsManager } from './admin/ProjectsManager'
import SocialsEditor from './admin/SocialsEditor'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    } else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function SiteLayout() {
  const [isDark, setIsDark] = useState(() => {
    try { return window.localStorage.getItem('portfolio-theme') === 'dark' } catch { return false }
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try { window.localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light') } catch { /* No storage. */ }
  }, [isDark])
  return <div className="min-h-screen bg-paper text-ink transition-colors duration-300 dark:bg-[#111714] dark:text-white">
    <ScrollManager />
    <Navbar isDark={isDark} onToggleTheme={() => setIsDark((current) => !current)} />
    <Outlet />
    <Footer />
  </div>
}

function RequireAdmin() {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'checking') return <div className="flex min-h-screen items-center justify-center text-slate-600">Verifying admin session…</div>
  if (status !== 'authenticated') return <Navigate to="/admin/login" state={{ from: location }} replace />
  return <Outlet />
}

export default function App() {
  return <BrowserRouter><AuthProvider><PortfolioProvider><Routes>
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route element={<RequireAdmin />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<ProfileEditor />} />
        <Route path="experiences" element={<ExperiencesManager />} />
        <Route path="experiences/new" element={<ExperienceEditor />} />
        <Route path="experiences/:itemId/edit" element={<ExperienceEditor />} />
        <Route path="projects" element={<ProjectsManager />} />
        <Route path="projects/new" element={<ProjectEditor />} />
        <Route path="projects/:slug/edit" element={<ProjectEditor />} />
        <Route path="socials" element={<SocialsEditor />} />
      </Route>
    </Route>
    <Route element={<SiteLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/projects/:slug" element={<ProjectDetails />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes></PortfolioProvider></AuthProvider></BrowserRouter>
}
