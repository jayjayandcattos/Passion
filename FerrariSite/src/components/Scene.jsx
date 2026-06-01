import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ScrollControls, Scroll, useScroll } from '@react-three/drei'
import { CarFleet } from './CarFleet'
import { CinematicCamera } from './CinematicCamera'
import { CinematicLighting } from './CinematicLighting'
import { ShowroomGround } from './ShowroomGround'
import { CinematicEffects } from './CinematicEffects'
import { SceneLoader } from './SceneLoader'
import { HeroEntrance } from './HeroEntrance'
import useQualityTier from '../hooks/useQualityTier'

function HtmlOverlay() {
  const scroll = useScroll()
  const text1 = useRef(null)
  const text2 = useRef(null)
  const text3 = useRef(null)
  const entranceDone = useRef(false)

  useFrame(() => {
    const scrollVal = scroll.offset

    if (text1.current && entranceDone.current) {
      const fade = Math.max(0, 1 - scrollVal * 4)
      text1.current.style.opacity = String(fade)
      text1.current.style.transform = `translate3d(0, ${scrollVal * 60}px, 0)`
    }

    if (text2.current) {
      const center2 = 0.495
      const p2 = Math.max(0, 1 - Math.abs(scrollVal - center2) * 4)
      text2.current.style.opacity = String(p2)
      text2.current.style.transform = `translate3d(0, ${(center2 - scrollVal) * 50}px, 0)`
    }

    if (text3.current) {
      const center3 = 0.815
      const p3 = Math.max(0, 1 - Math.abs(scrollVal - center3) * 4)
      text3.current.style.opacity = String(p3)
      text3.current.style.transform = `translate3d(0, ${(center3 - scrollVal) * 50}px, 0)`
    }
  })

  return (
    <Scroll html style={{ width: '100%' }}>
      <div className="content-layer">
        <section className="section section-hero" style={{ height: '100vh' }}>
          <div ref={text1} className="hud-block hud-block--hero">
            <HeroEntrance
              onEntranceComplete={() => {
                entranceDone.current = true
              }}
            />
          </div>
          <p className="scroll-hint">SCROLL</p>
        </section>

        <section className="section section-right" style={{ height: '100vh' }}>
          <div
            className="hud-block hud-block--right"
            ref={text2}
            style={{ opacity: 0, transform: 'translate3d(0, 32px, 0)' }}
          >
            <span className="hud-tag">2020</span>
            <h1 className="hud-title">F8 Tributo</h1>
            <p className="hud-copy">
              Homage to the most powerful V8 in Ferrari history.
            </p>
          </div>
        </section>

        <section className="section section-left" style={{ height: '100vh' }}>
          <div
            className="hud-block"
            ref={text3}
            style={{ opacity: 0, transform: 'translate3d(0, 32px, 0)' }}
          >
            <span className="hud-tag">2021</span>
            <h1 className="hud-title">The Evolution</h1>
            <p className="hud-copy">
              Aerodynamics and hybrid tech — relentless pursuit of perfection.
            </p>
          </div>
        </section>
      </div>
    </Scroll>
  )
}

export function Scene() {
  const quality = useQualityTier()
  const debug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1'
  return (
    <div id="canvas-container">
      <div className="film-grain" aria-hidden="true" />
      <div className="letterbox letterbox--top" aria-hidden="true" />
      <div className="letterbox letterbox--bottom" aria-hidden="true" />

      <Canvas
        shadows
        dpr={quality.settings.dpr}
        gl={{
          antialias: quality.settings.multisampling > 0,
          powerPreference: 'high-performance',
          stencil: false,
          physicallyCorrectLights: true,
          outputEncoding: THREE.sRGBEncoding,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        camera={{ position: [6, 1.8, 9], fov: 38, near: 0.1, far: 80 }}
      >
        <CinematicLighting />

        {debug ? (
          // Debug helper: small emissive sphere at origin to validate camera & lighting
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial emissive={'#ffffff'} emissiveIntensity={1.2} color={'#222222'} />
          </mesh>
        ) : null}
        <ShowroomGround />

        <ScrollControls pages={3} damping={0.22}>
          <CinematicCamera />
          <Suspense fallback={<SceneLoader />}>
            <CarFleet />
          </Suspense>
          <HtmlOverlay />
        </ScrollControls>

        {quality.settings.composer ? <CinematicEffects /> : null}
      </Canvas>
    </div>
  )
}
