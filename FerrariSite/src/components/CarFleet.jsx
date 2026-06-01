import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, useGLTF, useScroll } from '@react-three/drei'
import { CARS } from '../constants/cars'
import { FerrariModel } from './FerrariModel'

useGLTF.preload(CARS[0].url)

export function CarFleet() {
  const scroll = useScroll()
  const sectionRef = useRef(0)
  const [mounted, setMounted] = useState(() => [0])

  useEffect(() => {
    const t = setTimeout(() => useGLTF.preload(CARS[1].url), 800)
    const t2 = setTimeout(() => useGLTF.preload(CARS[2].url), 2400)
    return () => {
      clearTimeout(t)
      clearTimeout(t2)
    }
  }, [])

  useFrame(() => {
    const idx = scroll.offset < 0.33 ? 0 : scroll.offset < 0.66 ? 1 : 2
    if (idx === sectionRef.current) return
    sectionRef.current = idx

    setMounted((prev) => {
      const next = new Set(prev)
      next.add(idx)
      if (idx > 0) next.add(idx - 1)
      if (idx < 2) next.add(idx + 1)
      return [...next].sort()
    })

    useGLTF.preload(CARS[Math.min(2, idx + 1)].url)
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
            />
          ),
      )}
      <ContactShadows
        position={[0, -1.19, 0]}
        opacity={0.55}
        scale={22}
        blur={2.5}
        far={3.5}
        resolution={512}
        frames={1}
      />
    </>
  )
}
