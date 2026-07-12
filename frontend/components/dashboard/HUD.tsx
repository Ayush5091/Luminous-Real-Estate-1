'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, MapPin, Sparkles, HelpCircle } from 'lucide-react'
import { useStore } from '@/store/useStore'
import BottomDrawer from '@/components/dashboard/BottomDrawer'
import PropertyPanel from '@/components/dashboard/PropertyPanel'
import ScenarioLab from '@/components/dashboard/ScenarioLab'
import AtlasAssistant from '@/components/dashboard/AtlasAssistant'
import PropagationHUD from '@/components/dashboard/PropagationHUD'
import DataPipelineSidebar from '@/components/dashboard/DataPipelineSidebar'
import ZoneInsights from '@/components/dashboard/ZoneInsights'
import LocationsPanel from '@/components/dashboard/LocationsPanel'
import OnboardingCards from '@/components/dashboard/OnboardingCards'
import { CITIES } from '@/lib/cityData'

const HUD = () => {
  const {
    selectedAssetId,
    setSelectedAssetId,
    backendStatus,
    flyToLocation,
    activeRegion,
    isScenarioLabOpen,
    setIsScenarioLabOpen,
    isLocationsOpen,
    setIsLocationsOpen,
    isAssistantOpen,
    setIsAssistantOpen,
    isPipelineOpen,
    setIsOnboardingOpen,
  } = useStore()

  const statusColor =
    backendStatus === 'connected' ? 'bg-mint' : backendStatus === 'loading' ? 'bg-gold' : 'bg-coral'
  const statusLabel =
    backendStatus === 'connected' ? 'Live' : backendStatus === 'loading' ? 'Connecting' : 'Offline'

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col font-body">
      {/* ===== TOP NAVIGATION — glass, two tiers on mobile ===== */}
      <nav className="fixed top-0 inset-x-0 flex flex-col items-center gap-2 pt-3 sm:pt-5 px-3">
        {/* Tier 1: brand · cities (desktop) · status · actions */}
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-pill flex items-center justify-between sm:justify-start gap-1.5 sm:gap-3 md:gap-5 pointer-events-auto w-full max-w-[calc(100vw-24px)] sm:w-auto pl-3 pr-1.5 py-1.5 sm:pl-4 sm:pr-2 sm:py-2"
        >
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            <div className="hidden sm:flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-coral" />
              <span className="w-2 h-2 rounded-full bg-gold" />
              <span className="w-2 h-2 rounded-full bg-violet" />
            </div>
            <span className="text-[13px] sm:text-base font-bold tracking-tighter text-ink font-headline">
              LUMINOUS<span className="hidden sm:inline font-light text-ink/40 text-[10px] ml-1.5 tracking-[0.2em]">ATLAS</span>
            </span>
          </div>

          {/* City selector — desktop only; mobile gets its own tier below */}
          <div className="hidden md:flex items-center gap-1 border-l border-ink/10 pl-4">
            {CITIES.map((city) => (
              <button
                key={city.label}
                onClick={() => flyToLocation(city.lng, city.lat, 16.5, city.label)}
                className={`font-headline text-[10.5px] font-bold tracking-wide uppercase transition-all px-3 py-1.5 rounded-full whitespace-nowrap ${
                  activeRegion === city.label
                    ? 'bg-ink text-gold shadow-md shadow-ink/25'
                    : 'text-ink/55 hover:text-ink hover:bg-ink/5'
                }`}
              >
                {city.label}
              </button>
            ))}
          </div>

          {/* Status + actions */}
          <div className="flex items-center gap-1 sm:gap-2 md:border-l border-ink/10 md:pl-4 shrink-0">
            {/* Engine status — dot only on phones, labeled from sm up */}
            <div className="flex items-center gap-1.5 bg-ink/5 border border-ink/10 rounded-full p-2 sm:px-2.5 sm:py-1.5" title={statusLabel}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusColor} ${backendStatus !== 'error' ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline text-[9px] font-bold font-headline uppercase tracking-wider text-ink/70">
                {statusLabel}
              </span>
            </div>

            {/* Replay the intro cards */}
            <button
              onClick={() => setIsOnboardingOpen(true)}
              title="How this works"
              aria-label="Show the intro guide"
              className="p-1.5 rounded-full text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors"
            >
              <HelpCircle size={15} />
            </button>

            {/* Locations */}
            <button
              onClick={() => setIsLocationsOpen(!isLocationsOpen)}
              title="Locations & cost estimates"
              className={`flex items-center gap-1.5 rounded-full px-2 sm:px-3 py-1.5 transition-all border ${
                isLocationsOpen
                  ? 'bg-ink border-ink text-gold shadow-md shadow-ink/25'
                  : 'bg-white/70 border-ink/12 text-ink/70 hover:text-ink hover:bg-white'
              }`}
            >
              <MapPin size={13} />
              <span className="hidden lg:inline text-[9px] font-bold font-headline uppercase tracking-wider">Cities</span>
            </button>

            {/* Scenario Lab */}
            <button
              onClick={() => setIsScenarioLabOpen(!isScenarioLabOpen)}
              title="Scenario Lab — Monte Carlo stress test"
              className={`flex items-center gap-1.5 rounded-full px-2 sm:px-3 py-1.5 transition-all border ${
                isScenarioLabOpen
                  ? 'bg-ink border-ink text-gold shadow-md shadow-ink/25'
                  : 'bg-white/70 border-ink/12 text-ink/70 hover:text-ink hover:bg-white'
              }`}
            >
              <Zap size={13} />
              <span className="hidden lg:inline text-[9px] font-bold font-headline uppercase tracking-wider">Lab</span>
            </button>

            {/* Atlas AI — the hero action, always labeled */}
            <button
              onClick={() => setIsAssistantOpen(!isAssistantOpen)}
              title="Ask Atlas AI"
              className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3.5 py-1.5 transition-all text-white shadow-lg shrink-0 ${
                isAssistantOpen
                  ? 'bg-ink shadow-ink/30'
                  : 'ai-gradient shadow-violet/35 hover:brightness-110 hover:-translate-y-px'
              }`}
            >
              <Sparkles size={13} />
              <span className="text-[9px] sm:text-[10px] font-bold font-headline uppercase tracking-wider whitespace-nowrap">Ask AI</span>
            </button>
          </div>
        </motion.div>

        {/* Tier 2 (mobile only): scrollable city chips */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="md:hidden glass-pill pointer-events-auto w-full max-w-[calc(100vw-24px)] sm:w-auto px-2 py-1.5"
        >
          <div className="flex gap-1 overflow-x-auto no-scrollbar fade-x">
            {CITIES.map((city) => (
              <button
                key={city.label}
                onClick={() => flyToLocation(city.lng, city.lat, 16.5, city.label)}
                className={`font-headline text-[10px] font-bold tracking-wide uppercase transition-all px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 ${
                  activeRegion === city.label
                    ? 'bg-ink text-gold shadow-md shadow-ink/25'
                    : 'text-ink/55 hover:text-ink'
                }`}
              >
                {city.label}
              </button>
            ))}
          </div>
        </motion.div>
      </nav>

      {/* ===== BIG ATLAS HEADLINE ===== */}
      {!isPipelineOpen && (
        <motion.header
          key={activeRegion}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:block fixed left-8 top-28 select-none"
        >
          <p className="font-headline text-[11px] font-bold tracking-[0.35em] uppercase text-ink/50 mb-1">
            Luminous Atlas · Live Bubble Risk
          </p>
          <h1
            className="font-display uppercase leading-[0.95] text-ink text-[clamp(2.6rem,6vw,5.2rem)]"
            style={{ textShadow: '0 3px 0 rgba(255,255,255,0.7)' }}
          >
            {activeRegion}
          </h1>
          <p className="font-headline text-[11px] font-bold tracking-[0.2em] uppercase text-ink/40 mt-2">
            drag to orbit · scroll to zoom · tap a pill for details
          </p>
        </motion.header>
      )}

      {/* ===== MAP LEGEND ===== */}
      <div className="hidden md:flex fixed left-8 bottom-36 flex-col gap-2.5 glass-panel rounded-3xl px-4 py-3.5 pointer-events-auto">
        <span className="font-headline text-[9px] font-bold tracking-[0.2em] uppercase text-ink/50">
          Building height
        </span>
        <div className="w-44 h-2.5 rounded-full border border-ink/15"
          style={{ background: 'linear-gradient(90deg, #ffd97a, #ffb35c, #f2699c, #8f6bf5)' }}
        />
        <div className="flex justify-between font-headline text-[8px] font-bold uppercase tracking-wider text-ink/40">
          <span>Low-rise</span>
          <span>Tower</span>
        </div>
        <div className="flex items-center gap-3 pt-1 border-t border-ink/10">
          {([['#2fbf71', 'Safe'], ['#ffab2e', 'Watch'], ['#ff5050', 'At risk']] as const).map(([c, label]) => (
            <span key={label} className="flex items-center gap-1.5 font-headline text-[8px] font-bold uppercase tracking-wider text-ink/60">
              <span className="w-2 h-2 rounded-full border border-ink/25" style={{ background: c }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ===== PANELS ===== */}
      <PropertyPanel isOpen={!!selectedAssetId} onClose={() => setSelectedAssetId(null)} />
      <ScenarioLab />
      <AtlasAssistant />
      <LocationsPanel />
      <PropagationHUD />
      <DataPipelineSidebar />
      <ZoneInsights />
      <BottomDrawer />

      {/* FIRST-RUN SPLASH CARDS (also via the ? button) */}
      <OnboardingCards />
    </div>
  )
}

export default HUD
