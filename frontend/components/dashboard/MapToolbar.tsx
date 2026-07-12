'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Globe2, Scan, Sunset, Orbit } from 'lucide-react'
import { useStore } from '@/store/useStore'

/**
 * Floating glass controls for the map itself:
 * overview flight, risk x-ray recolor, dusk lighting, idle orbit.
 */
const MapToolbar = () => {
  const {
    flyToLocation,
    mapMode,
    setMapMode,
    lighting,
    setLighting,
    orbitEnabled,
    setOrbitEnabled,
  } = useStore()

  const buttons = [
    {
      key: 'overview',
      icon: <Globe2 size={16} />,
      label: 'India overview',
      active: false,
      onClick: () => flyToLocation(79.8, 22.2, 4.0, 'India'),
    },
    {
      key: 'xray',
      icon: <Scan size={16} />,
      label: mapMode === 'xray' ? 'Back to candy colors' : 'Risk x-ray — color buildings by bubble risk',
      active: mapMode === 'xray',
      onClick: () => setMapMode(mapMode === 'xray' ? 'candy' : 'xray'),
    },
    {
      key: 'dusk',
      icon: <Sunset size={16} />,
      label: lighting === 'dusk' ? 'Back to daylight' : 'Dusk lighting',
      active: lighting === 'dusk',
      onClick: () => setLighting(lighting === 'dusk' ? 'day' : 'dusk'),
    },
    {
      key: 'orbit',
      icon: <Orbit size={16} />,
      label: orbitEnabled ? 'Idle camera orbit: on' : 'Idle camera orbit: off',
      active: orbitEnabled,
      onClick: () => setOrbitEnabled(!orbitEnabled),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="fixed right-3 sm:right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 pointer-events-auto"
    >
      {buttons.map((b) => (
        <button
          key={b.key}
          onClick={b.onClick}
          title={b.label}
          aria-label={b.label}
          aria-pressed={b.active}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            b.active
              ? 'bg-ink text-gold shadow-lg shadow-ink/30 border border-ink'
              : 'glass-pill !rounded-full text-ink/60 hover:text-ink hover:-translate-x-0.5'
          }`}
        >
          {b.icon}
        </button>
      ))}
    </motion.div>
  )
}

export default MapToolbar
