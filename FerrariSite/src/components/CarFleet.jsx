import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, useGLTF, useScroll } from '@react-three/drei'
import { CARS } from '../constants/cars'
import { FerrariModel } from './FerrariModel'
import useQualityTier from '../hooks/useQualityTier'
import {
  OPACITY_MOUNT_THRESHOLD,
  sectionOpacity,
} from '../utils/scrollFade'

useGLTF.preload(CARS[0].url)

function computeMountedIndices(scrollOffset, multiCar) {
  const withOpacity = CARS.map((car, i) => ({
    i,
    opacity: sectionOpacity(scrollOffset, car.start, car.end),
  })).filter(({ opacity }) => opacity > OPACITY_MOUNT_THRESHOLD)

  if (multiCar) {
    return withOpacity.map(({ i }) => i)
  }

  if (withOpacity.length <= 1) {
    return withOpacity.map(({ i }) => i)
  }

  withOpacity.sort((a, b) => b.opacity - a.opacity)
  return withOpacity.slice(0, 2).map(({ i }) => i)
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((v, idx) => v === sortedB[idx])
}

export function CarFleet() {
  const scroll = useScroll()
  const quality = useQualityTier()
  const [mounted, setMounted] = useState(() => [0])
  const mountedRef = useRef(mounted)

  useEffect(() => {
    mountedRef.current = mounted
  }, [mounted])

  useEffect(() => {
    const t = setTimeout(() => useGLTF.preload(CARS[1].url), 800)
    const t2 = setTimeout(() => useGLTF.preload(CARS[2].url), 2400)
    return () => {
      clearTimeout(t)
      clearTimeout(t2)
    }
  }, [])

  useFrame(() => {
    const scrollOffset = scroll.offset
    const next = computeMountedIndices(scrollOffset, quality.settings.multiCar)

    for (const idx of next) {
      useGLTF.preload(CARS[idx].url)
    }
    const maxIdx = Math.max(...next, 0)
    const minIdx = Math.min(...next, 0)
    if (maxIdx < CARS.length - 1) useGLTF.preload(CARS[maxIdx + 1].url)
    if (minIdx > 0) useGLTF.preload(CARS[minIdx - 1].url)

    if (!arraysEqual(next, mountedRef.current)) {
      mountedRef.current = next
      setMounted(next)
    }
  })

  return (
    <>
      {CARS.map(
        (car, i) =>
          mounted.includes(i) && (
            <FerrariModel
              key={car.url}
              url={car.url}
              position={car.position}
              rotation={car.rotation}
              scale={car.scale}
              start={car.start}
              end={car.end}
              colorTint={car.colorTint}
            />
          ),
      )}
      <ContactShadows
        position={[0, -1.19, 0]}
        opacity={0.5}
        scale={22}
        blur={2.5}
        far={3.5}
        resolution={quality.settings.contactShadowRes ?? 256}
        frames={1}
      />
    </>
  )
}
