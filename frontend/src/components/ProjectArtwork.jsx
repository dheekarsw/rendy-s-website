import { BarChart3, CheckCircle2, CirclePlay, Code2, Cpu, Gauge, ImageOff, Layers3, ShoppingBag, Sparkles } from 'lucide-react'

const themes = {
  vision: { bg: '#e5efe8', ink: '#183d35', accent: '#c8ef70', secondary: '#668a7b' },
  commerce: { bg: '#f4e9dc', ink: '#443329', accent: '#e3a66c', secondary: '#b17b54' },
  game: { bg: '#e9e6fa', ink: '#28264a', accent: '#a59cf1', secondary: '#736ac7' },
}

function ParkingIllustration({ slide, theme }) {
  const spaces = Array.from({ length: 12 }, (_, i) => ({ x: 70 + (i % 6) * 77, y: 151 + Math.floor(i / 6) * 72, i }))
  return (
    <>
      <rect x="46" y="92" width="462" height="256" rx="15" fill="#f7f9f6" />
      <rect x="60" y="107" width="434" height="225" rx="11" fill="#dfe6df" />
      <path d="M70 178H483M70 260H483" stroke="#fff" strokeWidth="4" strokeDasharray="12 9" />
      {spaces.map(({ x, y, i }) => {
        const occupied = (i * 7 + slide * 3) % 5 !== 0
        return <g key={i}>
          <rect x={x} y={y} width="58" height="52" rx="5" fill={occupied ? '#a8bdb3' : '#d7edb0'} />
          {occupied && <g transform={`translate(${x + 12} ${y + 9})`}><rect width="34" height="31" rx="8" fill={i % 2 ? '#476f61' : '#627f9a'} /><rect x="4" y="4" width="26" height="12" rx="4" fill="#c6d5d0" /></g>}
          {slide > 0 && <rect x={x - 3} y={y - 3} width="64" height="58" rx="7" fill="none" stroke={occupied ? '#d88c66' : '#538f62'} strokeWidth="2.5" />}
        </g>
      })}
      <rect x="529" y="92" width="145" height="118" rx="14" fill="#fff" />
      <text x="548" y="117" fontSize="11" fill="#688176" fontWeight="700">OCCUPANCY</text>
      <text x="548" y="157" fontSize="34" fill={theme.ink} fontWeight="800">{slide === 1 ? '82%' : '75%'}</text>
      <rect x="548" y="173" width="104" height="7" rx="3.5" fill="#e3e9e2" />
      <rect x="548" y="173" width={slide === 1 ? 85 : 78} height="7" rx="3.5" fill={theme.secondary} />
      <rect x="529" y="222" width="145" height="126" rx="14" fill="#fff" />
      <text x="548" y="247" fontSize="11" fill="#688176" fontWeight="700">MODEL OUTPUT</text>
      <circle cx="558" cy="272" r="5" fill="#d88c66" /><text x="572" y="276" fontSize="11" fill="#465b51">Detected</text>
      <circle cx="558" cy="296" r="5" fill="#75a77c" /><text x="572" y="300" fontSize="11" fill="#465b51">Available</text>
      <text x="548" y="326" fontSize="10" fill="#809088">Faster R-CNN / R50</text>
    </>
  )
}

