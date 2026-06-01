export function detectQualityOverride() {
  try {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('quality')
    if (q === 'low' || q === 'medium' || q === 'high') return q
    const stored = localStorage.getItem('quality_tier')
    if (stored === 'low' || stored === 'medium' || stored === 'high') return stored
  } catch {
    return null
  }
  return null
}

const TIER_SETTINGS = {
  high: {
    dpr: [1, 1.25],
    composer: false,
    reflector: true,
    shadowMapSize: 1024,
    contactShadowRes: 384,
    multisampling: 0,
    multiCar: true,
  },
  medium: {
    dpr: 1,
    composer: false,
    reflector: false,
    shadowMapSize: 1024,
    contactShadowRes: 256,
    multisampling: 0,
    multiCar: false,
  },
  low: {
    dpr: 1,
    composer: false,
    reflector: false,
    shadowMapSize: 512,
    contactShadowRes: 128,
    multisampling: 0,
    multiCar: false,
  },
}

const PERF_MODE_SETTINGS = {
  dpr: 1,
  composer: false,
  reflector: false,
  shadowMapSize: 512,
  contactShadowRes: 128,
  multisampling: 0,
  multiCar: false,
}

export default function useQualityTier() {
  if (typeof window === 'undefined') {
    return {
      tier: 'medium',
      isLow: false,
      isMedium: true,
      isHigh: false,
      settings: TIER_SETTINGS.medium,
      perfMode: false,
    }
  }

  const perfMode = import.meta.env.VITE_PERF_MODE === '1'

  if (perfMode) {
    return {
      tier: 'low',
      isLow: true,
      isMedium: false,
      isHigh: false,
      settings: PERF_MODE_SETTINGS,
      perfMode: true,
    }
  }

  const override = detectQualityOverride()
  const deviceMemory = navigator.deviceMemory || 4
  const hc = navigator.hardwareConcurrency || 4

  let tier = 'medium'
  if (override) {
    tier = override
  } else if (deviceMemory < 4 || hc < 4) {
    tier = 'low'
  }

  const settings = TIER_SETTINGS[tier]

  return {
    tier,
    isLow: tier === 'low',
    isMedium: tier === 'medium',
    isHigh: tier === 'high',
    settings,
    perfMode: false,
  }
}
