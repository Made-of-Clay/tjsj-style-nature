import {
    Color,
    LoadingManager,
    Mesh,
    MeshStandardMaterial,
    PCFSoftShadowMap,
    SphereGeometry,
    Timer,
    WebGLRenderer,
} from 'three';
import Stats from 'stats.js';
import './style.css';
import { addLights } from './addLights';
import { addHelpers } from './addHelpers';
import { getScene } from './getScene';
// import { caustics } from 'tsl-textures';
import { caustics } from './tsl/caustics';
import { ProjectCamera } from './ProjectCamera';
import { DummyModel } from './DummyModel';
import { MeshStandardNodeMaterial } from 'three/webgpu';
import { CausticsMaterial } from './CausticsMaterial';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
const scene = getScene();

const loadingManager = new LoadingManager(console.log, console.log, console.error);
console.log('loading mngr', loadingManager);

addLights();

const causticMaterial = new CausticsMaterial({
    scale: 2,
    speed: 0,
    color: new Color(0x50a8c0),
    seed: 0,
});

// Model
const dummyModel = new DummyModel();
dummyModel.ready.then(() => {
    if (dummyModel.model) {
        // find suzanne an dapply causticMaterial
        const suzanne = dummyModel.model.getObjectByName('Suzanne');
        if (suzanne) {
            suzanne.material = causticMaterial;
        }
        // const plane = dummyModel.model.getObjectByName('Plane');
        // if (plane) {
        //     plane.material = causticMaterial;
        // }
        scene.add(dummyModel.model);
    }
});

const objMaterial = new MeshStandardNodeMaterial({
    color: 0xcccccc,
    roughness: 0.5,
    metalness: 0.0,
});
objMaterial.colorNode = caustics({
    scale: 2,
    speed: 0,
    color: new Color(0x50a8c0),
    seed: 0,
});

console.log('objMaterial', objMaterial);
// const experimentalSphere = new Mesh(new SphereGeometry(1, 32, 32), objMaterial);
const experimentalSphere = new Mesh(new SphereGeometry(1, 32, 32), new MeshStandardMaterial());
// const experimentalSphere = new Mesh(new SphereGeometry(1, 32, 32), causticMaterial);
experimentalSphere.position.set(0, 0, 3);
scene.add(experimentalSphere);

const camera = new ProjectCamera(canvas);
scene.add(camera.instance);

addHelpers();

// ===== 📈 STATS & CLOCK =====
const stats = new Stats();
document.body.appendChild(stats.dom);

const timer = new Timer();

function tick() {
    requestAnimationFrame(tick);

    timer.update();
    const deltaTime = timer.getDelta();
    causticMaterial.tick(deltaTime);
    stats.begin();

    camera.tick(renderer);

    renderer.render(scene, camera.instance);
    stats.end();
}

tick();
