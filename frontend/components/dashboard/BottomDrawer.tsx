'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import RiskRadar from './RiskRadar'
import { MarketQuadrant } from './MarketCharts'
import { ChevronUp, ChevronDown } from 'lucide-react'

const BottomDrawer = () => {
  const { macroSnapshot, backendStatus, bubbleFlags, activeRegion } = useStore()
  const [isExpanded, setIsExpanded] = useState(false)

  // Find the bubble flag matching the active region
  const regionFlag = bubbleFlags.find(
    f => f.region.toLowerCase() === activeRegion.toLowerCase()
  ) || bubbleFlags[0] || null

  const displayScore = regionFlag?.overall_score ?? null
  const piRatio = regionFlag?.price_income_ratio
  const prRatio = regionFlag?.price_rent_ratio
  const affordability = regionFlag?.affordability_pct
  const capSpread = regionFlag?.cap_rate_spread

  const stability = displayScore == null
    ? { label: '—', text: 'text-ink/40', chip: 'bg-ink/5 text-ink/50 border-ink/10' }
    : displayScore < 30
    ? { label: 'Stable', text: 'text-mint', chip: 'bg-mint/12 text-mint border-mint/25' }
    : displayScore < 60
    ? { label: 'Watch', text: 'text-orange', chip: 'bg-orange/12 text-orange border-orange/25' }
    : { label: 'At Risk', text: 'text-coral', chip: 'bg-coral/12 text-coral border-coral/25' }

  // RESIDEX for the active region
  const residexKey = `nhb_residex_${activeRegion.toLowerCase()}` as keyof typeof macroSnapshot
  const residex = macroSnapshot ? (macroSnapshot as any)[residexKey] ?? macroSnapshot.nhb_residex_composite : null

  // Derive Yield proxy from PR Ratio (1/PR * 100) scaled for visibility
  const yieldProxy = prRatio ? Math.min(10, (1 / prRatio) * 100 * 1.5) : 3.5

  return (
    <motion.footer
      initial={false}
      animate={{ height: isExpanded ? 560 : 92 }}
      transition={{ type: 'spring', damping: 26, stiffness: 210 }}
      className="glass-panel fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] sm:w-[calc(100%-64px)] max-w-6xl max-h-[84vh] z-40 flex flex-col rounded-[26px] sm:rounded-[30px] pointer-events-auto overflow-hidden"
    >
      {/* ===== PULL BAR — whole strip is tappable ===== */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Collapse market analytics' : 'Expand market analytics'}
        className="w-full shrink-0 px-4 sm:px-8 pt-2 pb-3 text-left group"
      >
        {/* grab handle */}
        <div className="flex justify-center pb-1.5">
          <span className="w-9 h-1 rounded-full bg-ink/15 group-hover:bg-ink/30 transition-colors" />
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Region + score — the two facts that matter */}
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold tracking-[0.12em] text-ink/40 uppercase font-headline">Region</span>
              <span className="text-[15px] font-extrabold text-ink tracking-tight truncate leading-tight">{activeRegion}</span>
            </div>

            <div className="h-8 w-px bg-ink/8 shrink-0" />

            <div className="flex flex-col shrink-0">
              <span className="text-[9px] font-bold tracking-[0.12em] text-ink/40 uppercase font-headline">Bubble Score</span>
              <div className="flex items-center gap-2 leading-tight">
                <span className={`text-[15px] font-extrabold tracking-tight ${stability.text}`}>
                  {displayScore != null ? displayScore : '—'}
                  {displayScore != null && <span className="text-[10px] font-bold text-ink/35">/100</span>}
                </span>
                <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${stability.chip}`}>
                  {stability.label}
                </span>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-ink/8" />

            <div className="hidden sm:flex flex-col shrink-0">
              <span className="text-[9px] font-bold tracking-[0.12em] text-ink/40 uppercase font-headline">NHB RESIDEX</span>
              <span className={`text-[15px] font-extrabold tracking-tight leading-tight ${residex == null ? 'text-gold animate-pulse text-[11px]' : 'text-ink'}`}>
                {residex != null ? residex.toFixed(1) : 'Syncing…'}
              </span>
            </div>

            <div className="hidden lg:block h-8 w-px bg-ink/8" />

            <div className="hidden lg:flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                backendStatus === 'connected' ? 'bg-mint animate-pulse'
                : backendStatus === 'loading' ? 'bg-gold animate-pulse'
                : 'bg-coral'
              }`} />
              <span className="text-[9px] font-bold tracking-[0.12em] text-ink/45 uppercase font-headline whitespace-nowrap">
                {backendStatus === 'connected' ? 'Engine live' : backendStatus === 'loading' ? 'Syncing…' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Expand affordance */}
          <span
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 rounded-full text-[10px] font-bold tracking-wider uppercase font-headline transition-all shrink-0 ${
              isExpanded
                ? 'bg-ink text-gold shadow-md shadow-ink/25'
                : 'bg-ink/6 text-ink border border-ink/10 group-hover:bg-ink group-hover:text-gold'
            }`}
          >
            <span className="hidden sm:inline">{isExpanded ? 'Hide analytics' : 'Analytics'}</span>
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </span>
        </div>
      </button>

      {/* ===== EXPANDED ANALYTICS ===== */}
      <div className={`flex-1 overflow-y-auto px-4 sm:px-8 custom-scrollbar transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col lg:flex-row gap-4 sm:gap-6 pb-6 pt-2 items-stretch border-t border-ink/8"
            >
              {/* Column 1: Targeted Risk Analysis */}
              <section className="flex-1 glass-tile p-4 sm:p-5 flex flex-col min-h-[340px] mt-4">
                <h5 className="text-[10px] font-black text-ink/45 uppercase tracking-[0.2em] mb-4 font-headline">Targeted Risk Analysis</h5>
                <div className="flex flex-col sm:flex-row sm:items-center flex-1 gap-4">
                  <div className="flex-1 min-w-0 min-h-[220px]">
                    <RiskRadar
                      data={{ piRatio, prRatio, affordability, capSpread }}
                      score={displayScore}
                    />
                  </div>
                  {/* Scoreboard — row on mobile, column on desktop */}
                  <div className="grid grid-cols-4 sm:grid-cols-1 gap-3 sm:gap-4 sm:w-[130px] sm:pl-5 sm:border-l border-ink/8 shrink-0">
                    <StatBlock label="P/I Ratio" value={piRatio != null ? piRatio.toFixed(1) : '—'} />
                    <StatBlock label="P/R Ratio" value={prRatio != null ? prRatio.toFixed(1) : '—'} />
                    <StatBlock label="Affordability" value={affordability != null ? `${(affordability * 100).toFixed(0)}%` : '—'} />
                    <StatBlock label="Cap Spread" value={capSpread != null ? `${(capSpread * 100).toFixed(1)}%` : '—'} />
                  </div>
                </div>
              </section>

              {/* Column 2: Market Position Index */}
              <section className="flex-1 glass-tile p-4 sm:p-5 flex flex-col min-h-[340px] lg:mt-4">
                <h5 className="text-[10px] font-black text-ink/45 uppercase tracking-[0.2em] mb-4 font-headline">Market Position Index</h5>
                <div className="flex flex-col sm:flex-row sm:items-center flex-1 gap-4">
                  <div className="flex-1 min-w-0 min-h-[220px]">
                    <MarketQuadrant
                      activeCity={activeRegion}
                      activeRisk={displayScore}
                      activeYield={yieldProxy}
                    />
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-1 gap-3 sm:gap-4 sm:w-[130px] sm:pl-5 sm:border-l border-ink/8 shrink-0">
                    <StatBlock label="Local Yield" value={`${yieldProxy.toFixed(2)}%`} />
                    <StatBlock label="Risk Index" value={`${displayScore ?? '—'}/100`} valueClass={stability.text} />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-ink/40 uppercase tracking-widest font-headline">Status</span>
                      <span className={`mt-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border w-fit ${stability.chip}`}>
                        {stability.label}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.footer>
  )
}

const StatBlock = ({ label, value, valueClass = 'text-ink' }: { label: string; value: string; valueClass?: string }) => (
  <div className="flex flex-col">
    <span className="text-[8px] font-bold text-ink/40 uppercase tracking-widest font-headline">{label}</span>
    <span className={`text-sm font-black tracking-tight mt-0.5 ${valueClass}`}>{value}</span>
  </div>
)

export default BottomDrawer
