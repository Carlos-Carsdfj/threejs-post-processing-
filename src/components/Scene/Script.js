import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
//import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass'
//import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
//import { DotScreenShader } from 'three/examples/jsm/shaders/DotScreenShader'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass  '
import * as dat from 'dat.gui'

let currentRef = null
const gui = new dat.GUI()
const params = {
  focus: 500.0,
  aperture: 0.01,
  maxblur: 0.01,
}

const camera = new THREE.PerspectiveCamera(45, 100 / 100, 0.1, 500)
camera.position.set(20, 8, 10)
camera.lookAt(new THREE.Vector3())

const scene = new THREE.Scene()
scene.add(camera)

const renderer = new THREE.WebGLRenderer()
renderer.outputEncoding = THREE.sRGBEncoding

renderer.physicallyCorrectLights = true
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 3
renderer.setSize(100, 100)

const orbitControls = new OrbitControls(camera, renderer.domElement)
orbitControls.enableDamping = true

const resize = () => {
  renderer.setSize(currentRef.clientWidth, currentRef.clientHeight)
  camera.aspect = currentRef.clientWidth / currentRef.clientHeight
  camera.updateProjectionMatrix()
  composer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', resize)

const light1 = new THREE.DirectionalLight(0xffffff, 1.2)
light1.position.set(10, 10, 10)
scene.add(light1)
const al = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(al)

const loader = new GLTFLoader()
loader.load('/House.glb', (gltf) => {
  scene.add(gltf.scene)
})
//Post-processing

const composer = new EffectComposer(renderer)
composer.setSize(window.innerWidth, window.innerHeight)

const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

//Pass   for Post-processing

//const glitchPass = new GlitchPass()
//glitchPass.enabled = false
//composer.addPass(glitchPass)

//const dotScreenPass = new DotScreenPass()
//composer.addPass(dotScreenPass)

//const dotScreenShader = new ShaderPass(DotScreenShader)
//dotScreenShader.uniforms['scale'].value = 4
//composer.addPass(dotScreenShader)

const bokehPass = new BokehPass(scene, camera, {
  aperture: 0.025,
  maxblur: 0.01,

  width: window.innerWidth,
  height: window.innerHeight,
})
composer.addPass(bokehPass)

//Gui
gui.add(params, 'maxblur', 0.0, 0.1, 0.00001).onChange((value) => {
  bokehPass.uniforms['maxblur'].value = value
})
gui.add(params, 'aperture', 0, 0.01, 0.000001).onChange((value) => {
  bokehPass.uniforms['aperture'].value = value
})

const raycaster = new THREE.Raycaster()
const mouseCoors = new THREE.Vector2(0, 0)

function onPointerMove(event) {
  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components

  mouseCoors.x = (event.clientX / window.innerWidth) * 2 - 1
  mouseCoors.y = -(event.clientY / window.innerHeight) * 2 + 1
}

window.document.addEventListener('mousemove', onPointerMove)

const animate = () => {
  orbitControls.update()
  raycaster.setFromCamera(mouseCoors, camera)
  const collitions = raycaster.intersectObjects(scene.children, true)

  for (let i = 0; i < collitions.length; i++) {
    const distance = collitions[0].distance
    bokehPass.uniforms.focus.value = distance
  }
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
  composer.render()
}
animate()

export const initScene = (mountRef) => {
  currentRef = mountRef.current
  resize()
  currentRef.appendChild(renderer.domElement)
}

// Dismount and clena up the buffer from the scene
export const cleanUpScene = () => {
  gui.destroy()
  scene.removeFromParent()
  currentRef.removeChild(renderer.domElement)
}
