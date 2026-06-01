import { MeshReflectorMaterial } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import useQualityTier from '../hooks/useQualityTier'

export function ShowroomGround() {
  const { viewport } = useThree()
  const isMobile = viewport.width < 6
  const quality = useQualityTier()

  const reflectorEnabled = quality.settings.reflector
  const resolution = isMobile ? 256 : quality.tier === 'high' ? 512 : 256

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      {reflectorEnabled ? (
        <MeshReflectorMaterial
          blur={[isMobile ? 128 : 256, 64]}
          resolution={resolution}
          mixBlur={0.6}
          mixStrength={quality.tier === 'high' ? 0.65 : 0.2}
          roughness={0.75}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.25}
          color="#080808"
          metalness={0.6}
          mirror={quality.tier === 'high' ? 0.35 : 0.12}
        />
      ) : (
        <meshStandardMaterial color="#080808" roughness={0.85} metalness={0.2} />
      )}
    </mesh>
  )
}
