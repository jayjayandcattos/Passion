import { useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import useQualityTier from '../hooks/useQualityTier'

export function CinematicEffects() {
  const width = useThree((s) => s.size.width)
  const isMobile = width < 768
  const quality = useQualityTier()

  const multisampling = quality.settings.multisampling

  return (
    <EffectComposer multisampling={isMobile ? 0 : multisampling}>
      <Bloom
        luminanceThreshold={0.92}
        luminanceSmoothing={0.9}
        intensity={isMobile ? 0.22 : 0.3}
        mipmapBlur
        radius={0.35}
      />
    </EffectComposer>
  )
}
