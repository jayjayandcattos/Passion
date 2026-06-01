import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ScrollControls, Scroll, useScroll } from '@react-three/drei'
import { CarFleet } from './CarFleet'
import { CinematicCamera } from './CinematicCamera'
import { CinematicLighting } from './CinematicLighting'
import { ShowroomGround } from './ShowroomGround'
import { CinematicEffects } from './CinematicEffects'
import { SceneLoader } from './SceneLoader'
import { HeroEntrance } from './HeroEntrance'

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
      const p2 = Math.max(0, 1 - Math.abs(scrollVal - 0.5) * 4)
      text2.current.style.opacity = String(p2)
      text2.current.style.transform = `translate3d(0, ${(0.5 - scrollVal) * 50}px, 0)`
    }

    if (text3.current) {
      const p3 = Math.max(0, 1 - (1 - scrollVal) * 4)
      text3.current.style.opacity = String(p3)
      text3.current.style.transform = `translate3d(0, ${(1 - scrollVal) * -50}px, 0)`
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
  return (
    <div id="canvas-container">
      <div className="film-grain" aria-hidden="true" />
      <div className="letterbox letterbox--top" aria-hidden="true" />
      <div className="letterbox letterbox--bottom" aria-hidden="true" />

      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        camera={{ position: [6, 1.8, 9], fov: 38, near: 0.1, far: 80 }}
      >
        <CinematicLighting />
        <ShowroomGround />

        <ScrollControls pages={3} damping={0.22}>
          <CinematicCamera />
          <Suspense fallback={<SceneLoader />}>
            <CarFleet />
          </Suspense>
          <HtmlOverlay />
        </ScrollControls>

        <CinematicEffects />
      </Canvas>
    </div>
  )
}
