import { Color, LoadingManager, PCFSoftShadowMap, Timer, WebGLRenderer } from 'three';
import Stats from 'stats.js';
import './style.css';
import { addLights } from './addLights';
import { addHelpers } from './addHelpers';
import { getScene } from './getScene';
import { ProjectCamera } from './ProjectCamera';
// import { DummyModel } from './DummyModel';
import { CausticsMaterial } from './CausticsMaterial';
import { loadScene } from './loadScene';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
const scene = getScene();

const loadingManager = new LoadingManager(console.log, console.log, console.error);
void loadingManager; // to remind me it's here and to shut up linter about unused vars

addLights();

const causticMaterial = new CausticsMaterial({
    scale: 2,
    speed: 0,
    color: new Color(0x50a8c0),
    seed: 0,
});

loadScene().then((gltf) => {
    scene.add(gltf);
});

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
