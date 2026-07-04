import { ZoneData } from '@/store/useStore'

export const DEMO_ZONES: ZoneData[] = [
  {
    id: 'mumbai-bkc',
    name: 'BKC Financial District',
    region: 'Mumbai',
    risk_score: 68,
    yield_pct: 4.2,
    appreciation_pct: 8.5,
    occupancy_pct: 92,
    recommendation: 'HOLD',
    details: 'Institutional demand remains high, but entry yields are compressed.',
    narrative: 'The Bandra Kurla Complex is currently seeing extreme valuation pressure. While institutional occupancy is near 92%, the P/I ratio is at a 10-year high. Recommend holding existing positions but deferring new opportunistic buys.',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8610, 19.0680],
        [72.8720, 19.0680],
        [72.8720, 19.0600],
        [72.8610, 19.0600],
        [72.8610, 19.0680]
      ]]
    }
  },
  {
    id: 'bangalore-vittal-mallya',
    name: 'Vittal Mallya Elite',
    region: 'Bangalore',
    risk_score: 45,
    yield_pct: 3.1,
    appreciation_pct: 6.8,
    occupancy_pct: 98,
    recommendation: 'HOLD',
    details: 'Ultra-premium CBD pocket near JW Marriott and UB City.',
    narrative: 'The Kasturba Road / Vittal Mallya corridor represents Bangalore\'s most resilient asset class. While rental yields are low (3.1%), the vacancy rate is virtually zero. JW Marriott vicinity remains an institutional gold standard for capital preservation.',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [77.5900, 12.9730],
        [77.5960, 12.9730],
        [77.5960, 12.9690],
        [77.5900, 12.9690],
        [77.5900, 12.9730]
      ]]
    }
  },
  {
    id: 'bangalore-whitefield',
    name: 'Whitefield IT Corridor',
    region: 'Bangalore',
    risk_score: 74,
    yield_pct: 5.8,
    appreciation_pct: 12.0,
    occupancy_pct: 88,
    recommendation: 'SELL',
    details: 'Overlapping supply pipeline and infrastructural stress.',
    narrative: 'Whitefield is showing late-cycle symptoms. Capital values outpaced rental growth by 35% in 24 months. With 12M sqft of new supply, a correction is likely.',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [77.7400, 12.9800],
        [77.7600, 12.9800],
        [77.7600, 12.9600],
        [77.7400, 12.9600],
        [77.7400, 12.9800]
      ]]
    }
  },
  {
    id: 'chennai-omr',
    name: 'OMR Tech Belt',
    region: 'Chennai',
    risk_score: 52,
    yield_pct: 5.1,
    appreciation_pct: 9.2,
    occupancy_pct: 85,
    recommendation: 'BUY',
    details: 'IT corridor spanning from Tidel Park to Sholinganallur.',
    narrative: 'The Old Mahabalipuram Road (OMR) continues to be Chennai\'s growth engine. Consistent absorption by IT/ITES firms keeps yields healthy. Current valuations are attractively positioned for mid-to-high entry.',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [80.2400, 12.9650],
        [80.2550, 12.9650],
        [80.2550, 12.9450],
        [80.2400, 12.9450],
        [80.2400, 12.9650]
      ]]
    }
  },
  {
    id: 'chennai-anna-nagar',
    name: 'Anna Nagar West',
    region: 'Chennai',
    risk_score: 30,
    yield_pct: 3.8,
    appreciation_pct: 7.5,
    occupancy_pct: 95,
    recommendation: 'BUY',
    details: 'Premium residential hub with high owner-occupancy.',
    narrative: 'Anna Nagar remains a safe harbor for residential investors in Chennai. Mature infrastructure and limited new land supply ensure steady capital appreciation and low downside risk.',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [80.2050, 13.0950],
        [80.2250, 13.0950],
        [80.2250, 13.0750],
        [80.2050, 13.0750],
        [80.2050, 13.0950]
      ]]
    }
  },
  {
    id: 'ahmedabad-gift',
    name: 'GIFT City Smart Zone',
    region: 'Ahmedabad',
    risk_score: 18,
    yield_pct: 7.2,
    appreciation_pct: 15.4,
    occupancy_pct: 76,
    recommendation: 'BUY',
    details: 'Early stage high-growth zone with SEZ tax benefits.',
    narrative: 'GIFT City represents the most stable and high-potential zone in the engine\'s current index. Tax incentives and regulatory easing are attracting global capital. Valuations are still 40% below historical peak potential.',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.6800, 23.1650],
        [72.6950, 23.1650],
        [72.6950, 23.1550],
        [72.6800, 23.1550],
        [72.6800, 23.1650]
      ]]
    }
  }
]

export const findZoneByCoordinates = (lng: number, lat: number, region: string): ZoneData | null => {
  // Simple check if coordinate is near a demo zone center
  const matched = DEMO_ZONES.find(zone => {
    if (zone.region.toLowerCase() !== region.toLowerCase()) return false
    const coords = zone.boundary.coordinates[0]
    const minLng = Math.min(...coords.map((c: any) => c[0]))
    const maxLng = Math.max(...coords.map((c: any) => c[0]))
    const minLat = Math.min(...coords.map((c: any) => c[1]))
    const maxLat = Math.max(...coords.map((c: any) => c[1]))
    
    // Add a small buffer for clicking
    const buffer = 0.005
    return lng >= minLng - buffer && lng <= maxLng + buffer && 
           lat >= minLat - buffer && lat <= maxLat + buffer
  })
  
  return matched || null
}
