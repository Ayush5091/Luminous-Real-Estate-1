'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Zap, TrendingUp, AlertTriangle, FileText, Loader2, Sparkles } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { api } from '@/lib/apiClient'

const ScenarioLab = () => {
  const {
    isScenarioLabOpen,
    setIsScenarioLabOpen,
    setIsAssistantOpen,
    activeRegion,
    setIsTracing,
    setPropagationSteps
  } = useStore()

  const [params, setParams] = useState({
    rate_change_bps: 0,
    inflation_change_pct: 0,
    gdp_shock_pct: 0,
  })

  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleRun = async () => {
    setLoading(true)
    setResult(null)
    setIsTracing(true) // Start the tracing animation HUD

    // Determine a more realistic base value based on active region price index
    const cityBaseLakh = activeRegion === 'Mumbai' ? 120 : activeRegion === 'Delhi' ? 95 : 65;

    try {
      const data = await api<any>('/api/scenario/run', {
        method: 'POST',
        body: JSON.stringify({
          ...params,
          region: activeRegion,
          base_value_lakh: cityBaseLakh,
          n_simulations: 10000
        }),
      })
      setResult(data)

      if (data.propagation_trace) {
        setPropagationSteps(data.propagation_trace)
      }
    } catch (err) {
      console.error('Simulation failed:', err)
      setIsTracing(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!result) return
    setDownloading(true)
    try {
      // Dynamic imports to avoid issues with Next.js SSR
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF()
      const safeRegion = activeRegion.replace(/[^a-z0-9]/gi, '_').toLowerCase()

      // Branded Header
      doc.setFillColor(30, 27, 46) // #1e1b2e
      doc.rect(0, 0, 210, 40, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.text('LUMINOUS REAL ESTATE', 105, 20, { align: 'center' })
      doc.setFontSize(10)
      doc.text('Advanced Probabilistic Risk Simulation V3.1', 105, 30, { align: 'center' })

      // Meta Info
      doc.setTextColor(50, 50, 50)
      doc.setFontSize(10)
      doc.text(`Region: ${activeRegion}`, 20, 50)

      // Section 1: Parameters
      doc.setFontSize(14)
      doc.setTextColor(15, 77, 35)
      doc.text('1. SCENARIO PARAMETERS', 20, 70)

      autoTable(doc, {
        startY: 75,
        head: [['Variable', 'Input Shock']],
        body: [
          ['Repo Rate Move', `${params.rate_change_bps} BPS`],
          ['Inflation Pulse', `${params.inflation_change_pct}%`],
          ['GDP Shock (Demand)', `${params.gdp_shock_pct}%`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [47, 191, 113] }
      })

      // Section 2: Results
      const finalY = (doc as any).lastAutoTable.finalY + 15
      doc.text('2. SIMULATION OUTPUTS (10k ITERATIONS)', 20, finalY)

      autoTable(doc, {
        startY: finalY + 5,
        head: [['Confidence Level', 'Projected Value']],
        body: [
          ['Base Case (Expected Value)', fmtInr(result.p50)],
          ['Worst Case (Market Correction)', fmtInr(result.p5)],
          ['Best Case (Optimistic Growth)', fmtInr(result.p95)],
          ['Investment Safety Margin', `${((1 - result.prob_below_current) * 100).toFixed(2)}%`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [30, 27, 46] }
      })

      // Section 3: Narrative
      if (result.narrative) {
        const narrativeY = (doc as any).lastAutoTable.finalY + 15
        doc.text('3. AI EXECUTIVE SUMMARY', 20, narrativeY)
        doc.setFontSize(10)
        doc.setTextColor(80, 80, 80)

        const splitText = doc.splitTextToSize(result.narrative, 170)
        doc.text(splitText, 20, narrativeY + 10)
      }

      doc.save(`Luminous_Report_${safeRegion}.pdf`)
    } catch (err) {
      console.error('jsPDF generation failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  const fmtInr = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`
    return `₹${val.toLocaleString()}`
  }

  return (
    <AnimatePresence>
      {isScenarioLabOpen && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="glass-panel fixed z-[60] flex flex-col overflow-hidden pointer-events-auto
                     inset-x-3 bottom-3 top-auto max-h-[85vh] rounded-[26px]
                     sm:inset-x-auto sm:top-24 sm:right-6 sm:bottom-32 sm:w-[400px] sm:max-h-none sm:rounded-[28px]"
        >
          {/* HEADER */}
          <div className="glass-head px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-ink rounded-2xl text-gold shadow-lg shadow-ink/25">
                <Zap size={17} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-ink font-headline tracking-tight leading-none">Scenario Lab</h2>
                <p className="text-[10px] font-semibold text-ink/50 tracking-wide mt-1">
                  Monte Carlo stress test · {activeRegion}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsScenarioLabOpen(false)}
              aria-label="Close Scenario Lab"
              className="p-2 rounded-full text-ink/45 hover:text-ink hover:bg-ink/5 transition-colors"
            >
              <X size={19} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 custom-scrollbar min-h-0">
            {/* Pointer to the AI assistant for plain-English questions */}
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="w-full glass-tile px-4 py-3 flex items-center gap-3 text-left hover:bg-white/80 transition-all group"
            >
              <div className="ai-gradient p-1.5 rounded-lg text-white shrink-0">
                <Sparkles size={13} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-ink leading-tight">Prefer plain English?</p>
                <p className="text-[10px] text-ink/50 leading-tight mt-0.5 truncate">
                  Ask Atlas AI a &ldquo;what if&rdquo; — it runs the same engine
                </p>
              </div>
            </button>

            {/* CONTROLS */}
            <div className="space-y-5">
              <SliderRow
                label="Repo Rate Move"
                display={`${params.rate_change_bps > 0 ? '+' : ''}${params.rate_change_bps} bps`}
                negative={params.rate_change_bps < 0}
                min={-500} max={1000} step={25}
                value={params.rate_change_bps}
                onChange={(v) => setParams(p => ({ ...p, rate_change_bps: v }))}
              />
              <SliderRow
                label="Inflation Pulse"
                display={`${params.inflation_change_pct > 0 ? '+' : ''}${params.inflation_change_pct}%`}
                negative={params.inflation_change_pct < 0}
                min={-5} max={20} step={1}
                value={params.inflation_change_pct}
                onChange={(v) => setParams(p => ({ ...p, inflation_change_pct: v }))}
              />
              <SliderRow
                label="GDP Shock (Demand)"
                display={`${params.gdp_shock_pct > 0 ? '+' : ''}${params.gdp_shock_pct}%`}
                negative={params.gdp_shock_pct < 0}
                invertColor
                min={-10} max={10} step={1}
                value={params.gdp_shock_pct}
                onChange={(v) => setParams(p => ({ ...p, gdp_shock_pct: v }))}
              />
            </div>

            {/* RESULTS */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-4 border-t border-ink/8"
                >
                  <div className="flex items-center gap-2 text-ink">
                    <TrendingUp size={15} />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-headline">Simulation Output</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass-tile p-4">
                      <p className="text-[8px] font-bold text-ink/40 uppercase tracking-widest mb-1">Base Case</p>
                      <p className="text-[15px] font-black text-ink tracking-tight">{fmtInr(result.p50)}</p>
                    </div>
                    <div className={`p-4 rounded-[18px] border ${result.prob_below_current > 0.4 ? 'bg-coral/10 border-coral/25' : 'bg-mint/10 border-mint/25'}`}>
                      <p className={`text-[8px] font-bold uppercase tracking-widest mb-1 ${result.prob_below_current > 0.4 ? 'text-coral' : 'text-mint'}`}>Investment Safety</p>
                      <p className={`text-[15px] font-black tracking-tight ${result.prob_below_current > 0.4 ? 'text-coral' : 'text-mint'}`}>
                        {((1 - result.prob_below_current) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <p className="text-[9px] text-ink/40 font-semibold">
                    Range {fmtInr(result.p5)} – {fmtInr(result.p95)} · 10,000 iterations
                  </p>

                  {result.prob_below_current > 0.6 && (
                    <div className="bg-coral text-white p-4 rounded-2xl flex items-center gap-3">
                      <AlertTriangle size={18} className="shrink-0" />
                      <p className="text-[10px] font-bold uppercase tracking-tight leading-snug">
                        Critical: high probability of asset impairment under this scenario.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleDownloadReport}
                    disabled={downloading}
                    className="w-full py-3 glass-tile text-ink text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/85 transition-colors disabled:opacity-50 font-headline"
                  >
                    {downloading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                    {downloading ? 'Generating report…' : 'Download PDF report'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FOOTER ACTION */}
          <div className="px-5 py-4 glass-head border-t border-ink/8 shrink-0" style={{ borderBottom: 'none' }}>
            <button
              onClick={handleRun}
              disabled={loading}
              className="w-full py-3.5 bg-ink hover:bg-[#2a2740] disabled:opacity-50 text-white rounded-2xl font-bold font-headline text-xs tracking-[0.15em] uppercase flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-ink/30 active:scale-[0.98]"
            >
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="inline-flex"
                >
                  <Zap size={17} />
                </motion.span>
              ) : (
                <Play size={17} fill="currentColor" />
              )}
              {loading ? 'Running 10,000 scenarios…' : 'Run stress test'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const SliderRow = ({
  label, display, negative, invertColor = false, min, max, step, value, onChange,
}: {
  label: string
  display: string
  negative: boolean
  invertColor?: boolean
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
}) => {
  // For rates/inflation a rise is bad (coral); for GDP a fall is bad
  const isBad = invertColor ? negative : !negative
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center px-0.5">
        <label className="text-[11px] font-bold text-ink uppercase tracking-wide font-headline">{label}</label>
        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
          value === 0 ? 'text-ink/45 bg-ink/5' : isBad ? 'text-coral bg-coral/10' : 'text-mint bg-mint/10'
        }`}>
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="atlas-range"
      />
    </div>
  )
}

export default ScenarioLab
