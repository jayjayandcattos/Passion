import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, useGLTF, ScrollControls, Scroll, useScroll, Center, Float, ContactShadows, SpotLight } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

function FerrariModel({ url, position, rotation, scale, start, end, floatIntensity = 1 }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef();
  const scroll = useScroll();

  useFrame(() => {
    if (!groupRef.current) return;
    const scrollVal = scroll.offset;
    
    // Smooth fade and rotate
    if (scrollVal >= start - 0.1 && scrollVal <= end + 0.1) {
      groupRef.current.visible = true;
      const progress = Math.max(0, Math.min(1, (scrollVal - start) / (end - start)));
      groupRef.current.rotation.y = rotation[1] + progress * Math.PI * 0.5; // Cinematic 90-degree turn
      
      // Smooth scale-in/out
      const scaleMult = Math.sin(progress * Math.PI);
      groupRef.current.scale.setScalar(scale * (0.8 + 0.2 * scaleMult));
    } else {
      groupRef.current.visible = false;
    }
  });

  return (
    <group ref={groupRef} position={position} visible={false}>
      <Float speed={2} rotationIntensity={0.2 * floatIntensity} floatIntensity={0.5 * floatIntensity}>
        <Center>
          <primitive object={scene} />
        </Center>
      </Float>
      {/* Cinematic grounding shadow */}
      <ContactShadows position={[0, -1.2, 0]} opacity={0.8} scale={15} blur={2} far={4} />
    </group>
  );
}

function HtmlOverlay() {
  const scroll = useScroll();
  const text1 = useRef();
  const text2 = useRef();
  const text3 = useRef();

  useFrame(() => {
    const scrollVal = scroll.offset;
    // Animate Text 1
    if (text1.current) {
      text1.current.style.opacity = Math.max(0, 1 - scrollVal * 3);
      text1.current.style.transform = `translateY(${scrollVal * 100}px)`;
    }
    // Animate Text 2
    if (text2.current) {
      const p2 = Math.max(0, 1 - Math.abs(scrollVal - 0.5) * 3);
      text2.current.style.opacity = p2;
      text2.current.style.transform = `translateY(${(0.5 - scrollVal) * 100}px)`;
    }
    // Animate Text 3
    if (text3.current) {
      const p3 = Math.max(0, 1 - (1 - scrollVal) * 3);
      text3.current.style.opacity = p3;
      text3.current.style.transform = `translateY(${(1 - scrollVal) * -100}px)`;
    }
  });

  return (
    <Scroll html style={{ width: '100%' }}>
      <div className="content-layer">
        <section className="section section-center" style={{ height: '100vh' }}>
          <div className="text-content" ref={text1} style={{ opacity: 1, transform: 'translateY(0px)' }}>
            <h2 className="subtitle">2016</h2>
            <h1 className="title">488 GTB</h1>
            <p className="description">
              The start of a new turbocharged era. 
              Unprecedented performance combined with extreme responsiveness.
            </p>
          </div>
        </section>

        <section className="section section-right" style={{ height: '100vh' }}>
          <div className="text-content" ref={text2} style={{ opacity: 0, transform: 'translateY(40px)' }}>
            <h2 className="subtitle">2020</h2>
            <h1 className="title">F8 Tributo</h1>
            <p className="description">
              A celebration of excellence. An homage to the most powerful V8 in Ferrari history.
            </p>
          </div>
        </section>

        <section className="section" style={{ height: '100vh' }}>
          <div className="text-content" ref={text3} style={{ opacity: 0, transform: 'translateY(40px)' }}>
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
  );
}

export function Scene() {
  return (
    <div id="canvas-container">
      <Canvas shadows camera={{ position: [0, 2, 12], fov: 40 }}>
        <color attach="background" args={['#070505']} />
        
        {/* Cinematic Lighting Setup */}
        <ambientLight intensity={0.2} />
        <SpotLight position={[0, 15, 0]} penumbra={1} angle={0.6} intensity={2} color="#ffffff" castShadow />
        <SpotLight position={[10, 5, 10]} penumbra={1} angle={0.4} intensity={5} color="#FF2800" />
        <SpotLight position={[-10, 5, -10]} penumbra={1} angle={0.4} intensity={3} color="#4444ff" />
        <Environment preset="city" />
        
        <ScrollControls pages={3} damping={0.1}>
          <Suspense fallback={null}>
            {/* 2016 488 GTB */}
            <FerrariModel 
              url="/models/2016_ferrari_488_gtb.glb" 
              position={[0, -0.5, 0]} 
              rotation={[0, -Math.PI / 4, 0]} 
              scale={100}
              start={0}
              end={0.33}
              floatIntensity={1}
            />
            {/* 2020 F8 Tributo */}
            <FerrariModel 
              url="/models/2020_ferrari_f8_tributo.glb" 
              position={[0, -0.5, 0]} 
              rotation={[0, Math.PI / 4, 0]} 
              scale={100}
              start={0.33}
              end={0.66}
              floatIntensity={0.8}
            />
            {/* 2021 Model */}
            <FerrariModel 
              url="/models/ferrari_2021.glb" 
              position={[0, -0.5, 0]} 
              rotation={[0, 0, 0]} 
              scale={100}
              start={0.66}
              end={1.0}
              floatIntensity={1.2}
            />
          </Suspense>
          <HtmlOverlay />
        </ScrollControls>

        {/* Post-Processing */}
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
