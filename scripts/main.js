import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const loaderCube = new THREE.CubeTextureLoader();
const textureCube = loaderCube.load([
  'https://threejs.org/examples/textures/cube/Park3Med/px.jpg',
  'https://threejs.org/examples/textures/cube/Park3Med/nx.jpg',
  'https://threejs.org/examples/textures/cube/Park3Med/py.jpg',
  'https://threejs.org/examples/textures/cube/Park3Med/ny.jpg',
  'https://threejs.org/examples/textures/cube/Park3Med/pz.jpg',
  'https://threejs.org/examples/textures/cube/Park3Med/nz.jpg'
]);

scene.background = textureCube;

const ambientLight = new THREE.AmbientLight(0x404040, 4);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 3);
directionalLight1.position.set(0, 0, 8).normalize();
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 3);
directionalLight2.position.set(0, 0, -8).normalize();
scene.add(directionalLight2);

const directionalLight3 = new THREE.DirectionalLight(0xffffff, 4);
directionalLight3.position.set(5, 5, -5).normalize();
scene.add(directionalLight3);

const directionalLight4 = new THREE.DirectionalLight(0xffffff, 4);
directionalLight4.position.set(-5, 5, -5).normalize();
scene.add(directionalLight4);

const spotLight = new THREE.SpotLight(0xffa95c, 100, 20, Math.PI / 4, 0.5, 1);
spotLight.position.set(5, 10, 5);
spotLight.target.position.set(0, 0, 0);
spotLight.castShadow = true;
spotLight.shadow.mapSize.set(2048, 2048);
scene.add(spotLight);
scene.add(spotLight.target);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const loader = new GLTFLoader();
const modelsFolder = './models';
let currentModelIndex = 0;
let currentModel = null;
let models = [];

function loadModel(index) {
    console.log(`Loading model index: ${index}`);

    if (models.length === 0) {
        console.error("No models found.");
        return;
    }

    index = (index + models.length) % models.length;

    if (currentModel) {
        scene.remove(currentModel);
    }

    if (models[index]) {
        console.log(`Adding previously loaded model ${index}`);
        scene.add(models[index].scene);
        currentModel = models[index].scene;
    } else {
        loader.load(
            `${modelsFolder}/model${index}.glb`,
            (gltf) => {
                console.log(`Loaded model${index}.glb successfully`);
                models[index] = gltf;
                scene.add(gltf.scene);
                currentModel = gltf.scene;
            },
            (xhr) => console.log(`Loading model: ${(xhr.loaded / xhr.total * 100).toFixed(2)}% completed`),
            (error) => {
                console.error(`Error loading model${index}.glb:`, error);
                alert(`Error loading model ${index}`);
            }
        );
    }
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'n') {
        console.log('Switching to next model');
        currentModelIndex = (currentModelIndex + 1) % models.length;
        loadModel(currentModelIndex);
    } else if (event.key === 'p') {
        console.log('Switching to previous model');
        currentModelIndex = (currentModelIndex - 1 + models.length) % models.length;
        loadModel(currentModelIndex);
    }
});

const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');

prevButton.addEventListener('click', () => {
    console.log('Switching to previous model');
    currentModelIndex = (currentModelIndex - 1 + models.length) % models.length;
    loadModel(currentModelIndex);
});

nextButton.addEventListener('click', () => {
    console.log('Switching to next model');
    currentModelIndex = (currentModelIndex + 1) % models.length;
    loadModel(currentModelIndex);
});

function preloadModels() {
    const modelCount = 5;
    for (let i = 0; i < modelCount; i++) {
        loader.load(
            `${modelsFolder}/model${i}.glb`,
            (gltf) => {
                console.log(`Preloaded model${i}.glb`);
                models[i] = gltf;
                if (i === 0) {
                    loadModel(i);
                }
            },
            (xhr) => console.log(`Preloading model${i}: ${(xhr.loaded / xhr.total * 100).toFixed(2)}% completed`),
            (error) => console.error(`Error preloading model${i}.glb:`, error)
        );
    }
}

preloadModels();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