function CommerceIllustration({ slide, theme }) {
  return (
    <>
      <rect x="47" y="92" width="627" height="256" rx="15" fill="#fffcf8" />
      <rect x="47" y="92" width="627" height="36" rx="15" fill="#eee2d5" />
      <circle cx="65" cy="110" r="3.5" fill="#c98966"/><circle cx="77" cy="110" r="3.5" fill="#d7b08c"/><circle cx="89" cy="110" r="3.5" fill="#8fa38f"/>
      <rect x="122" y="105" width="125" height="10" rx="5" fill="#d4c0ab" />
      <text x="72" y="156" fontSize="11" fill="#a16b47" fontWeight="800" letterSpacing="2">BERKAH KALDERA UTAMA</text>
      <text x="72" y="190" fontSize="23" fill={theme.ink} fontWeight="800">Built for every kitchen.</text>
      <text x="72" y="211" fontSize="10" fill="#897767">Reliable cookware, made to work hard.</text>
      <rect x="72" y="230" width="106" height="27" rx="13.5" fill={theme.ink} />
      <text x="88" y="247" fontSize="10" fill="#fff" fontWeight="700">Explore products ↗</text>
      <rect x="365" y="147" width="130" height="174" rx="12" fill="#f0e0ce" />
      <rect x="506" y="147" width="145" height="174" rx="12" fill="#f4e7da" />
      <g transform={`translate(${slide === 1 ? 383 : 380} 188)`}>
        <ellipse cx="55" cy="83" rx="42" ry="8" fill="#d2bfad"/>
        <path d="M13 34h84l-9 43c-2 10-11 16-22 16H43c-11 0-20-7-22-17l-8-42Z" fill="#41494a"/>
        <ellipse cx="55" cy="34" rx="43" ry="12" fill="#596363"/>
        <ellipse cx="55" cy="33" rx="35" ry="7" fill="#d2b396"/>
        <path d="M97 41l29 14" stroke="#41494a" strokeWidth="8" strokeLinecap="round"/>
        <path d="M22 25L4 16" stroke="#41494a" strokeWidth="6" strokeLinecap="round"/>
      </g>
      <g transform="translate(521 185)">
        <ellipse cx="56" cy="87" rx="43" ry="8" fill="#e0c9b3"/>
        <path d="M18 30h75l-5 47c-1 13-10 21-23 21H45c-13 0-22-8-23-21l-4-47Z" fill="#8e9d8b"/>
        <ellipse cx="55" cy="30" rx="39" ry="11" fill="#788875"/>
        <ellipse cx="55" cy="29" rx="31" ry="6" fill="#d9d4c1"/>
        <path d="M90 39l24 15" stroke="#788875" strokeWidth="8" strokeLinecap="round"/>
        <path d="M27 23L12 14" stroke="#788875" strokeWidth="6" strokeLinecap="round"/>
      </g>
      {slide === 2 && <rect x="356" y="139" width="310" height="190" rx="16" fill="none" stroke={theme.secondary} strokeWidth="3" strokeDasharray="7 5" />}
    </>
  )
}

function GameIllustration({ slide, theme }) {
  return (
    <>
      <rect x="47" y="92" width="627" height="256" rx="15" fill="#282845" />
      <circle cx="570" cy="145" r="49" fill={theme.accent} fillOpacity=".6" />
      <path d="M47 278 164 185l75 63 92-82 130 108 102-78 111 79v73H47v-70Z" fill="#4b497b" />
      <path d="M47 308 145 259l99 43 83-59 105 77 79-45 163 33v40H47v-40Z" fill="#36365b" />
      <rect x="71" y="110" width="154" height="31" rx="15.5" fill="#fff" fillOpacity=".11" />
      <circle cx="89" cy="125.5" r="5" fill={theme.accent} /><text x="101" y="129.5" fontSize="10" fill="#fff" fontWeight="700">{slide === 1 ? 'PLAYER 02' : 'PLAYER 01'}</text>
      <rect x="488" y="110" width="162" height="31" rx="15.5" fill="#fff" fillOpacity=".11" />
      <text x="507" y="129.5" fontSize="10" fill="#fff" fontWeight="700">{slide === 2 ? 'LEVEL COMPLETE' : 'NOISE LEVEL'}</text>
      <rect x="507" y="151" width="121" height="7" rx="3.5" fill="#fff" fillOpacity=".2" />
      <rect x="507" y="151" width={slide === 1 ? 103 : 77} height="7" rx="3.5" fill={theme.accent} />
      <g transform={`translate(${slide === 1 ? 290 : 260} 210)`}>
        <rect x="0" y="0" width="57" height="57" rx="13" fill={theme.accent} />
        <rect x="10" y="14" width="37" height="29" rx="7" fill="#343354" />
        <rect x="16" y="21" width="9" height="6" rx="2" fill="#fff" />
        <rect x="32" y="21" width="9" height="6" rx="2" fill="#fff" />
        <path d="M20 34h17" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <path d="M11 56 4 73M45 56l8 17" stroke={theme.accent} strokeWidth="8" strokeLinecap="round" />
      </g>
      <g transform={`translate(${slide === 1 ? 402 : 440} 231)`}>
        <rect x="0" y="0" width="43" height="43" rx="10" fill="#e7a780" />
        <rect x="7" y="9" width="29" height="22" rx="5" fill="#514061" />
        <circle cx="15" cy="18" r="3" fill="#fff"/><circle cx="28" cy="18" r="3" fill="#fff"/>
        <path d="M13 27h18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M9 43 4 56M34 43l5 13" stroke="#e7a780" strokeWidth="7" strokeLinecap="round" />
      </g>
      <rect x="250" y="310" width="223" height="23" rx="11.5" fill="#15152e" fillOpacity=".65" />
      <text x="361" y="325" fontSize="10" textAnchor="middle" fill="#fff" fontWeight="700">{slide === 2 ? 'NEXT ROUND →' : 'PRESS SPACE TO PLAY'}</text>
    </>
  )
}

