'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, BarChart3, History, Loader2, Shield } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { api } from '@/lib/apiClient'
import type { ValuationRecord, BubbleFlag } from '@/lib/apiClient'
import { CITY_BY_ASSET, priceInrFor } from '@/lib/cityData'

const PropertyPanel = ({ isOpen = true, onClose = () => {} }: any) => {
  const { selectedAssetId, valuations, bubbleFlags, macroSnapshot } = useStore()
  const [loading, setLoading] = useState(false)
  const [liveValuation, setLiveValuation] = useState<ValuationRecord | null>(null)
  const [liveBubble, setLiveBubble] = useState<BubbleFlag | null>(null)

  const city = selectedAssetId ? CITY_BY_ASSET[selectedAssetId] : null
  // RESIDEX-derived estimate — always a real number, even when the backend is down
  const estimatedInr = city ? priceInrFor(macroSnapshot, city) : null

  // Fetch fresh data when a building is selected
  useEffect(() => {
    if (!isOpen || !selectedAssetId) return

    setLoading(true)

    // Resolve the region for this asset across all tracked cities
    const region = CITY_BY_ASSET[selectedAssetId]?.key || 'national'

    // Use cached valuations from store
    const cached = valuations.find(v => v.region?.toLowerCase() === region)
    if (cached) setLiveValuation(cached)

    const cachedFlag = bubbleFlags.find(f => f.region?.toLowerCase() === region)
    if (cachedFlag) setLiveBubble(cachedFlag)

    // Also try fresh fetch
    Promise.all([
      api<ValuationRecord[]>('/api/valuations').catch(() => []),
      api<BubbleFlag[]>('/api/risk/bubble-flags').catch(() => []),
    ]).then(([vals, flags]) => {
      const v = vals.find(v => v.region?.toLowerCase() === region) || vals[0] || null
      const f = flags.find(f => f.region?.toLowerCase() === region) || flags[0] || null
      if (v) setLiveValuation(v)
      if (f) setLiveBubble(f)
      setLoading(false)
    })
  }, [isOpen, selectedAssetId, valuations, bubbleFlags])

  // Format currency
  const fmtInr = (val: number | null | undefined) => {
    if (val == null) return '—'
    if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(1)}Cr`
    if (val >= 100_000) return `₹${(val / 100_000).toFixed(1)}L`
    return `₹${val.toLocaleString('en-IN')}`
  }

  const riskScore = liveBubble?.overall_score ?? 0
  const riskLabel = riskScore < 30 ? 'Safe' : riskScore < 60 ? 'Moderate' : 'High Risk'
  const riskWidth = `${Math.min(riskScore, 100)}%`
  const riskColor = riskScore < 30 ? '#2fbf71' : riskScore < 60 ? '#ffab2e' : '#ff5050'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="glass-panel fixed z-[60] flex flex-col pointer-events-auto overflow-hidden
                     inset-x-3 bottom-3 top-auto max-h-[82vh] rounded-[26px]
                     sm:inset-x-auto sm:right-6 sm:top-24 sm:bottom-8 sm:w-[400px] sm:max-h-none sm:rounded-[28px]"
        >
          {/* Header */}
          <div className="glass-head px-5 sm:px-6 pt-5 pb-5 shrink-0">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-xl font-headline font-bold text-ink tracking-tighter">{selectedAssetId || 'Asset'}</h2>
                <p className="text-[10px] text-ink/50 font-bold font-headline tracking-widest uppercase mt-1">
                  {liveBubble?.region || 'BKC'} • {liveValuation?.region || 'India'}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close property panel"
                className="p-2 rounded-full text-ink/45 hover:text-ink hover:bg-ink/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Visual Header */}
            <div className="rounded-3xl overflow-hidden h-40 border border-white/70 relative shadow-md shadow-ink/10">
              <img 
                alt="Building" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 saturate-[0.7] brightness-[1.1]" 
                src="https://plus.unsplash.com/premium_photo-1671971714081-0f79668d249f?q=80&w=2000&auto=format&fit=crop" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/70 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <div className="text-ink font-headline text-2xl font-bold tracking-tighter">
                  {loading
                    ? <Loader2 size={20} className="animate-spin" />
                    : fmtInr(liveValuation?.property_value || liveValuation?.dcf_value || estimatedInr)}
                </div>
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.1em]">
                  {liveValuation ? 'Current Valuation' : 'Est. Median · NHB RESIDEX'}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-6 py-6 space-y-8 min-h-0">
            {/* Rapid Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-tile p-4 space-y-1">
                <div className="flex items-center gap-2 text-ink/40">
                  <TrendingUp size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Cap Rate</span>
                </div>
                <div className="text-lg font-headline font-bold text-ink">
                  {liveValuation?.cap_rate ? `${liveValuation.cap_rate.toFixed(1)}%` : '—'}
                </div>
              </div>
              <div className="glass-tile p-4 space-y-1">
                <div className="flex items-center gap-2 text-ink/40">
                  <BarChart3 size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">P/I Ratio</span>
                </div>
                <div className="text-lg font-headline font-bold text-ink">
                  {liveBubble?.price_income_ratio ? `${liveBubble.price_income_ratio.toFixed(1)}x` : '—'}
                </div>
              </div>
            </div>

            {/* Risk Profile */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <div className="flex flex-col gap-1">
                  <h4 className="font-headline text-[10px] font-bold tracking-[0.2em] text-ink/40 uppercase">Risk Profile</h4>
                  {selectedAssetId && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                      <Shield className="w-2.5 h-2.5 text-emerald-600" />
                      <span className="text-[8px] font-bold text-emerald-700 uppercase tracking-tighter">
                        PROBING: {selectedAssetId.includes('RE') || selectedAssetId.includes('APT') ? 'P/I AFFORDABILITY' : 'CAP RATE SPREAD'}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold font-mono" style={{ color: riskColor }}>
                  {riskLabel} • {(riskScore / 100).toFixed(2)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: riskWidth }}
                  className="h-full rounded-full" 
                  style={{ backgroundColor: riskColor }}
                />
              </div>
              <p className="text-[11px] text-ink/55 font-medium mt-4 leading-relaxed">
                {liveBubble?.narrative || liveValuation?.narrative || 'Risk analysis pending. Click "Run Analytics" to trigger a full valuation.'}
              </p>
            </section>

            {/* Activity Log */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <History size={14} className="text-ink/30" />
                <h4 className="font-headline text-[10px] font-bold tracking-[0.2em] text-ink/40 uppercase">Data Sources</h4>
              </div>
              <div className="space-y-4">
                <AuditItem time="Live" msg={`Bubble score: ${riskScore}/100 for ${liveBubble?.region || 'region'}`} />
                <AuditItem time="DB" msg={`${liveValuation ? 'Valuation found' : 'No valuations yet'} in database`} />
                <AuditItem time="API" msg={`Backend engine: ${liveBubble ? 'Active' : 'Pending run'}`} />
              </div>
            </section>
          </div>

          {/* Action Footer */}
          <div className="glass-head px-5 sm:px-6 py-4 mt-auto border-t border-ink/8 shrink-0" style={{ borderBottom: 'none' }}>
            <button 
              onClick={async () => {
                setLoading(true)
                try {
                  await api('/api/valuate', { method: 'POST', body: JSON.stringify({ region: liveBubble?.region || 'national' }) })
                  // Refresh data after valuation
                  const [vals, flags] = await Promise.all([
                    api<ValuationRecord[]>('/api/valuations'),
                    api<BubbleFlag[]>('/api/risk/bubble-flags'),
                  ])
                  if (vals[0]) setLiveValuation(vals[0])
                  if (flags[0]) setLiveBubble(flags[0])
                } catch (e) {
                  console.error('[Valuate] Error:', e)
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
              className="w-full bg-ink text-white py-3.5 rounded-2xl font-headline font-bold text-xs tracking-[0.2em] uppercase transition-all shadow-lg shadow-ink/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-3"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Running Analysis...</> : 'Run Analytics'}
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

const AuditItem = ({ time, msg }: any) => (
  <div className="flex gap-4 group">
    <span className="text-[9px] font-mono font-bold text-ink/30 w-12 pt-0.5">{time}</span>
    <div className="flex-1 border-l-2 border-ink/8 pl-4 py-0.5 text-[10.5px] text-ink/55 font-medium group-hover:text-ink transition-colors">
      {msg}
    </div>
  </div>
)

export default PropertyPanel
