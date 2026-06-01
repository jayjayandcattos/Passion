import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { CAR_TARGET } from '../constants/cars'

const target = new THREE.Vector3(...CAR_TARGET)
const lookAt = new THREE.Vector3()
const pos = new THREE.Vector3()

const SECTIONS = [
  { azimuth: 0.55, elevation: 0.12, radius: 9.5, fov: 38, lookY: -0.1 },
  { azimuth: 0.85, elevation: 0.18, radius: 11, fov: 42, lookY: -0.12 },
  { azimuth: 1.15, elevation: 0.22, radius: 12.5, fov: 44, lookY: -0.15 },
]

function damp(current, goal, lambda, dt) {
  return THREE.MathUtils.lerp(current, goal, 1 - Math.exp(-lambda * dt))
}

function sampleSection(offset) {
  const t = offset * 2
  const i = Math.min(2, Math.floor(t))
  const f = t - i
  const a = SECTIONS[i]
  const b = SECTIONS[Math.min(2, i + 1)]
  const ease = f * f * (3 - 2 * f)

  return {
    azimuth: THREE.MathUtils.lerp(a.azimuth, b.azimuth, ease),
    elevation: THREE.MathUtils.lerp(a.elevation, b.elevation, ease),
    radius: THREE.MathUtils.lerp(a.radius, b.radius, ease),
    fov: THREE.MathUtils.lerp(a.fov, b.fov, ease),
    lookY: THREE.MathUtils.lerp(a.lookY, b.lookY, ease),
  }
}

export function CinematicCamera() {
  const scroll = useScroll()
  const { camera } = useThree()

  useFrame((_, delta) => {
    const offset = scroll.offset
    const { azimuth, elevation, radius, fov, lookY } = sampleSection(offset)

    const cosEl = Math.cos(elevation)
    pos.set(
      target.x + radius * cosEl * Math.sin(azimuth),
      target.y + radius * Math.sin(elevation) + 0.6,
      target.z + radius * cosEl * Math.cos(azimuth),
    )

    lookAt.copy(target)
    lookAt.y += lookY

    const lambda = 6
    camera.position.x = damp(camera.position.x, pos.x, lambda, delta)
    camera.position.y = damp(camera.position.y, pos.y, lambda, delta)
    camera.position.z = damp(camera.position.z, pos.z, lambda, delta)

    if ('fov' in camera) {
      camera.fov = damp(camera.fov, fov, lambda, delta)
      camera.updateProjectionMatrix()
    }

    camera.lookAt(lookAt)
  })

  return null
}
