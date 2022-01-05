import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import listen from "key-state";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Shaders
import skyboxVs from './glsl/skybox.vs.glsl';
import skyboxFs from './glsl/skybox.fs.glsl';

// Models & Textures
import { hovercarModel } from "./models/hovercar";
import cobblestoneTexture from "./assets/cobblestone.jpg";

// Skybox
import rt from './assets/meadow/meadow_rt.jpg'; //right
import lf from './assets/meadow/meadow_lf.jpg'; //left
import up from './assets/meadow/meadow_up.jpg'; //up
import dn from './assets/meadow/meadow_dn.jpg'; //down
import ft from './assets/meadow/meadow_ft.jpg'; //front
import bk from './assets/meadow/meadow_bk.jpg'; //back

// Uniforms
const cameraPositionUniform = {type: "v3", value: ""}; 
const skyboxCubeMapUniform = {type: 't', value: ""};

// Canvas
const canvas = document.querySelector('canvas.webgl');
const context = canvas.getContext('webgl2');

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Scene
const scene = new THREE.Scene();

// Camera (FOV, Aspect Ratio, Near Plane, Far plane)
const fov = 60;
const aspect = sizes.width / sizes.height;
const near = 1.0;
const far = 1000.0;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set( 0, 2, -5);
cameraPositionUniform.value = camera.position;

// Camera orbit controls
const controls = new OrbitControls(camera, canvas);
controls.damping = 0.2;
controls.autoRotate = true;
controls.maxDistance = 21;
controls.minDistance = 3;
controls.maxPolarAngle = 88 * (Math.PI/180); 

// Renderer
const container = document.createElement('div');
document.body.appendChild(container);
const renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(0X000000); // black background colour
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

//---------------------------------------------------------------------------------------------------------------
/**
 * OBJECTS
 */

const light = new THREE.AmbientLight( 0xffffff ); 
scene.add( light );

// Skybox
const skyboxCubemap = new THREE.CubeTextureLoader()
.load( [
  ft, //front
  bk, //back
  up, //up
  dn, //down
  rt, //right
  lf  //left
] );
skyboxCubemap.format = THREE.RGBFormat;
skyboxCubeMapUniform.value = skyboxCubemap;

const skyboxMaterial = new THREE.ShaderMaterial({ 
    uniforms: {
      cameraPos: cameraPositionUniform,
      skybox: skyboxCubeMapUniform
    },
    side: THREE.DoubleSide,
    vertexShader: skyboxVs,
    fragmentShader: skyboxFs,
    glslVersion: THREE.GLSL3
});

const skyboxGeometry = new THREE.BoxGeometry(400, 400, 400);
const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

// Floor
const textureLoader = new THREE.TextureLoader();
const cobblestone = textureLoader.load( cobblestoneTexture, (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set( 0, 0 );
    texture.repeat.set( 5, 5 );
} );
const planeGeometry = new THREE.PlaneGeometry(400, 400);
const planeMaterial = new THREE.MeshLambertMaterial({ map : cobblestone });
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.rotateX(- Math.PI / 2);
plane.translateZ(-50);

// Add object to the scene
scene.add(skybox);
scene.add(plane);

const gltfLoader = new GLTFLoader();
const hovercar = {model:""};

gltfLoader.parse(hovercarModel, undefined, (model) => {
    model.scene.position.set(0, -45, 0);
    model.scene.scale.set(10, 10, 10);
    scene.add(model.scene)
    hovercar.model = model.scene;
    hovercar.model.add(camera);
});

//---------------------------------------------------------------------------------------------------------------

// Shader Files

// Update projection matrix based on window size
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
});

// Listen to keyboard events.
const keyboard = listen(window);
function checkKeyboard() {
    if (keyboard.KeyW) {
        hovercar.model.translateZ(0.2);
    } else if (keyboard.KeyS) {
        hovercar.model.translateZ(-0.2);
    }

    if (keyboard.KeyA) {
        hovercar.model.rotateY(0.02);
    } else if (keyboard.KeyD) {
        hovercar.model.rotateY(-0.02);
    }
}


function updateMaterials() {
    skyboxMaterial.needsUpdate = true;
}

// Setup update callback
function update() {
    if (hovercar.model) {
        const carPosition = new THREE.Vector3();
        hovercar.model.getWorldPosition(carPosition);
        camera.lookAt(carPosition);
    }
    checkKeyboard();
    updateMaterials();
    requestAnimationFrame(update);
    renderer.render(scene, camera);
}

// Start the animation loop.
update();
