import {
    BufferAttribute,
    BufferGeometry,
    CanvasTexture,
    Points,
    PointsMaterial,
    Texture,
} from 'three';
import { GLTF } from 'three/examples/jsm/Addons.js';
import { isMesh } from './helpers/isMesh';

export function sampleTri(
    pos: BufferAttribute,
    idx: BufferAttribute,
    targetCount: number,
): Float32Array {
    const triCount = idx.count / 3;
    const out = new Float32Array(targetCount * 3);
    for (let i = 0; i < targetCount; i++) {
        const t = Math.floor(Math.random() * triCount) * 3;
        const i0 = idx.getX(t),
            i1 = idx.getX(t + 1),
            i2 = idx.getX(t + 2);
        const a = Math.random(),
            b = Math.random();
        const ra = a < b ? a : b,
            rb = a < b ? b : a; // sort to bias toward center
        const c0 = ra,
            c1 = rb - ra,
            c2 = 1 - rb;
        out[i * 3] = pos.getX(i0) * c0 + pos.getX(i1) * c1 + pos.getX(i2) * c2;
        out[i * 3 + 1] = pos.getY(i0) * c0 + pos.getY(i1) * c1 + pos.getY(i2) * c2;
        out[i * 3 + 2] = pos.getZ(i0) * c0 + pos.getZ(i1) * c1 + pos.getZ(i2) * c2;
    }
    return out;
}

export const DENSITY = 0.8; // target points per square unit

export function meshArea(pos: BufferAttribute, idx: BufferAttribute): number {
    let area = 0;
    const vx = new Float32Array(3),
        vy = new Float32Array(3),
        vz = new Float32Array(3);
    const e1 = new Float32Array(3),
        e2 = new Float32Array(3);
    const cross = new Float32Array(3);
    for (let i = 0; i < idx.count; i += 3) {
        for (let j = 0; j < 3; j++) {
            vx[j] = pos.getX(idx.getX(i + j));
            vy[j] = pos.getY(idx.getX(i + j));
            vz[j] = pos.getZ(idx.getX(i + j));
        }
        e1[0] = vx[1] - vx[0];
        e1[1] = vy[1] - vy[0];
        e1[2] = vz[1] - vz[0];
        e2[0] = vx[2] - vx[0];
        e2[1] = vy[2] - vy[0];
        e2[2] = vz[2] - vz[0];
        cross[0] = e1[1] * e2[2] - e1[2] * e2[1];
        cross[1] = e1[2] * e2[0] - e1[0] * e2[2];
        cross[2] = e1[0] * e2[1] - e1[1] * e2[0];
        area += Math.sqrt(cross[0] * cross[0] + cross[1] * cross[1] + cross[2] * cross[2]) * 0.5;
    }
    return area;
}

function createCircleTexture(color: string, size: number): Texture {
    // 1. Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new ReferenceError('Failed to get 2D context from canvas');

    // 2. Draw circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // 3. Create Three.js texture
    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export function convertToPoints(gltf: GLTF): Points {
    const allPos: number[] = [];

    gltf.scene.traverse((child) => {
        if (!isMesh(child)) return;
        const geo = child.geometry;
        const pos = geo.getAttribute('position');
        if (!pos) return;

        let idx: BufferAttribute = geo.getIndex() as BufferAttribute;
        if (!idx && pos.count >= 3) {
            const arr = pos.count > 65535 ? new Uint32Array(pos.count) : new Uint16Array(pos.count);
            for (let i = 0; i < pos.count; i++) arr[i] = i;
            idx = new BufferAttribute(arr, 1);
        }
        if (!idx) return;

        const area = meshArea(pos as BufferAttribute, idx);
        const count = Math.max(1, Math.floor(area * DENSITY));
        const samples = sampleTri(pos as BufferAttribute, idx, count);
        for (let i = 0; i < samples.length; i++) allPos.push(samples[i]);
    });

    const meshes: any[] = [];
    gltf.scene.traverse((child) => {
        // ignore if name is Landscape or Water
        if (child.name === 'Landscape' || child.name === 'Water') return;
        if (isMesh(child)) meshes.push(child);
    });
    for (const m of meshes) m.parent?.remove(m);

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(new Float32Array(allPos), 3));

    const mat = new PointsMaterial({
        size: 1,
        color: 0xe8d5b0,
        sizeAttenuation: true,

        // size: 20,
        map: createCircleTexture('#eeffee', 256), // Color and size
        transparent: true,
        depthWrite: false, // Critical for proper blending
    });
    // const mat = new PointsMaterial({
    //     size: 1,
    //     color: 0xe8d5b0,
    //     sizeAttenuation: true,
    // });

    const points = new Points(geo, mat);
    return points;
}
