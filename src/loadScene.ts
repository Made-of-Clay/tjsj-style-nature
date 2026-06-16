import { Group, Mesh, MeshStandardMaterial, Object3DEventMap } from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export function loadScene(): Promise<Group<Object3DEventMap>> {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            '/models/forest.gltf',
            (gltf) => {
                const scene = gltf.scene;
                scene.traverse((child) => {
                    if ((child as Mesh).isMesh) {
                        const mesh = child as Mesh;
                        mesh.material = new MeshStandardMaterial({ color: 0xaaaaaa });
                    }
                });
                resolve(scene);
            },
            undefined,
            reject,
        );
    });
}
