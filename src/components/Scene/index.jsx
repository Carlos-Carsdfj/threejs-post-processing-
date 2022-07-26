/* eslint-disable react/react-in-jsx-scope */
import { useEffect, useRef } from 'react'
import { ContainerScene } from './Scene.elements'
import { cleanUpScene, initScene } from './Script'

export default function Scene() {
  const mountRef = useRef(null)
  useEffect(() => {
    initScene(mountRef)
    return () => {
      cleanUpScene()
    }
  }, [])

  return (
    <>
      <ContainerScene
        className="SceneContainer"
        ref={mountRef}
      ></ContainerScene>
    </>
  )
}
