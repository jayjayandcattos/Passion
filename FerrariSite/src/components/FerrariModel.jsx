import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useScroll, Center } from '@react-three/drei'
import * as THREE from 'three'
import { enhanceMaterials, collectPaintMaterials } from '../utils/enhanceMaterials'
import useQualityTier from '../hooks/useQualityTier'
import {
  OPACITY_MOUNT_THRESHOLD,
  OPACITY_STABLE_EPSILON,
  sectionOpacity,
} from '../utils/scrollFade'

function applyPaintOpacity(paintMaterials, opacity) {
  const inFade = opacity > OPACITY_STABLE_EPSILON && opacity < 1 - OPACITY_STABLE_EPSILON

  for (const mat of paintMaterials) {
    if (inFade) {
      mat.transparent = true
      mat.opacity = opacity
    } else if (opacity >= 1 - OPACITY_STABLE_EPSILON) {
      mat.transparent = false
      mat.opacity = 1
    } else {
      mat.transparent = true
      mat.opacity = 0
    }
    mat.needsUpdate = true
  }
}

export function FerrariModel({
  url,
  position,
  rotation,
  scale,
  start,
  end,
  colorTint = null,
}) {
  const { scene } = useGLTF(url)
  const groupRef = useRef()
  const scroll = useScroll()
  const displayOpacity = useRef(0)
  const prevOpacity = useRef(-1)

  const quality = useQualityTier()

  const { model, paintMaterials } = useMemo(() => {
    enhanceMaterials(scene, { tier: quality.tier, colorTint })
    return { model: scene, paintMaterials: collectPaintMaterials(scene) }
  }, [scene, quality.tier, colorTint])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    const scrollVal = scroll.offset
    const goal = sectionOpacity(scrollVal, start, end)
    displayOpacity.current = THREE.MathUtils.damp(displayOpacity.current, goal, 8, delta)

    const visible = displayOpacity.current > OPACITY_MOUNT_THRESHOLD
    groupRef.current.visible = visible

    if (!visible) {
      if (prevOpacity.current > OPACITY_STABLE_EPSILON) {
        applyPaintOpacity(paintMaterials, 0)
        prevOpacity.current = 0
      }
      return
    }

    const span = end - start
    const progress = span > 0 ? THREE.MathUtils.clamp((scrollVal - start) / span, 0, 1) : 0
    const ease = progress * progress * (3 - 2 * progress)
    const scrollRotation = ease * Math.PI * 0.35

    groupRef.current.rotation.set(rotation[0], rotation[1] + scrollRotation, rotation[2])

    const scaleMult = 0.92 + 0.08 * Math.sin(progress * Math.PI)
    groupRef.current.scale.setScalar(scale * scaleMult)

    const o = displayOpacity.current
    if (Math.abs(prevOpacity.current - o) > OPACITY_STABLE_EPSILON) {
      applyPaintOpacity(paintMaterials, o)
      prevOpacity.current = o
    }
  })

  return (
    <group ref={groupRef} position={position} visible={false}>
      <Center>
        <primitive object={model} />
      </Center>
    </group>
  )
}
