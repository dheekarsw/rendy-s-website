import { ArrowUp, ArrowUpRight, Github, Heart, Gamepad2, Linkedin, Globe2 } from 'lucide-react'
import { usePortfolio } from '../context/PortfolioContext'

export default function Footer() {
  const { profile, socials } = usePortfolio()
  const backToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="border-t border-stone-200/80 dark:border-white/10">
      <div className="page-shell py-9">
        <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
          <div>
            <a href="#top" onClick={backToTop} className="font-display text-lg font-extrabold tracking-tight text-ink dark:text-white">{profile.brand}<span className="text-forest dark:text-lime">.</span></a>
            <p className="mt-1.5 text-sm text-muted">Putting one's soul into every work.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {socials.filter((item) => item.enabled !== false && item.url).map((item) => {
              const Icon = item.id === 'github' ? Github : item.id === 'linkedin' ? Linkedin : item.id === 'itch' ? Gamepad2 : Globe2
              return <a key={item.id} className="social-link" href={item.url} target="_blank" rel="noreferrer" aria-label={item.label}><Icon size={17} /> <span>{item.label}</span></a>
            })}
            <button type="button" onClick={backToTop} className="back-to-top">Back to top <ArrowUp size={15} /></button>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-stone-200/80 pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <span>© {new Date().getFullYear()} {profile.name}. All rights reserved.</span>
          <span className="inline-flex items-center gap-1.5">Made with <Heart size={12} className="fill-current text-forest dark:text-lime" /> thanks to <a href="https://www.dheekarsw.com/" className="hover:text-forest dark:hover:text-lime transition">dheekarsw</a>.</span>
        </div>
      </div>
    </footer>
  )
}
