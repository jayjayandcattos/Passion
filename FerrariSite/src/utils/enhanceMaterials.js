import * as THREE from 'three'

export function isGlassMaterial(mat) {
  const name = (mat.name || '').toLowerCase()
  return name.includes('glass') || name.includes('window')
}

export function isChromeMaterial(mat) {
  const name = (mat.name || '').toLowerCase()
  return name.includes('chrome') || (name.includes('metal') && !name.includes('paint'))
}

export function isTireMaterial(mat) {
  const name = (mat.name || '').toLowerCase()
  return name.includes('tire') || name.includes('rubber')
}

export function isPaintMaterial(mat) {
  if (isGlassMaterial(mat) || isChromeMaterial(mat) || isTireMaterial(mat)) return false
  const name = (mat.name || '').toLowerCase()
  if (name.includes('light') || name.includes('lamp') || name.includes('interior')) return false
  if (
    name.includes('paint') ||
    name.includes('body') ||
    name.includes('car') ||
    name.includes('exterior')
  ) {
    return true
  }
  return true
}

function applyColorTint(mat, colorTint) {
  if (!colorTint) return
  if (!mat.color) return
  const tint = new THREE.Color(colorTint)
  mat.color.lerp(tint, 0.35)
}

export function enhanceMaterials(object, options = {}) {
  const tier = options.tier || 'high'
  const colorTint = options.colorTint ?? null

  object.traverse((child) => {
    if (!child.isMesh) return

    child.castShadow = true
    child.receiveShadow = true

    const materials = Array.isArray(child.material) ? child.material : [child.material]

    for (const mat of materials) {
      if (!mat) continue

      if (mat.map) mat.map.anisotropy = 8

      if (isGlassMaterial(mat)) {
        mat.transparent = true
        mat.opacity = 0.35
        mat.metalness = 0.9
        mat.roughness = 0.05
        mat.envMapIntensity = 1.4
      } else if (isChromeMaterial(mat)) {
        mat.metalness = 1
        mat.roughness = 0.12
        mat.envMapIntensity = 1.8
      } else if (isTireMaterial(mat)) {
        mat.metalness = 0
        mat.roughness = 0.95
        mat.envMapIntensity = 0.5
      } else if (isPaintMaterial(mat)) {
        mat.metalness = Math.min(1, (mat.metalness ?? 0.5) + 0.15)
        mat.roughness = Math.max(0.12, (mat.roughness ?? 0.5) * 0.65)
        mat.envMapIntensity = tier === 'high' ? 1.1 : 0.85
        applyColorTint(mat, colorTint)
      } else {
        mat.envMapIntensity = 0.8
      }

      if (tier === 'medium') {
        mat.envMapIntensity = (mat.envMapIntensity ?? 1) * 0.7
        mat.metalness = Math.max(0, (mat.metalness ?? 0) - 0.1)
        mat.roughness = Math.min(1, (mat.roughness ?? 0.5) + 0.06)
      } else if (tier === 'low') {
        mat.envMapIntensity = (mat.envMapIntensity ?? 1) * 0.45
        mat.metalness = Math.max(0, (mat.metalness ?? 0) - 0.2)
        mat.roughness = Math.min(1, (mat.roughness ?? 0.5) + 0.15)
      }

      mat.needsUpdate = true
    }
  })
}

export function collectPaintMaterials(object) {
  const materials = []
  object.traverse((child) => {
    if (!child.isMesh) return
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    for (const mat of mats) {
      if (mat && isPaintMaterial(mat)) materials.push(mat)
    }
  })
  return materials
}
