import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, useGLTF, ScrollControls, Scroll, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

function FerrariModel({ url, position, rotation, scale, scrollTriggerRef, start, end }) {
  const { scene } = useGLTF(url);
  const ref = useRef();
  const scroll = useScroll();

  useFrame(() => {
    // Basic transition logic based on scroll
    const scrollVal = scroll.offset;
    if (scrollVal >= start && scrollVal <= end) {
      ref.current.visible = true;
      // Animate rotation based on scroll
      const progress = (scrollVal - start) / (end - start);
      ref.current.rotation.y = rotation[1] + progress * Math.PI;
    } else {
      ref.current.visible = false;
    }
  });

  return <primitive ref={ref} object={scene} position={position} rotation={rotation} scale={scale} visible={false} />;
}

export function Scene() {
  return (
    <div id="canvas-container" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      <Canvas shadows camera={{ position: [0, 2, 10], fov: 45 }}>
        <color attach="background" args={['#0A0808']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <spotLight position={[-10, 10, -5]} intensity={1} angle={0.3} penumbra={1} castShadow />
        <Environment preset="night" />
        
        <ScrollControls pages={3} damping={0.1}>
          <Suspense fallback={null}>
            {/* 2016 488 GTB */}
            <FerrariModel 
              url="/models/2016_ferrari_488_gtb.glb" 
              position={[0, -1, 0]} 
              rotation={[0, 0, 0]} 
              scale={2}
              start={0}
              end={0.33}
            />
            {/* 2020 F8 Tributo */}
            <FerrariModel 
              url="/models/2020_ferrari_f8_tributo.glb" 
              position={[0, -1, 0]} 
              rotation={[0, 0, 0]} 
              scale={2}
              start={0.33}
              end={0.66}
            />
            {/* 2021 Model */}
            <FerrariModel 
              url="/models/ferrari_2021.glb" 
              position={[0, -1, 0]} 
              rotation={[0, 0, 0]} 
              scale={2}
              start={0.66}
              end={1.0}
            />
          </Suspense>

          <Scroll html style={{ width: '100%' }}>
            <div className="content-layer">
              <section className="section" style={{ height: '100vh' }}>
                <div className="text-content">
                  <h2 className="subtitle">2016</h2>
                  <h1 className="title">488 GTB</h1>
                  <p className="description">
                    The start of a new turbocharged era. 
                    Unprecedented performance combined with extreme responsiveness.
                  </p>
                </div>
              </section>

              <section className="section" style={{ height: '100vh', alignItems: 'flex-end', textAlign: 'right' }}>
                <div className="text-content">
                  <h2 className="subtitle">2020</h2>
                  <h1 className="title">F8 Tributo</h1>
                  <p className="description">
                    A celebration of excellence. An homage to the most powerful V8 in Ferrari history.
                  </p>
                </div>
              </section>

              <section className="section" style={{ height: '100vh' }}>
                <div className="text-content">
                  <h2 className="subtitle">2021</h2>
                  <h1 className="title">The Evolution</h1>
                  <p className="description">
                    Pushing the boundaries of aerodynamics and hybrid technology.
                    The relentless pursuit of perfection.
                  </p>
                </div>
              </section>
            </div>
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
