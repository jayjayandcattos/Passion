import { MeshReflectorMaterial } from '@react-three/drei'
import { useThree } from '@react-three/fiber'

export function ShowroomGround() {
  const { viewport } = useThree()
  const isMobile = viewport.width < 6
  const resolution = isMobile ? 256 : 512

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <MeshReflectorMaterial
        blur={[256, 64]}
        resolution={resolution}
        mixBlur={1}
        mixStrength={0.65}
        roughness={0.75}
        depthScale={0.6}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.25}
        color="#080808"
        metalness={0.85}
        mirror={0.35}
      />
    </mesh>
  )
}
