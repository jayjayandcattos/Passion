import { Environment, Lightformer } from '@react-three/drei'

export function CinematicLighting() {
  return (
    <>
      <color attach="background" args={['#050404']} />
      <fog attach="fog" args={['#050404', 10, 32]} />

      <ambientLight intensity={0.08} color="#1a1010" />
      <directionalLight
        position={[12, 18, 8]}
        intensity={2.2}
        color="#ffb380"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-14, 6, -6]} intensity={1.4} color="#ff2800" />
      <directionalLight position={[0, 4, -16]} intensity={0.6} color="#6688ff" />
      <spotLight
        position={[0, 12, 0]}
        angle={0.35}
        penumbra={0.8}
        intensity={0.8}
        color="#fff5ee"
        distance={30}
        castShadow={false}
      />

      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={4}
          rotation-x={Math.PI / 2}
          position={[0, 5, -8]}
          scale={[20, 20, 1]}
          color="#ff6b35"
        />
        <Lightformer
          intensity={2}
          rotation-y={Math.PI / 2}
          position={[-10, 2, 0]}
          scale={[20, 8, 1]}
          color="#ff2800"
        />
        <Lightformer
          intensity={1.5}
          rotation-y={-Math.PI / 2}
          position={[10, 3, 2]}
          scale={[15, 6, 1]}
          color="#4466aa"
        />
      </Environment>
    </>
  )
}
