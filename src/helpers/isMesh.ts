import { BufferGeometry } from 'three';

export function isMesh(object: any): object is { geometry: BufferGeometry } {
    return object && object.isMesh && object.geometry instanceof BufferGeometry;
}
