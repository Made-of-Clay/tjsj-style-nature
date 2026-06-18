import { Group, Object3DEventMap } from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export function loadScene(): Promise<Group<Object3DEventMap>> {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load('/models/forest.gltf', (gltf) => resolve(gltf.scene), undefined, reject);
    });
}
// https://i.pinimg.com/1200x/f7/12/4d/f7124d8a909b3a5e7a1fbc6f6e2804ba.jpg
