'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Globe2,
  MapPin,
  Database,
  MousePointerClick,
  BarChart3,
  SlidersHorizontal,
  FileText,
  Compass,
} from 'lucide-react'
import { useStore } from '@/store/useStore'

const STORAGE_KEY = 'luminous-onboarding-v1'
const TOTAL = 4

/* ============================================================
   Decorative scenes — one hand-built animated visual per card
   ============================================================ */

/** Gentle infinite float used by scene props */
const float = (delay = 0, distance = 6, duration = 3) => ({
  animate: { y: [0, -distance, 0] },
  transition: { repeat: Infinity, duration, ease: 'easeInOut' as const, delay },
})

const SceneFrame = ({ children }: { children: React.ReactNode }) => (
  <div
    className="relative h-44 sm:h-48 rounded-[20px] overflow-hidden border border-ink/8"
    style={{
      background:
        'radial-gradient(120% 90% at 50% 0%, rgba(255,200,69,0.14), transparent 60%), linear-gradient(160deg, #faf6ec 0%, #f2ecdd 100%)',
    }}
  >
    {children}
  </div>
)

/** Card 1 — the atlas: globe orb, orbit ring, floating price pills */
const SceneWelcome = () => (
  <SceneFrame>
    {/* orbit ring */}
    <motion.div
      className="absolute left-1/2 top-1/2 w-40 h-40 -ml-20 -mt-20 rounded-full border border-dashed border-ink/15"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
    >
      <span className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-coral border-2 border-white shadow" />
      <span className="absolute top-1/2 -right-1.5 w-3 h-3 rounded-full bg-violet border-2 border-white shadow" />
      <span className="absolute -bottom-1.5 left-1/3 w-3 h-3 rounded-full bg-mint border-2 border-white shadow" />
    </motion.div>

    {/* central globe */}
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-[26px] flex items-center justify-center text-white shadow-xl shadow-ink/25"
      style={{ background: 'linear-gradient(145deg, #2a2740, #1e1b2e)' }}
      {...float(0, 5, 4)}
    >
      <Globe2 size={34} className="text-gold" />
    </motion.div>

    {/* floating price pills, like the live map markers */}
    <motion.div className="absolute left-5 top-6" {...float(0.4, 7)}>
      <MockMarker dot="#2fbf71" city="Mumbai" price="₹74 L" />
    </motion.div>
    <motion.div className="absolute right-4 top-12" {...float(1.1, 6)}>
      <MockMarker dot="#ffab2e" city="Bangalore" price="₹82 L" />
    </motion.div>
    <motion.div className="absolute left-8 bottom-5" {...float(1.8, 6)}>
      <MockMarker dot="#ff5050" city="Delhi" price="₹70 L" />
    </motion.div>
  </SceneFrame>
)

const MockMarker = ({ dot, city, price }: { dot: string; city: string; price: string }) => (
  <span className="flex items-center gap-1.5 bg-white border-2 border-ink rounded-full pl-2 pr-3 py-1 font-headline text-[10px] font-bold text-ink shadow-[0_3px_0_rgba(30,27,46,0.3)]">
    <span className="w-2 h-2 rounded-full" style={{ background: dot }} />
    {city}
    <span className="font-medium opacity-60">{price}</span>
  </span>
)

