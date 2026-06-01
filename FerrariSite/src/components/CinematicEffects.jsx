import { useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

export function CinematicEffects() {
  const width = useThree((s) => s.size.width)
  const isMobile = width < 768

  return (
    <EffectComposer multisampling={isMobile ? 0 : 2}>
      <Bloom
        luminanceThreshold={0.85}
        luminanceSmoothing={0.9}
        intensity={isMobile ? 0.35 : 0.55}
        mipmapBlur
        radius={0.4}
      />
      <Vignette eskil={false} offset={0.12} darkness={0.85} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  )
}
