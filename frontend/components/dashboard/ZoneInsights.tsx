'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, ZoneData } from '@/store/useStore'
import { X, TrendingUp, Home, AlertTriangle, Target, Briefcase, Zap } from 'lucide-react'

const ZoneInsights = () => {
  const { selectedZone, setSelectedZone } = useStore()

  if (!selectedZone) return null

  const getRecColor = (rec: ZoneData['recommendation']) => {
    switch (rec) {
      case 'BUY': return 'text-emerald-500'
      case 'HOLD': return 'text-amber-500'
      case 'SELL': return 'text-rose-500'
      default: return 'text-slate-500'
    }
  }

  const getRiskLabel = (score: number) => {
    if (score < 30) return { label: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
    if (score < 60) return { label: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-500/10' }
    return { label: 'At Risk', color: 'text-rose-500', bg: 'bg-rose-500/10' }
  }

  const risk = getRiskLabel(selectedZone.risk_score)

  return (
    <AnimatePresence>
      <motion.div
        key={selectedZone.id}
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        className="fixed z-50 pointer-events-auto flex flex-col
                   inset-x-3 bottom-3 top-auto max-h-[80vh]
                   sm:inset-x-auto sm:top-28 sm:right-8 sm:bottom-48 sm:w-[400px] sm:max-h-none"
      >
        <div className="glass-panel rounded-[26px] sm:rounded-[28px] overflow-hidden flex flex-col h-full">
          {/* Header - Fixed */}
          <div className="glass-head px-5 sm:px-7 pt-6 pb-5 flex justify-between items-start shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${risk.bg} ${risk.color}`}>
                  {risk.label} Stability
                </span>
              </div>
              <h2 className="text-2xl font-black text-ink tracking-tighter leading-none font-headline">
                {selectedZone.name}
              </h2>
              <p className="text-ink/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-ink/40 rounded-full" />
                {selectedZone.region} Investment Node
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setSelectedZone(null);
              }}
              className="p-2.5 rounded-full text-ink/45 hover:text-ink hover:bg-ink/5 transition-colors pointer-events-auto"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-4 space-y-8 scroll-smooth select-text custom-scrollbar">
            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <MetricBox 
                icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                label="Annual Yield"
                value={`${selectedZone.yield_pct}%`}
              />
              <MetricBox 
                icon={<Target className="w-4 h-4 text-blue-500" />}
                label="Appreciation"
                value={`${selectedZone.appreciation_pct}%`}
              />
              <MetricBox 
                icon={<Home className="w-4 h-4 text-purple-500" />}
                label="Occupancy"
                value={`${selectedZone.occupancy_pct}%`}
              />
              <MetricBox 
                icon={<Briefcase className="w-4 h-4 text-orange-500" />}
                label="Risk Score"
                value={`${selectedZone.risk_score}/100`}
              />
            </div>

            {/* Strategy Recommendation */}
            <div className="space-y-6">
              <div className="glass-tile p-6 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-ink/55 uppercase tracking-widest font-headline">
                    Recommendation
                  </span>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/85 border border-ink/8 shadow-sm`}>
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${getRecColor(selectedZone.recommendation).replace('text-', 'bg-')}`} />
                    <span className={`text-[11px] font-black tracking-tighter ${getRecColor(selectedZone.recommendation)}`}>
                      STRICT {selectedZone.recommendation}
                    </span>
                  </div>
                </div>
                <p className="text-ink/80 text-sm leading-relaxed font-semibold tracking-tight">
                  {selectedZone.narrative}
                </p>
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-black text-ink/40 uppercase tracking-widest flex items-center gap-2 mb-4 font-headline">
                  <div className="w-10 h-[1px] bg-ink/15" />
                  Zone Intelligence
                </span>
                <p className="text-ink/55 text-xs leading-relaxed font-medium pl-3 border-l-2 border-ink/10 pb-8">
                  {selectedZone.details}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

    </AnimatePresence>
  )
}

const MetricBox = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="glass-tile p-4 flex flex-col items-center text-center">
    <div className="mb-2 p-2 bg-white/85 rounded-xl shadow-sm border border-ink/6">{icon}</div>
    <span className="text-[9px] text-ink/40 font-bold uppercase tracking-widest">{label}</span>
    <div className="text-lg font-black text-ink tracking-tighter">{value}</div>
  </div>
)

export default ZoneInsights
