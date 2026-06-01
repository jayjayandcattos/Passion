import { Environment, Lightformer } from '@react-three/drei'
import useQualityTier from '../hooks/useQualityTier'

export function CinematicLighting() {
  const quality = useQualityTier()
  const shadowSize = quality.settings.shadowMapSize || 1024

  const mainDirectional = quality.isHigh
    ? { intensity: 1.6, color: '#fff4ee' }
    : quality.isMedium
      ? { intensity: 1.4, color: '#fff6f0' }
      : { intensity: 1.2, color: '#fff8f4' }

  const rimDirectional = quality.isHigh
    ? { intensity: 0.7, color: '#ffc9a8' }
    : { intensity: 0.55, color: '#ffd9c4' }

  const bgColor = quality.isHigh ? '#050404' : quality.isMedium ? '#0b0b0b' : '#111111'
  const ambientIntensity = quality.isHigh ? 0.14 : quality.isMedium ? 0.18 : 0.22

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[bgColor, 10, 32]} />

      <ambientLight intensity={ambientIntensity} color="#141418" />
      <directionalLight
        position={[12, 18, 8]}
        intensity={mainDirectional.intensity}
        color={mainDirectional.color}
        castShadow
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0001}
      />
      <directionalLight
        position={[-14, 6, -6]}
        intensity={rimDirectional.intensity}
        color={rimDirectional.color}
      />
      <directionalLight position={[0, 4, -16]} intensity={0.45} color="#a8b8d8" />
      <spotLight
        position={[0, 12, 0]}
        angle={0.35}
        penumbra={0.8}
        intensity={0.65}
        color="#fff8f4"
        distance={30}
        castShadow={false}
      />

      <Environment resolution={quality.isHigh ? 512 : 256} frames={1}>
        <Lightformer
          intensity={quality.isHigh ? 2.2 : 1.4}
          rotation-x={Math.PI / 2}
          position={[0, 5, -8]}
          scale={[20, 20, 1]}
          color="#f5f0eb"
        />
        <Lightformer
          intensity={quality.isHigh ? 1.4 : 0.9}
          rotation-y={Math.PI / 2}
          position={[-10, 2, 0]}
          scale={[20, 8, 1]}
          color="#fff4ea"
        />
        <Lightformer
          intensity={quality.isHigh ? 1.2 : 0.7}
          rotation-y={-Math.PI / 2}
          position={[10, 3, 2]}
          scale={[15, 6, 1]}
          color="#d8e4f8"
        />
        {quality.isHigh ? (
          <Lightformer
            intensity={0.35}
            rotation-y={Math.PI / 4}
            position={[6, 4, 4]}
            scale={[8, 4, 1]}
            color="#ffb89a"
          />
        ) : null}
      </Environment>
    </>
  )
}