/** Card 2 — exploring: city chips, a tap cursor, mini drawer */
const SceneExplore = () => (
  <SceneFrame>
    {/* mock nav chips */}
    <motion.div
      className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-1 glass-pill px-2 py-1.5"
      {...float(0, 4, 4)}
    >
      {['Mumbai', 'Delhi', 'Pune'].map((c, i) => (
        <span
          key={c}
          className={`font-headline text-[9px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
            i === 0 ? 'bg-ink text-gold' : 'text-ink/50'
          }`}
        >
          {c}
        </span>
      ))}
    </motion.div>

    {/* marker being tapped */}
    <motion.div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2" {...float(0.5, 5)}>
      <MockMarker dot="#2fbf71" city="BKC" price="₹1.2 Cr" />
    </motion.div>
    <motion.div
      className="absolute left-[58%] top-[58%] text-ink"
      animate={{ scale: [1, 0.82, 1], x: [4, 0, 4], y: [4, 0, 4] }}
      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
    >
      <MousePointerClick size={22} strokeWidth={2.4} />
    </motion.div>

    {/* mini bottom drawer sliding up */}
    <motion.div
      className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[78%] glass-pill !rounded-2xl px-4 py-2.5 flex items-center justify-between"
      animate={{ y: [8, 0, 8] }}
      transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}
    >
      <div className="flex flex-col">
        <span className="text-[7px] font-bold uppercase tracking-widest text-ink/40 font-headline">Bubble Score</span>
        <span className="text-[11px] font-black text-mint">24 · Stable</span>
      </div>
      <BarChart3 size={16} className="text-ink/50" />
    </motion.div>
  </SceneFrame>
)

/** Card 3 — AI: mini chat exchange over a glowing gradient orb */
const SceneAI = () => (
  <SceneFrame>
    {/* glow orb */}
    <motion.div
      className="absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-35 blur-2xl"
      style={{ background: 'linear-gradient(135deg, #7b61ff, #f45ea9)' }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
    />

    <div className="absolute inset-0 px-5 py-5 flex flex-col justify-center gap-2.5">
      {/* user bubble */}
      <motion.div
        className="self-end max-w-[75%] bg-ink text-white/95 rounded-2xl rounded-br-md px-3.5 py-2 text-[10px] font-medium shadow-md shadow-ink/20"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        What if the repo rate rises 250 bps?
      </motion.div>

      {/* AI bubble */}
      <motion.div
        className="self-start max-w-[80%] bg-white/85 border border-ink/8 rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <span className="flex items-center gap-1 text-violet mb-1">
          <Sparkles size={9} />
          <span className="text-[7px] font-black uppercase tracking-[0.15em]">Atlas AI</span>
        </span>
        <p className="text-[9.5px] text-ink/75 leading-snug font-medium">
          Running 10,000 Monte Carlo simulations on Mumbai…
        </p>
        <div className="flex gap-1.5 mt-2">
          <span className="text-[8px] font-black text-ink bg-ink/6 border border-ink/10 rounded-md px-1.5 py-0.5">₹1.08 Cr base</span>
          <span className="text-[8px] font-black text-mint bg-mint/10 border border-mint/25 rounded-md px-1.5 py-0.5">91% safe</span>
        </div>
      </motion.div>

      {/* typing dots */}
      <div className="self-start flex gap-1 pl-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-violet/50"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.18 }}
          />
        ))}
      </div>
    </div>
  </SceneFrame>
)

/** Card 4 — the color language: risk dots + height ramp */
const SceneColors = () => (
  <SceneFrame>
    <div className="absolute inset-0 px-6 py-5 flex flex-col justify-center gap-4">
      {/* risk dots */}
      <div className="flex justify-between gap-2">
        {([
          ['#2fbf71', 'Stable', '< 35'],
          ['#ffab2e', 'Watch', '35 – 64'],
          ['#ff5050', 'At risk', '65 +'],
        ] as const).map(([color, label, range], i) => (
          <motion.div
            key={label}
            className="flex-1 bg-white/75 border border-ink/8 rounded-2xl py-3 flex flex-col items-center gap-1.5 shadow-sm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.15, type: 'spring', damping: 18 }}
          >
            <motion.span
              className="w-4 h-4 rounded-full border-2 border-white shadow"
              style={{ background: color, boxShadow: `0 0 12px ${color}66` }}
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ repeat: Infinity, duration: 2.4, delay: i * 0.4 }}
            />
            <span className="font-headline text-[9px] font-black uppercase tracking-wider text-ink">{label}</span>
            <span className="text-[8px] font-bold text-ink/40">score {range}</span>
          </motion.div>
        ))}
      </div>

      {/* height ramp */}
      <motion.div
        className="bg-white/75 border border-ink/8 rounded-2xl px-4 py-3 shadow-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, type: 'spring', damping: 18 }}
      >
        <div
          className="h-2.5 rounded-full border border-ink/15"
          style={{ background: 'linear-gradient(90deg, #ffd97a, #ffb35c, #f2699c, #8f6bf5)' }}
        />
        <div className="flex justify-between mt-1.5 font-headline text-[8px] font-bold uppercase tracking-wider text-ink/45">
          <span>Low-rise</span>
          <span>Building height</span>
          <span>Tower</span>
        </div>
      </motion.div>
    </div>
  </SceneFrame>
)

