import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useScroll, Center } from '@react-three/drei'
import * as THREE from 'three'
import { enhanceMaterials } from '../utils/enhanceMaterials'

export function FerrariModel({ url, position, rotation, scale, start, end }) {
  const { scene } = useGLTF(url)
  const groupRef = useRef()
  const scroll = useScroll()
  const opacity = useRef(0)

  const model = useMemo(() => {
    const clone = scene.clone(true)
    enhanceMaterials(clone)
    return clone
  }, [scene])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    const scrollVal = scroll.offset
    const inRange = scrollVal >= start - 0.08 && scrollVal <= end + 0.08
    const goal = inRange ? 1 : 0
    opacity.current = THREE.MathUtils.damp(opacity.current, goal, 8, delta)

    const visible = opacity.current > 0.02
    groupRef.current.visible = visible

    if (!visible) return

    const progress = THREE.MathUtils.clamp((scrollVal - start) / (end - start), 0, 1)
    const ease = progress * progress * (3 - 2 * progress)
    const scrollRotation = ease * Math.PI * 0.35

    groupRef.current.rotation.set(rotation[0], rotation[1] + scrollRotation, rotation[2])

    const scaleMult = 0.92 + 0.08 * Math.sin(progress * Math.PI)
    groupRef.current.scale.setScalar(scale * scaleMult)

    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((m) => {
          m.transparent = true
          m.opacity = opacity.current
        })
      }
    })
  })

  return (
    <group ref={groupRef} position={position} visible={false}>
      <Center>
        <primitive object={model} />
      </Center>
    </group>
  )
}
