export function enhanceMaterials(object) {
  object.traverse((child) => {
    if (!child.isMesh) return

    child.castShadow = true
    child.receiveShadow = true

    const materials = Array.isArray(child.material) ? child.material : [child.material]

    for (const mat of materials) {
      if (!mat) continue

      if (mat.map) mat.map.anisotropy = 8

      const name = (mat.name || '').toLowerCase()

      if (name.includes('glass') || name.includes('window')) {
        mat.transparent = true
        mat.opacity = 0.35
        mat.metalness = 0.9
        mat.roughness = 0.05
        mat.envMapIntensity = 2
      } else if (name.includes('chrome') || name.includes('metal')) {
        mat.metalness = 1
        mat.roughness = 0.12
        mat.envMapIntensity = 2.5
      } else if (name.includes('tire') || name.includes('rubber')) {
        mat.metalness = 0
        mat.roughness = 0.95
      } else {
        mat.metalness = Math.min(1, (mat.metalness ?? 0.5) + 0.35)
        mat.roughness = Math.max(0.08, (mat.roughness ?? 0.5) * 0.45)
        mat.envMapIntensity = 1.8
      }

      mat.needsUpdate = true
    }
  })
}
