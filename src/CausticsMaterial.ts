import { Color, ShaderMaterial } from 'three';
import causticsVert from './shaders/caustics/vertex.glsl?raw';
import causticsFrag from './shaders/caustics/fragment.glsl?raw';

export class CausticsMaterial extends ShaderMaterial {
    #time = 0;

    constructor(
        options: {
            color?: Color | string | number;
            scale?: number;
            speed?: number;
            seed?: number;
        } = {},
    ) {
        super({
            uniforms: {
                uTime: { value: 0.0 },
                uScale: { value: options.scale ?? 2.0 },
                uSpeed: { value: options.speed ?? 0.0 },
                uColor: { value: new Color(options.color ?? 0x50a8c0) },
                uSeed: { value: options.seed ?? 0.0 },
            },
            vertexShader: causticsVert,
            fragmentShader: causticsFrag,
            transparent: true,
            depthWrite: false,
        });
    }

    tick(deltaTime: number): void {
        this.#time += deltaTime;
        this.uniforms.uTime.value = this.#time;
    }

    get uScale() {
        return this.uniforms.uScale.value;
    }
    set uScale(scale: number) {
        this.uniforms.uScale.value = scale;
    }

    get uSpeed() {
        return this.uniforms.uSpeed.value;
    }
    set uSpeed(speed: number) {
        this.uniforms.uSpeed.value = speed;
    }

    get uColor() {
        return this.uniforms.uColor.value;
    }
    set uColor(color: Color | string | number) {
        this.uniforms.uColor.value.set(color);
    }

    get uSeed() {
        return this.uniforms.uSeed.value;
    }
    set uSeed(seed: number) {
        this.uniforms.uSeed.value = seed;
    }
}
