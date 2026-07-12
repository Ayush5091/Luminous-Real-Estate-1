import { create } from 'zustand'
import type { MacroSnapshot, BubbleFlag, ValuationRecord } from '@/lib/apiClient'

export interface ValuationData {
  id: string
  price_index: number
  risk_score: number
  volatility: number
  pi_ratio: number
}

export interface ZoneData {
  id: string
  name: string
  region: string
  risk_score: number
  yield_pct: number
  appreciation_pct: number
  occupancy_pct: number
  recommendation: 'BUY' | 'HOLD' | 'SELL'
  details: string
  narrative: string
  boundary?: any // GeoJSON Polygon
}

export interface ScenarioResult {
  p5: number
  p50: number
  p95: number
}

type VoiceStatus = 'idle' | 'listening' | 'speaking'
type BackendStatus = 'connected' | 'disconnected' | 'loading' | 'error'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** Optional Monte-Carlo distribution attached to an assistant reply */
  mc?: {
    p5: number
    p50: number
    p95: number
    prob_below_current: number
  } | null
}

interface DashboardState {
  // Pipeline 1: Live Data Loop
  valuationMap: Record<string, ValuationData>
  setValuation: (id: string, data: Partial<ValuationData>) => void
  selectedAssetId: string | null
  setSelectedAssetId: (id: string | null) => void

  // Map navigation
  activeRegion: string
  setActiveRegion: (region: string) => void
  mapTarget: { lng: number; lat: number; zoom?: number } | null
  flyToLocation: (lng: number, lat: number, zoom?: number, region?: string) => void
  
  // Backend health
  backendStatus: BackendStatus
  setBackendStatus: (status: BackendStatus) => void

  // Macro data from backend
  macroSnapshot: MacroSnapshot | null
  setMacroSnapshot: (snapshot: MacroSnapshot | null) => void

  // Bubble flags from backend
  bubbleFlags: BubbleFlag[]
  setBubbleFlags: (flags: BubbleFlag[]) => void

  // Valuations from backend
  valuations: ValuationRecord[]
  setValuations: (vals: ValuationRecord[]) => void

  // Pipeline 2: Scenario Lab
  scenarioResult: ScenarioResult | null
  setScenarioResult: (result: ScenarioResult | null) => void
  isScenarioLabOpen: boolean
  setIsScenarioLabOpen: (open: boolean) => void
  
  // New: Propagation Trace
  propagationSteps: string[]
  setPropagationSteps: (steps: string[]) => void
  addPropagationStep: (step: string) => void
  isTracing: boolean
  setIsTracing: (tracing: boolean) => void

  // Data Ingestion Pipeline Sidebar
  isPipelineOpen: boolean
  setIsPipelineOpen: (open: boolean) => void

  // Locations & Estimates panel
  isLocationsOpen: boolean
  setIsLocationsOpen: (open: boolean) => void

  // First-run onboarding splash cards
  isOnboardingOpen: boolean
  setIsOnboardingOpen: (open: boolean) => void

  // Atlas AI assistant (natural-language scenario window)
  isAssistantOpen: boolean
  setIsAssistantOpen: (open: boolean) => void
  assistantMessages: ChatMessage[]
  addAssistantMessage: (msg: ChatMessage) => void
  clearAssistantMessages: () => void

  // New: Zone Selection
  selectedZone: ZoneData | null
  setSelectedZone: (zone: ZoneData | null) => void

  // Closes every right-hand panel (used to keep them mutually exclusive)
  closeRightPanels: () => void
}

export const useStore = create<DashboardState>((set) => ({
  // Pipeline 1
  valuationMap: {},
  selectedAssetId: null,
  // Opening the property panel closes the other right-hand panels
  setSelectedAssetId: (id) => set(id
    ? { selectedAssetId: id, selectedZone: null, isScenarioLabOpen: false, isLocationsOpen: false, isAssistantOpen: false }
    : { selectedAssetId: null }),

  // Map navigation
  activeRegion: 'Mumbai',
  setActiveRegion: (region) => set({ activeRegion: region }),
  mapTarget: null,
  flyToLocation: (lng, lat, zoom, region) => set({ mapTarget: { lng, lat, zoom }, ...(region ? { activeRegion: region } : {}) }),
  setValuation: (id, data) => set((state) => ({
    valuationMap: {
      ...state.valuationMap,
      [id]: {
        ...(state.valuationMap[id] || { id, price_index: 0, risk_score: 0, volatility: 0, pi_ratio: 0 }),
        ...data
      }
    }
  })),

  // Backend health
  backendStatus: 'loading',
  setBackendStatus: (status) => set({ backendStatus: status }),

  // Macro
  macroSnapshot: null,
  setMacroSnapshot: (snapshot) => set({ macroSnapshot: snapshot }),

  // Bubble flags
  bubbleFlags: [],
  setBubbleFlags: (flags) => set({ bubbleFlags: flags }),

  // Valuations
  valuations: [],
  setValuations: (vals) => set({ valuations: vals }),

  // Pipeline 2: Scenario
  scenarioResult: null,
  setScenarioResult: (result) => set({ scenarioResult: result }),
  isScenarioLabOpen: false,
  setIsScenarioLabOpen: (open) => set(open
    ? { isScenarioLabOpen: true, selectedAssetId: null, selectedZone: null, isLocationsOpen: false, isAssistantOpen: false }
    : { isScenarioLabOpen: false }),

  // Propagation Trace
  propagationSteps: [],
  setPropagationSteps: (steps) => set({ propagationSteps: steps }),
  addPropagationStep: (step) => set((state) => ({ propagationSteps: [...state.propagationSteps, step] })),
  isTracing: false,
  setIsTracing: (tracing) => set({ isTracing: tracing }),

  // Data Ingestion Pipeline Sidebar
  isPipelineOpen: false, // Collapsed by default so the map stays the hero; opens from the left-edge tab
  setIsPipelineOpen: (open) => set({ isPipelineOpen: open }),

  // Locations & Estimates panel
  isLocationsOpen: false,
  setIsLocationsOpen: (open) => set(open
    ? { isLocationsOpen: true, selectedAssetId: null, selectedZone: null, isScenarioLabOpen: false, isAssistantOpen: false }
    : { isLocationsOpen: false }),

  // Onboarding — visibility is driven by OnboardingCards (first visit via
  // localStorage) and the "?" help button in the nav.
  isOnboardingOpen: false,
  setIsOnboardingOpen: (open) => set({ isOnboardingOpen: open }),

  // Atlas AI assistant — opening it closes the other right-hand panels;
  // chat history lives in the store so it survives close/reopen.
  isAssistantOpen: false,
  setIsAssistantOpen: (open) => set(open
    ? { isAssistantOpen: true, selectedAssetId: null, selectedZone: null, isScenarioLabOpen: false, isLocationsOpen: false }
    : { isAssistantOpen: false }),
  assistantMessages: [],
  addAssistantMessage: (msg) => set((state) => ({ assistantMessages: [...state.assistantMessages, msg] })),
  clearAssistantMessages: () => set({ assistantMessages: [] }),

  // Zone Selection — opening a zone closes the other right-hand panels
  selectedZone: null,
  setSelectedZone: (zone) => set(zone
    ? { selectedZone: zone, selectedAssetId: null, isScenarioLabOpen: false, isLocationsOpen: false, isAssistantOpen: false }
    : { selectedZone: null }),

  closeRightPanels: () => set({
    selectedAssetId: null,
    selectedZone: null,
    isScenarioLabOpen: false,
    isLocationsOpen: false,
    isAssistantOpen: false,
  }),
}))
