import { LoadingManager, PCFSoftShadowMap, WebGLRenderer } from 'three';
import Stats from 'stats.js';
import './style.css';
import { addLights } from './addLights';
import { addHelpers } from './addHelpers';
import { getScene } from './getScene';
import { ProjectCamera } from './ProjectCamera';
import { DummyModel } from './DummyModel';

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

const dummyModel = new DummyModel();
dummyModel.ready.then(() => {
    if (dummyModel.model) {
        scene.add(dummyModel.model);
    }
});

const camera = new ProjectCamera(canvas);
scene.add(camera.instance);

addHelpers();

// ===== 📈 STATS & CLOCK =====
const stats = new Stats();
document.body.appendChild(stats.dom);

function tick() {
    requestAnimationFrame(tick);

    stats.begin();

    camera.tick(renderer);

    renderer.render(scene, camera.instance);
    stats.end();
}

tick();
