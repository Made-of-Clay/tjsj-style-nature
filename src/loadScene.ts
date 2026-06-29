import { Group, MeshBasicMaterial, Object3DEventMap, SRGBColorSpace, TextureLoader } from 'three';
import { DRACOLoader, GLTFLoader } from 'three/examples/jsm/Addons.js';

// const path = '/models/forest.gltf';
//const path = '/models/forest-join.gltf';
// const path = '/models/forest-join.gltf';
const path = '/models/forest.glb';
const textureLoader = new TextureLoader();

export function loadScene(): Promise<Group<Object3DEventMap>> {
    const dracoLoader = new DRACOLoader();
    // copied from threejs to public/draco -
    dracoLoader.setDecoderPath('/draco/');
    const bakedTexture = textureLoader.load('/models/baked.jpg');
    bakedTexture.flipY = false;
    bakedTexture.colorSpace = SRGBColorSpace;
    const bakedMat = new MeshBasicMaterial({ map: bakedTexture });
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        loader.load(path, (gltf) => {
            try {
                gltf.scene.traverse((child) => {
                    if ((child as any).isMesh && 'material' in child) child.material = bakedMat;
                    resolve(gltf.scene);
                });
            } catch (error) {
                reject(error);
            }
        });
    });
}
// https://i.pinimg.com/1200x/f7/12/4d/f7124d8a909b3a5e7a1fbc6f6e2804ba.jpg