/* ============================================================
   Card copy
   ============================================================ */

const CARDS = [
  {
    scene: <SceneWelcome />,
    icon: <Globe2 size={14} />,
    kicker: 'Welcome to Luminous Atlas',
    title: 'A living map of India’s housing market',
    body: 'Explore bubble risk across eight major metros on a colorful 3D atlas. Everything you see is driven by real data — NHB RESIDEX prices, RBI rates and World Bank macro — refreshed automatically every 3 days.',
    points: [
      { icon: <Database size={12} />, text: 'Live engine, not static numbers' },
      { icon: <MapPin size={12} />, text: '8 metros tracked city-by-city' },
    ],
  },
  {
    scene: <SceneExplore />,
    icon: <Compass size={14} />,
    kicker: 'Getting around',
    title: 'Fly, tap, and pull up the numbers',
    body: 'Pick a city from the top bar to fly there. Tap any price pill on the map for that metro’s full breakdown, and pull up the bottom drawer for live analytics — risk radar, market quadrant and key ratios.',
    points: [
      { icon: <MousePointerClick size={12} />, text: 'Tap a pill → full city breakdown' },
      { icon: <BarChart3 size={12} />, text: 'Bottom drawer → deep analytics' },
    ],
  },
  {
    scene: <SceneAI />,
    icon: <Sparkles size={14} />,
    kicker: 'Atlas AI',
    title: 'Ask “what if” in plain English',
    body: 'Hit the Ask AI button and type any scenario — a rate hike, an inflation spike, a GDP shock. The engine runs 10,000 Monte Carlo simulations and answers with real numbers. Prefer knobs? The Scenario Lab has manual sliders.',
    points: [
      { icon: <SlidersHorizontal size={12} />, text: 'Scenario Lab for manual stress tests' },
      { icon: <FileText size={12} />, text: 'Export any run as a PDF report' },
    ],
  },
  {
    scene: <SceneColors />,
    icon: <MapPin size={14} />,
    kicker: 'The color language',
    title: 'Every color tells you something',
    body: 'City dots show bubble risk — green is stable, amber means watch closely, red is overheated. Building colors encode height: gold low-rises climb through pink to violet towers. That’s it — you’re ready.',
    points: [],
  },
]

/* ============================================================
   Main component
   ============================================================ */

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 340 : -340, opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -340 : 340, opacity: 0, scale: 0.96 }),
}

