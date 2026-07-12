'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, Loader2, TrendingUp, ShieldCheck, ShieldAlert, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { ChatMessage } from '@/store/useStore'
import { api } from '@/lib/apiClient'
import type { QueryResult } from '@/lib/apiClient'

const QUICK_PROMPTS = [
  'What if the repo rate rises 250 bps?',
  'Impact of a 5% inflation spike?',
  'IT slowdown drags GDP down 3% — what happens?',
  'Is this city overvalued right now?',
]

const fmtInr = (val: number) => {
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(2)} Cr`
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(2)} L`
  return `₹${val.toLocaleString('en-IN')}`
}

const AtlasAssistant = () => {
  const {
    isAssistantOpen,
    setIsAssistantOpen,
    activeRegion,
    assistantMessages,
    addAssistantMessage,
    clearAssistantMessages,
    setPropagationSteps,
    setIsTracing,
    backendStatus,
  } = useStore()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Keep the newest message in view
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [assistantMessages, loading, isAssistantOpen])

  useEffect(() => {
    if (isAssistantOpen) inputRef.current?.focus()
  }, [isAssistantOpen])

  const ask = async (raw?: string) => {
    const question = (raw ?? input).trim()
    if (!question || loading) return

    setInput('')
    setLoading(true)
    addAssistantMessage({ id: `u-${Date.now()}`, role: 'user', content: question })

    try {
      const data = await api<QueryResult>('/api/query', {
        method: 'POST',
        body: JSON.stringify({ question, region: activeRegion }),
      })

      const mc = data.mc_results ?? null
      addAssistantMessage({
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'The engine returned no answer for that one — try rephrasing.',
        mc: mc
          ? {
              p5: mc.p5,
              p50: mc.p50,
              p95: mc.p95,
              prob_below_current: mc.prob_below_current,
            }
          : null,
      })

      // If the engine ran a simulation, surface its reasoning trace on the map HUD
      if (mc?.propagation_trace?.length) {
        setPropagationSteps(mc.propagation_trace)
        setIsTracing(true)
      }
    } catch (err) {
      console.error('Atlas AI query failed:', err)
      addAssistantMessage({
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: 'I couldn’t reach the engine. Natural-language scenarios need the live backend — check the connection dot in the top bar and try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const empty = assistantMessages.length === 0

  return (
    <AnimatePresence>
      {isAssistantOpen && (
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 28, scale: 0.98 }}
          transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          className="fixed z-[70] pointer-events-auto flex flex-col overflow-hidden glass-panel
                     inset-x-3 bottom-3 top-auto h-[min(72vh,620px)] rounded-[26px]
                     sm:inset-x-auto sm:right-6 sm:top-24 sm:bottom-8 sm:h-auto sm:w-[420px] sm:rounded-[28px]"
        >
          {/* HEADER */}
          <div className="glass-head px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="ai-gradient p-2.5 rounded-2xl text-white shadow-lg shadow-violet/30">
                <Sparkles size={17} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-ink font-headline tracking-tight leading-none">Atlas AI</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'connected' ? 'bg-mint animate-pulse' : 'bg-coral'}`} />
                  <span className="text-[10px] font-semibold text-ink/50 tracking-wide">
                    {backendStatus === 'connected' ? `Analysing ${activeRegion}` : 'Engine offline'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!empty && (
                <button
                  onClick={clearAssistantMessages}
                  title="Clear conversation"
                  className="p-2 rounded-full text-ink/35 hover:text-ink hover:bg-ink/5 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setIsAssistantOpen(false)}
                aria-label="Close Atlas AI"
                className="p-2 rounded-full text-ink/45 hover:text-ink hover:bg-ink/5 transition-colors"
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-3 min-h-0">
            {empty && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 gap-4">
                <div className="ai-gradient w-12 h-12 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-violet/25">
                  <Sparkles size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink font-headline">Ask anything about the market</p>
                  <p className="text-xs text-ink/50 leading-relaxed mt-1.5 max-w-[280px]">
                    Plain-English &ldquo;what if&rdquo; questions run real 10k-iteration Monte&nbsp;Carlo
                    simulations on <span className="font-bold text-ink/70">{activeRegion}</span>.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-[300px]">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      onClick={() => ask(q)}
                      className="glass-tile text-left px-4 py-2.5 text-[11px] font-semibold text-ink/70 hover:text-ink hover:bg-white/80 transition-all hover:-translate-y-px"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {assistantMessages.map((msg: ChatMessage) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 text-[12.5px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-ink text-white/95 rounded-2xl rounded-br-md font-medium shadow-md shadow-ink/20'
                      : 'glass-tile text-ink/85 rounded-2xl rounded-bl-md'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1.5 text-violet">
                      <Sparkles size={11} />
                      <span className="text-[9px] font-black uppercase tracking-[0.15em]">Atlas AI</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Attached simulation summary */}
                  {msg.mc && (
                    <div className="mt-3 pt-3 border-t border-ink/10 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white/70 border border-ink/8 px-3 py-2">
                        <div className="flex items-center gap-1 text-ink/45">
                          <TrendingUp size={10} />
                          <span className="text-[8px] font-bold uppercase tracking-widest">Base case</span>
                        </div>
                        <p className="text-[13px] font-black text-ink mt-0.5">{fmtInr(msg.mc.p50)}</p>
                      </div>
                      <div className={`rounded-xl px-3 py-2 border ${
                        msg.mc.prob_below_current > 0.4
                          ? 'bg-coral/10 border-coral/25'
                          : 'bg-mint/10 border-mint/25'
                      }`}>
                        <div className={`flex items-center gap-1 ${msg.mc.prob_below_current > 0.4 ? 'text-coral' : 'text-mint'}`}>
                          {msg.mc.prob_below_current > 0.4 ? <ShieldAlert size={10} /> : <ShieldCheck size={10} />}
                          <span className="text-[8px] font-bold uppercase tracking-widest">Safety</span>
                        </div>
                        <p className={`text-[13px] font-black mt-0.5 ${msg.mc.prob_below_current > 0.4 ? 'text-coral' : 'text-mint'}`}>
                          {((1 - msg.mc.prob_below_current) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <p className="col-span-2 text-[9px] text-ink/40 font-semibold">
                        Range {fmtInr(msg.mc.p5)} – {fmtInr(msg.mc.p95)} · 10k Monte Carlo runs
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="glass-tile rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2.5">
                  <Loader2 size={13} className="animate-spin text-violet" />
                  <span className="text-[11px] font-semibold text-ink/55">Running simulations…</span>
                </div>
              </div>
            )}
          </div>

          {/* INPUT */}
          <div className="px-4 pb-4 pt-2 shrink-0">
            {!empty && (
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar fade-x pb-2">
                {QUICK_PROMPTS.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    className="shrink-0 text-[10px] font-semibold text-ink/60 hover:text-ink bg-white/60 hover:bg-white border border-ink/10 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    ask()
                  }
                }}
                rows={2}
                placeholder={`Ask a "what if" about ${activeRegion}…`}
                className="w-full resize-none rounded-2xl border border-ink/12 bg-white/85 px-4 py-3 pr-13 text-[12.5px] text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet/30 leading-relaxed shadow-sm"
              />
              <button
                onClick={() => ask()}
                disabled={loading || !input.trim()}
                aria-label="Send question"
                className="absolute bottom-3 right-3 ai-gradient p-2.5 rounded-xl text-white shadow-lg shadow-violet/30 disabled:opacity-35 disabled:shadow-none hover:brightness-110 active:scale-95 transition-all"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AtlasAssistant
