import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react'
import { usePortfolio } from '../context/PortfolioContext'

const navItems = [
  { label: 'About', id: 'about' },
  { label: 'Experience', id: 'experience' },
  { label: 'Projects', id: 'projects' },
]

export default function Navbar({ isDark, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { profile, socials } = usePortfolio()
  const linkedinLink = socials.length ? socials.find((item) => item.id === 'linkedin' && item.enabled !== false) : null
  const linkedinUrl = socials.length ? (linkedinLink?.url || '') : (profile.linkedin || '')
  const location = useLocation()
  const atHome = location.pathname === '/'

  const sectionHref = (id) => (atHome ? `#${id}` : `/#${id}`)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#f8faf9]/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#111714]/90">
      <div className="page-shell flex h-[76px] items-center justify-between gap-5">
        <Link to="/" onClick={closeMenu} className="group flex shrink-0 items-center gap-2.5" aria-label="Go to homepage">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-sm font-extrabold tracking-tight text-lime transition-transform group-hover:-rotate-6">r.</span>
          <span className="font-display text-[17px] font-extrabold tracking-tight text-ink dark:text-white">{profile.brand}<span className="text-forest dark:text-lime">.</span></span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <a key={item.id} href={sectionHref(item.id)} className="nav-link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-forest hover:text-forest sm:inline-flex dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-lime dark:hover:text-lime">
            LinkedIn <ArrowUpRight size={15} />
          </a>}
          <button type="button" onClick={onToggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} className="icon-button">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="icon-button md:hidden" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen}>
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-stone-200 bg-[#f8faf9] px-6 py-4 md:hidden dark:border-white/10 dark:bg-[#111714]">
          <nav className="page-shell flex flex-col gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <a key={item.id} href={sectionHref(item.id)} onClick={closeMenu} className="rounded-xl px-3 py-3 text-sm font-semibold text-ink hover:bg-stone-100 dark:text-white dark:hover:bg-white/5">
                {item.label}
              </a>
            ))}
            {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" onClick={closeMenu} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-forest px-3 py-3 text-sm font-semibold text-white">
              Find me on LinkedIn <ArrowUpRight size={15} />
            </a>}
          </nav>
        </div>
      )}
    </header>
  )
}