const OnboardingCards = () => {
  const { isOnboardingOpen, setIsOnboardingOpen } = useStore()
  const [[index, direction], setPage] = useState<[number, number]>([0, 0])

  // First visit → auto-open
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
      setIsOnboardingOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset to the first card whenever it opens
  useEffect(() => {
    if (isOnboardingOpen) setPage([0, 0])
  }, [isOnboardingOpen])

  const close = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'seen')
    setIsOnboardingOpen(false)
  }, [setIsOnboardingOpen])

  const go = useCallback(
    (dir: number) => {
      setPage(([i]) => {
        const next = i + dir
        if (next < 0 || next >= TOTAL) return [i, dir]
        return [next, dir]
      })
    },
    [],
  )

  // Keyboard: arrows navigate, Escape closes
  useEffect(() => {
    if (!isOnboardingOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOnboardingOpen, go, close])

  const card = CARDS[index]
  const isLast = index === TOTAL - 1

  return (
    <AnimatePresence>
      {isOnboardingOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[90] pointer-events-auto flex items-center justify-center px-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/45 backdrop-blur-md"
            onClick={close}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.94 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="glass-panel relative w-[min(94vw,440px)] rounded-[30px] overflow-hidden"
          >
            {/* Skip */}
            <button
              onClick={close}
              aria-label="Skip intro"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/70 border border-ink/8 text-ink/45 hover:text-ink hover:bg-white transition-colors"
            >
              <X size={16} />
            </button>

            {/* Slide area — swipeable */}
            <div className="px-5 pt-5 pb-2 overflow-hidden">
              <AnimatePresence custom={direction} mode="popLayout" initial={false}>
                <motion.div
                  key={index}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -70 || info.velocity.x < -400) go(1)
                    else if (info.offset.x > 70 || info.velocity.x > 400) go(-1)
                  }}
                  className="cursor-grab active:cursor-grabbing"
                >
                  {card.scene}

                  {/* Copy */}
                  <div className="px-1.5 pt-5 pb-3 min-h-[172px] sm:min-h-[164px]">
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] font-headline text-white ai-gradient rounded-full px-2.5 py-1 shadow-md shadow-violet/25">
                      {card.icon}
                      {card.kicker}
                    </span>
                    <h2 className="font-headline text-[19px] font-bold text-ink tracking-tight leading-snug mt-3">
                      {card.title}
                    </h2>
                    <p className="text-[12px] text-ink/60 leading-relaxed mt-2 font-medium">
                      {card.body}
                    </p>
                    {card.points.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {card.points.map((p) => (
                          <span
                            key={p.text}
                            className="inline-flex items-center gap-1.5 text-[9.5px] font-bold text-ink/65 bg-white/70 border border-ink/8 rounded-full px-2.5 py-1"
                          >
                            <span className="text-violet">{p.icon}</span>
                            {p.text}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer: dots + nav */}
            <div className="glass-head flex items-center justify-between px-5 py-4 border-t border-ink/8" style={{ borderBottom: 'none' }}>
              {/* Back */}
              <button
                onClick={() => go(-1)}
                disabled={index === 0}
                aria-label="Previous card"
                className="p-2.5 rounded-full text-ink/50 hover:text-ink hover:bg-ink/5 transition-all disabled:opacity-0 disabled:pointer-events-none"
              >
                <ArrowLeft size={17} />
              </button>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: TOTAL }).map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setPage([i, i > index ? 1 : -1])}
                    aria-label={`Go to card ${i + 1}`}
                    className={`h-2 rounded-full transition-colors ${i === index ? 'bg-ink' : 'bg-ink/15 hover:bg-ink/30'}`}
                    animate={{ width: i === index ? 22 : 8 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  />
                ))}
              </div>

              {/* Next / Done */}
              {isLast ? (
                <button
                  onClick={close}
                  className="ai-gradient flex items-center gap-2 text-white text-[11px] font-bold font-headline uppercase tracking-wider px-4 py-2.5 rounded-full shadow-lg shadow-violet/30 hover:brightness-110 active:scale-95 transition-all"
                >
                  Start exploring
                  <Sparkles size={14} />
                </button>
              ) : (
                <button
                  onClick={() => go(1)}
                  className="flex items-center gap-2 bg-ink text-gold text-[11px] font-bold font-headline uppercase tracking-wider px-4 py-2.5 rounded-full shadow-lg shadow-ink/30 hover:bg-[#2a2740] active:scale-95 transition-all"
                >
                  Next
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OnboardingCards
