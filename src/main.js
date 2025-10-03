import './style.css'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'

document.querySelector('#app').innerHTML = `
  <div>
    <div style="position: relative;">
      <canvas id="scene"></canvas>
    </div>
    </p>
  </div>
  
`



const scene = new THREE.Scene()
const clock = new THREE.Clock()
const camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#scene'),
    antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0xffffff, 1)
camera.position.set(0, 0, 30)

const light = new THREE.DirectionalLight(0xffffff, 2)
const alight = new THREE.AmbientLight(0xffffff, 2)
light.position.set(0, 5, 10)
scene.add(light,alight)

const controls = new OrbitControls(camera, renderer.domElement)
controls.minDistance = 7 //zoom distance min
controls.maxDistance = 7 //zoom distance max
controls.minPolarAngle = Math.PI / 4 // 45 degrees up
controls.maxPolarAngle = Math.PI * 3 / 4 // 45 degrees down
controls.maxTargetRadius = 10
controls.screenSpacePanning = true
controls.enablePan = true

let controlsTimeout
controls.addEventListener('start', () => {
    clearTimeout(controlsTimeout)
})
controls.addEventListener('end', () => {
    controlsTimeout = setTimeout(() => {
        resetCamera()
    }, 500)
})


const modelUrls = [
    'https://raw.githubusercontent.com/FelizDMG/idcard/main/models/IDCard.glb'
]

let currentModelIndex = 0
let currentModel = null
let mixer = null
const loader = new GLTFLoader()

function resetCamera() {
    gsap.to(camera.position, {
        duration: .5,
        x: 0,
        y: 0,
        z: 30,
        ease: "power1.inOut"
    });
    gsap.to(controls.target, {
        duration: .5,
        x: 0,
        y: -0.2,
        z: 0,
        ease: "power1.inOut",
        onUpdate: () => camera.lookAt(controls.target)
    });
}
function loadModel(url) {
    loader.load(
        url,
        (gltf) => {
            if (currentModel) {
                scene.remove(currentModel)
            }
            const boundingBox = new THREE.Box3().setFromObject(gltf.scene)
            const height = boundingBox.max.y - boundingBox.min.y
            gltf.scene.position.y = -height / 4
            currentModel = gltf.scene
            scene.add(currentModel)

            if (gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(currentModel)
                const action = mixer.clipAction(gltf.animations[0])
                action.setLoop(THREE.LoopOnce)
                action.clampWhenFinished = true
                action.play()
            }

            resetCamera()
        },
        undefined,
        (error) => {
            console.error('Error loading model:', error)
        }
    )
}

loadModel(modelUrls[currentModelIndex])


function animate() {
    requestAnimationFrame(animate)
    const delta = clock.getDelta()
    if (mixer) mixer.update(delta)
    controls.update()
    renderer.render(scene, camera)
}

animate()


