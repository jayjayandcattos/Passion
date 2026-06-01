import React, { useEffect } from 'react'
import { Scene } from './components/Scene'
import './index.css'

import { Tubes1Cursor } from 'threejs-components';

function TubesCursor() {
  const containerRef = React.useRef(null);
  
  useEffect(() => {
    let cursor;
    if (containerRef.current) {
      cursor = Tubes1Cursor(containerRef.current, {
        tubes: { 
          colors: ["#ff2800", "#cc2000", "#991800", "#ff5333"] 
        }
      });
    }

    return () => {
      if (cursor && cursor.dispose) {
        cursor.dispose();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = ''; // Clean up any remaining canvas elements
      }
    };
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
