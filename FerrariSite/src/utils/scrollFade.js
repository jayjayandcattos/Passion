export const SECTION_BLEED = 0.1

export function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/** Symmetric fade-in at section start and fade-out at section end. */
export function sectionOpacity(scroll, start, end, bleed = SECTION_BLEED) {
  const fadeIn = smoothstep(start - bleed, start + bleed, scroll)
  const fadeOut = 1 - smoothstep(end - bleed, end + bleed, scroll)
  return fadeIn * fadeOut
}

export const OPACITY_MOUNT_THRESHOLD = 0.02
export const OPACITY_STABLE_EPSILON = 0.01
