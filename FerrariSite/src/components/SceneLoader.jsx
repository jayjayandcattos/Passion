import { Html, useProgress } from '@react-three/drei'

export function SceneLoader() {
  const { progress } = useProgress()

  return (
    <Html center>
      <div className="scene-loader">
        <div className="scene-loader__bar">
          <div className="scene-loader__fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="scene-loader__label">LOADING {Math.round(progress)}%</span>
      </div>
    </Html>
  )
}
