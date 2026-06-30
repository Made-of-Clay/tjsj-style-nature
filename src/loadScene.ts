import { Group, Object3DEventMap } from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { convertToPoints } from './convertToPoints';

const path = '/models/forest-join2.gltf';
// const path = '/models/forest.glb';

export function loadScene(): Promise<Group<Object3DEventMap>> {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(path, (gltf) => {
            try {
                const points = convertToPoints(gltf);
                gltf.scene.add(points);
                resolve(gltf.scene);
            } catch (error) {
                reject(error);
            }
        });
    });
}
