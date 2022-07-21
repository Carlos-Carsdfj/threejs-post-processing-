import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
//import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass'
//import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
//import { DotScreenShader } from 'three/examples/jsm/shaders/DotScreenShader'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass '
import * as dat from 'dat.gui'

let currentRef = null
const gui = new dat.GUI()
const params = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0,
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

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
)
composer.addPass(bloomPass)

//Gui

gui
  .add(params, 'exposure', 0.1, 2)
  .step(0.00001)
  .onChange(function (value) {
    renderer.toneMappingExposure = Math.pow(Number(value), 4.0)
  })

gui
  .add(params, 'bloomThreshold', 0.0, 1.0)
  .step(0.00001)
  .onChange(function (value) {
    bloomPass.threshold = Number(value)
  })

gui
  .add(params, 'bloomStrength', 0.0, 3.0)
  .step(0.00001)
  .onChange(function (value) {
    bloomPass.strength = Number(value)
  })

gui
  .add(params, 'bloomRadius', 0.0, 1.0)
  .step(0.00001)
  .onChange(function (value) {
    bloomPass.radius = Number(value)
  })

const animate = () => {
  orbitControls.update()
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
