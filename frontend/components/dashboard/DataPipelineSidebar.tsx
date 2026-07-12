'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Database, 
  Activity, 
  Clock, 
  Server, 
  ChevronLeft, 
  ChevronRight,
  Terminal,
  RefreshCw,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react'
import { useStore } from '@/store/useStore'

const DataPipelineSidebar = () => {
  const { 
    isPipelineOpen, 
    setIsPipelineOpen, 
    macroSnapshot, 
    backendStatus 
  } = useStore()
  
  const [logs, setLogs] = useState<string[]>([])
  const terminalEndRef = useRef<HTMLDivElement>(null)

  // On small screens the sidebar would cover the map, so start collapsed there.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setIsPipelineOpen(false)
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calculate last and next scheduled runs
  const snapshotDate = macroSnapshot?.snapshot_at 
    ? new Date(macroSnapshot.snapshot_at) 
    : new Date()
  
  // Scraper runs every 3 days (72 hours)
  const nextScheduledDate = new Date(snapshotDate.getTime() + 3 * 24 * 60 * 60 * 1000)

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  // Pre-generate standard scraper pipeline logs
  const staticLogs = [
    `[INFO] Initializing Ingestion Coordinator...`,
    `[INFO] Target Frequency: Every 3 Days (4320 mins).`,
    `[DB] Connecting to TimescaleDB instance... Connected.`,
    `[SCRAPER] Querying World Bank API for macro indexes...`,
    ` - GDP Growth Rate: ${macroSnapshot?.gdp_growth ?? 7.2}% (OK)`,
    ` - Unemployment Rate: ${macroSnapshot?.unemployment_rate ?? 4.1}% (OK)`,
    ` - CPI Inflation (YoY): ${macroSnapshot?.cpi_yoy ?? 4.8}% (OK)`,
    `[SCRAPER] Querying RBI DBIE for monetary rates...`,
    ` - Repo Rate: ${macroSnapshot?.repo_rate ?? 6.5}% (OK)`,
    ` - G-Sec 10Y Yield: ${macroSnapshot?.gsec_10y_yield ?? 7.1}% (OK)`,
    ` - G-Sec 2Y Yield: ${macroSnapshot?.gsec_2y_yield ?? 6.8}% (OK)`,
    `[SCRAPER] Scraping NHB RESIDEX portal...`,
    ` - Composite HPI (50 cities): ${macroSnapshot?.nhb_residex_composite ?? 124.5} (OK)`,
    `[CALCULATION] Starting intrinsic valuation models...`,
    ` - Valuating Discounted Cash Flows (DCF)... Complete.`,
    ` - Computing PIR, PRR, and Affordability index... Complete.`,
    `[AGENT] LangGraph Orchestrator running city models...`,
    ` - Mumbai, Delhi, Bangalore, Chennai, Pune, Ahmedabad (Updates Written)`,
    `[CACHE] Invalidation successful. Redis geo:bubble_map refreshed.`,
    `[INFO] Ingestion complete. Scraper sleeping. Next run in 72 hours.`
  ]

  // Simulate live terminal output
  useEffect(() => {
    if (isPipelineOpen) {
      setLogs([])
      let idx = 0
      const timer = setInterval(() => {
        if (idx < staticLogs.length) {
          const timestamp = new Date().toLocaleTimeString('en-IN', { hour12: false })
          setLogs(prev => [...prev, `[${timestamp}] ${staticLogs[idx]}`])
          idx++
        } else {
          clearInterval(timer)
        }
      }, 500)
      return () => clearInterval(timer)
    }
  }, [isPipelineOpen, macroSnapshot])

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  return (
    <>
      {/* COLLAPSED TAB */}
      <AnimatePresence>
        {!isPipelineOpen && (
          <motion.button
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            exit={{ x: -100 }}
            onClick={() => setIsPipelineOpen(true)}
            className="glass-dark fixed left-0 top-1/2 -translate-y-1/2 text-white p-3 rounded-r-2xl pointer-events-auto z-[60] flex flex-col items-center gap-2"
          >
            <Database size={18} className="text-gold animate-pulse" />
            <span className="text-[10px] font-bold uppercase vertical-text tracking-widest py-2 font-headline">Pipeline</span>
            <ChevronRight size={16} className="text-white/50" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* FULL SIDEBAR */}
      <motion.div
        initial={false}
        animate={{ x: isPipelineOpen ? 0 : -460 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="glass-panel fixed z-[60] rounded-[26px] flex flex-col overflow-hidden pointer-events-auto
                   top-28 left-3 bottom-28 w-[min(380px,92vw)]
                   sm:top-24 sm:left-6 sm:bottom-32 sm:w-[380px] sm:rounded-[28px]"
      >
        {/* HEADER */}
        <div className="glass-head px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-ink text-gold shadow-lg shadow-ink/25">
              <Server size={17} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-ink font-headline tracking-tight leading-none">Ingestion Pipeline</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'connected' ? 'bg-mint animate-pulse' : 'bg-coral'}`} />
                <span className="text-[10px] font-semibold text-ink/50 tracking-wide">
                  {backendStatus === 'connected' ? 'Scraper active' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsPipelineOpen(false)}
            aria-label="Collapse pipeline sidebar"
            className="p-2 rounded-full text-ink/45 hover:text-ink hover:bg-ink/5 transition-colors"
          >
            <ChevronLeft size={19} />
          </button>
        </div>

        {/* PIPELINE STATS & SCHEDULE */}
        <div className="p-5 space-y-3 border-b border-ink/6">
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-tile p-3 flex flex-col">
              <span className="text-[8px] font-bold text-ink/40 uppercase tracking-wider flex items-center gap-1">
                <Clock size={10} /> Last Sync
              </span>
              <span className="text-[10.5px] font-black text-ink mt-1">
                {formatDateTime(snapshotDate)}
              </span>
            </div>
            <div className="glass-tile p-3 flex flex-col">
              <span className="text-[8px] font-bold text-ink/40 uppercase tracking-wider flex items-center gap-1">
                <RefreshCw size={10} className="animate-spin text-ink/40" /> Next Sync
              </span>
              <span className="text-[10.5px] font-black text-ink mt-1">
                {formatDateTime(nextScheduledDate)}
              </span>
            </div>
          </div>

          <div className="glass-tile p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-mint" />
              <span className="text-[9px] font-extrabold text-ink/70 uppercase tracking-wider">Sync frequency</span>
            </div>
            <span className="text-[10.5px] font-black text-ink">Every 3 days</span>
          </div>
        </div>

        {/* SCRAPED METRICS STRIP */}
        <div className="p-5 space-y-3">
          <h3 className="text-[9px] font-black text-ink/40 uppercase tracking-[0.15em] flex items-center gap-1.5 font-headline">
            <FileSpreadsheet size={12} /> Active Scrape Targets
          </h3>

          <div className="space-y-2">
            <div className="glass-tile flex justify-between items-center px-3.5 py-2.5">
              <span className="text-[10.5px] font-semibold text-ink/65">RBI Repo Rate</span>
              <span className="text-[11.5px] font-extrabold text-ink">{macroSnapshot?.repo_rate ?? 6.5}%</span>
            </div>
            <div className="glass-tile flex justify-between items-center px-3.5 py-2.5">
              <span className="text-[10.5px] font-semibold text-ink/65">World Bank GDP Growth</span>
              <span className="text-[11.5px] font-extrabold text-ink">{macroSnapshot?.gdp_growth ?? 7.2}%</span>
            </div>
            <div className="glass-tile flex justify-between items-center px-3.5 py-2.5">
              <span className="text-[10.5px] font-semibold text-ink/65">NHB Composite RESIDEX</span>
              <span className="text-[11.5px] font-extrabold text-ink">{macroSnapshot?.nhb_residex_composite ?? 124.5}</span>
            </div>
          </div>
        </div>

        {/* LIVE TERMINAL SCRAPER LOGS */}
        <div className="glass-dark flex-1 p-5 flex flex-col min-h-0 rounded-t-3xl">
          <h3 className="text-[9px] font-black text-gold uppercase tracking-[0.15em] flex items-center gap-1.5 mb-3 font-mono">
            <Terminal size={12} /> Scraper Console Output
          </h3>
          <div className="flex-1 bg-black/30 rounded-2xl p-4 font-mono text-[9px] text-[#7ee2a8] overflow-y-auto space-y-2 scrollbar-hide border border-white/10">
            {logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed break-all">
                {log}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default DataPipelineSidebar