function NoSnapshot({ className = '' }) {
  return (
    <div className={`project-artwork flex aspect-[1.9/1] w-full flex-col items-center justify-center gap-3 rounded-[22px] border border-dashed border-stone-300 bg-stone-100 px-5 text-center dark:border-white/20 dark:bg-slate-900 ${className}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-white/10">
        <ImageOff size={26} className="text-stone-400 dark:text-white/50" />
      </div>
      <p className="text-sm font-bold text-ink dark:text-white">No Snapshot Available</p>
      <p className="text-xs text-muted">No screenshots have been added to this project yet.</p>
    </div>
  )
}

export default function ProjectArtwork({ project, slide = 0, variant = 'cover', className = '' }) {
  const theme = themes[project.visual] || themes.vision
  const isSnapshot = variant === 'snapshot'
  const selectedSnapshot = isSnapshot ? project.snapshots?.[slide] : null

  // Cover and snapshots are separate image sources. The slide index selects
  // a snapshot only; it must never change a snapshot into the cover image.
  const imageSource = isSnapshot
    ? selectedSnapshot?.image
    : (project.coverImage || project.snapshots?.find((item) => item.image)?.image)

  const imageLabel = isSnapshot
    ? (selectedSnapshot?.title || `Snapshot ${slide + 1}`)
    : (project.previewLabel || 'Project cover')

  // Never fall back to the illustration or cover when a snapshot is missing.
  if (isSnapshot && !imageSource) {
    return <NoSnapshot className={className} />
  }

  if (imageSource) {
    return (
      <div className={`project-artwork relative overflow-hidden rounded-[22px] bg-stone-100 ${className}`}>
        <img
          src={imageSource}
          alt={`${project.title} ${isSnapshot ? `snapshot ${slide + 1}` : 'cover'}`}
          className="block aspect-[1.9/1] h-auto w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-5 pb-4 pt-12 sm:px-7">
          <p className="text-xs font-extrabold text-white">{project.title}</p>
          <p className="mt-1 text-[10px] font-semibold text-white/75">{imageLabel}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`project-artwork overflow-hidden rounded-[22px] ${className}`} style={{ backgroundColor: theme.bg }}>
      <div className="flex items-center justify-between px-5 pt-4 sm:px-7 sm:pt-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: theme.ink, color: theme.accent }}>
            {project.visual === 'vision' ? <Cpu size={14} /> : project.visual === 'commerce' ? <ShoppingBag size={14} /> : <CirclePlay size={14} />}
          </span>
          <span className="text-xs font-extrabold tracking-tight" style={{ color: theme.ink }}>{project.title}</span>
        </div>
        <span className="hidden items-center gap-1 rounded-full bg-white/60 px-2.5 py-1 text-[10px] font-semibold sm:inline-flex" style={{ color: theme.ink }}><Sparkles size={11} /> Preview {slide + 1}/{project.snapshots?.length || 3}</span>
      </div>
      <svg viewBox="0 0 720 380" role="img" aria-label={`${project.title} illustrative preview ${slide + 1}`} className="block h-auto w-full">
        {project.visual === 'vision' ? <ParkingIllustration slide={slide} theme={theme} /> : project.visual === 'commerce' ? <CommerceIllustration slide={slide} theme={theme} /> : <GameIllustration slide={slide} theme={theme} />}
      </svg>
      <div className="flex items-center justify-between px-5 pb-4 sm:px-7 sm:pb-5">
        <span className="text-[10px] font-semibold uppercase tracking-[.14em]" style={{ color: theme.ink }}>{project.previewLabel}</span>
        <span className="flex items-center gap-2 text-[10px] font-medium" style={{ color: theme.ink }}>
          {project.visual === 'vision' ? <><Gauge size={12} /> Model insights</> : project.visual === 'commerce' ? <><Layers3 size={12} /> Responsive layout</> : <><Code2 size={12} /> Gameplay concept</>}
        </span>
      </div>
    </div>
  )
}
