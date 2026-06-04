import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Object3DEventMap } from 'three/src/core/Object3D.js';

export class DummyModel {
    ready: Promise<void>;
    model: Group<Object3DEventMap> | null = null;

    constructor() {
        // loads gltf model from three.js and exposes .model; also exposes .ready promise
        // maybe tick() method for animations
        // "/models/demo-scene.gltf"
        const gltfLoader = new GLTFLoader();
        this.ready = new Promise((resolve, reject) => {
            gltfLoader.load(
                '/models/demo-scene.gltf',
                (gltf) => {
                    this.model = gltf.scene;
                    resolve();
                },
                undefined, // maybe progress loader bar; TODO handle later
                reject,
            );
        });
    }

    // tick() {} // maybe
}
