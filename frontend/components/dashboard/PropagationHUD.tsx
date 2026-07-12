'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { Terminal, Activity, ChevronRight, Binary } from 'lucide-react'

const PropagationHUD = () => {
  const { propagationSteps, isTracing, setIsTracing } = useStore()
  const [visibleSteps, setVisibleSteps] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isTracing && propagationSteps.length > 0) {
      // Logic for sequential reveal
      let i = 0
      setVisibleSteps([])
      const interval = setInterval(() => {
        if (i < propagationSteps.length) {
          setVisibleSteps(prev => [...prev, propagationSteps[i]])
          i++
        } else {
          clearInterval(interval)
          // Hide after 8 seconds of completion
          setTimeout(() => setIsTracing(false), 8000)
        }
      }, 800)
      return () => clearInterval(interval)
    }
  }, [isTracing, propagationSteps, setIsTracing])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [visibleSteps])

  return (
    <AnimatePresence>
      {isTracing && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="glass-dark fixed z-50 flex flex-col pointer-events-none max-h-[400px] rounded-3xl overflow-hidden
                     left-3 top-32 w-[min(320px,90vw)]
                     sm:left-8 sm:top-1/4 sm:w-80"
        >
          {/* HUD Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Terminal size={14} className="text-gold animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">Logic Propagation</span>
                <span className="text-[8px] text-white/40 font-bold uppercase tracking-tighter">MC-ENGINE TRACE // LIVE</span>
              </div>
            </div>
            <Activity size={14} className="text-gold/40" />
          </div>

          {/* Terminal Body */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto bg-black/25 p-4 space-y-3 scrollbar-hide font-mono min-h-0"
          >
            {visibleSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-2"
              >
                <div className="mt-1">
                  <ChevronRight size={10} className="text-gold" />
                </div>
                <div className="flex flex-col">
                  <p className="text-[11px] text-[#f5f1e8]/90 leading-relaxed font-bold lowercase tracking-wide">
                    {step}
                  </p>
                  <div className="h-px w-full bg-white/10 mt-1" />
                </div>
              </motion.div>
            ))}

            {visibleSteps.length < propagationSteps.length && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                <Binary size={10} className="text-gold animate-spin" />
                <span className="text-[9px] text-gold/60 font-black uppercase tracking-widest">Processing Determinants...</span>
              </div>
            )}
          </div>

          {/* HUD Footer - Signal bars */}
          <div className="p-2.5 border-t border-white/10 flex justify-end items-end gap-1 shrink-0">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="w-1 bg-gold/40 rounded-full"
                style={{ height: `${i * 2 + 2}px`, opacity: 0.2 + (i * 0.15)}}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PropagationHUD
