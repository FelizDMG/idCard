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
const sparkles = []
const sparkleCount = 100

const sparkleGeometry = new THREE.BufferGeometry()
const sparklePositions = new Float32Array(sparkleCount * 3)
const sparkleSizes = new Float32Array(sparkleCount)

for (let i = 0; i < sparkleCount; i++) {
    sparklePositions[i * 3] = (Math.random() - 0.5) * 10
    sparklePositions[i * 3 + 1] = (Math.random() - 0.5) * 10
    sparklePositions[i * 3 + 2] = (Math.random() - 0.5) * 10
    sparkleSizes[i] = Math.random() * 0.2
}

sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3))
sparkleGeometry.setAttribute('size', new THREE.BufferAttribute(sparkleSizes, 1))

const sparkleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    transparent: true,
    blending: THREE.AdditiveBlending,
    map: new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjQ5RTI5ODY3RjUwQTExRTlCNjVCODI2MjkxNkE0REUwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjQ5RTI5ODY4RjUwQTExRTlCNjVCODI2MjkxNkE0REUwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NDlFMjk4NjVGNTBBMTFFOUI2NUI4MjYyOTE2QTRERTAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NDlFMjk4NjZGNTBBMTFFOUI2NUI4MjYyOTE2QTRERTAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4zD1ZsAAACSklEQVR42syXy23CQBCGx5YlSpALnLgkVxKUDpxDKgjpgA7SDqADKIESoARSQjoIPZAK4MZNXrLrv8PIMl7vg4wlS/Zqdmf+ndnx7nQ6qTp1pmpWlRIwAhZAC2ga/P4MHIAUWAMboFCTC3DOOVdPLscVcAQ+ge8aL9BlnVHhGOyCLpN6B66AN+AhEPhosZ0JFSqBK+AhEHgGPDLpCdxwLKaB0RQCLxkXun+f4VjMvwGXKv4ReBN5wQV4BPqMw/U5jhg7kQAzwYjZy3kT5gwoAR4kAi6BfpjwSiJARNCjL0GLCZAKeFkS4IV+51SLlgTQhCCtKRL4yxXYlwhoGwIfhHNe+wJS4J5rvisBUBIgpdp/S4EHwC0w4Ba0JEBKgBcGbBM/1+4YgAqwk4CfGDc209Z8CiZMq+DDX0gAHPkS7AL3DLYFDpz/LQLHQMAzg+4yF7ySAJVrQLe5vwz2FPhWrHXDAPD7Cm6AZ875LSdgwxIsDYDWPO8zwQvgVvNbF3Ss+Q5cwYFrf8rgoxpDAPAzXy5YuQYk3I5H3XNgz/+JBEipGg+a+5e0PYmAlABHTV9I26MEGBoEZwRYSgA0mWBPIZhxzZcSAbqZcEn1vyYBdE1Iy/Uc1/4oEXCUiYGUAJmm+YglQGoEHIT2n/m8LQF8lz0/smcJ4AQYz9kzgU0vQMoqxq4EQKoRsCf4NIAIvwFXVF6bEsWRUOYE0JEwklYxQsN7w33/AGwlAqRleBkO/L/L8K8AAwB1oADlnWUZBwAAAABJRU5ErkJggg==')
})

const sparkleParticles = new THREE.Points(sparkleGeometry, sparkleMaterial)
scene.add(sparkleParticles)
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

    const positions = sparkleParticles.geometry.attributes.position.array
    for (let i = 0; i < sparkleCount; i++) {
        positions[i * 3 + 1] += Math.sin(clock.elapsedTime + i) * 0.002
        positions[i * 3] += Math.cos(clock.elapsedTime + i) * 0.002
    }
    sparkleParticles.geometry.attributes.position.needsUpdate = true
    sparkleParticles.rotation.y += delta * 0.1

    renderer.render(scene, camera)
}

animate()


