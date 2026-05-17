import React, { useEffect } from 'react'
import { Scene } from './components/Scene'
import './index.css'

import { Tubes1Cursor } from 'threejs-components';

function TubesCursor() {
  const containerRef = React.useRef(null);
  
  useEffect(() => {
    if (containerRef.current) {
      const cursor = new Tubes1Cursor(containerRef.current);
      // Optional: tweak cursor parameters here if needed
      // cursor.color = 0xff2800; // Ferrari red glow, but default is fine
    }
  }, []);

  return <div ref={containerRef} id="cursor-canvas" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, pointerEvents: 'none' }} />;
}

function App() {
  return (
    <>
      <TubesCursor />
      <Scene />
    </>
  )
}

export default App
