import {
    Color,
    LoadingManager,
    Mesh,
    MeshToonMaterial,
    PCFSoftShadowMap,
    TextureLoader,
    Timer,
    WebGLRenderer,
} from 'three';
import Stats from 'stats.js';
import './style.css';
import { addLights } from './addLights';
import { addHelpers } from './addHelpers';
import { getScene } from './getScene';
import { ProjectCamera } from './ProjectCamera';
// import { DummyModel } from './DummyModel';
import { CausticsMaterial } from './CausticsMaterial';
import { loadScene } from './loadScene';
import { getGui } from './getGui';

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

const gui = getGui();
const caustic1Folder = gui.addFolder('Caustic 1 Material');

const causticMaterial = new CausticsMaterial({
    scale: 2,
    speed: 0,
    color: new Color(0x50a8c0),
    seed: 0,
});

caustic1Folder.add(causticMaterial, 'uScale', 0.1, 10).name('Scale');
caustic1Folder.add(causticMaterial, 'uSpeed', 0, 5).name('Speed');
caustic1Folder.addColor(causticMaterial, 'uColor').name('Color');
caustic1Folder.add(causticMaterial, 'uSeed', 0, 100).name('Seed');

// TODO merge geometry to simplify mesh handling
// return to this once finished - https://youtu.be/olufmONG7-Q?si=eQdWeHjMMaFuJzs5&t=295
// const pointsNodeMaterial = new PointsNodeMaterial({
//     color: new Color(0xff0000),
// });

const textureLoader = new TextureLoader();

loadScene().then((loadedScene) => {
    loadedScene.traverse((child) => {
        const mesh = child as Mesh;
        if (!mesh.isMesh) return;

        if (mesh.name === 'Water') {
            mesh.material = causticMaterial;
        } else if (mesh.name === 'Landscape') {
            const toonMaterial = new MeshToonMaterial({
                color: 0x00bf15,
                gradientMap: textureLoader.load('/fiveTone.jpg'),
            });
            mesh.material = toonMaterial;
        }
    });
    scene.add(loadedScene);
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
