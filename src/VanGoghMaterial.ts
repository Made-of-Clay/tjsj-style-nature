// Van Gogh Material for Three.js Objects
import { ShaderMaterial, Texture, Color } from 'three';
import vanGoghObjectVert from './shaders/vangogh/object.vertex.glsl?raw';
import vanGoghObjectFrag from './shaders/vangogh/object.fragment.glsl?raw';

export class VanGoghMaterial extends ShaderMaterial {
    private time: number = 0;

    constructor(
        options: {
            map?: Texture;
            color?: Color | string | number;
            strength?: number;
            posterize?: number;
        } = {},
    ) {
        super({
            uniforms: {
                map: { value: options.map || null },
                u_color: { value: new Color(options.color || 0x888888) },
                u_strength: { value: options.strength ?? 0.8 },
                u_posterize: { value: options.posterize ?? 8.0 },
                u_time: { value: 0.0 },
            },
            vertexShader: vanGoghObjectVert,
            fragmentShader: vanGoghObjectFrag,
        });
    }

    tick(deltaTime: number): void {
        this.time += deltaTime;
        this.uniforms.u_time.value = this.time;
    }

    setStrength(strength: number): void {
        this.uniforms.u_strength.value = Math.max(0, Math.min(1, strength));
    }

    setPosterize(levels: number): void {
        this.uniforms.u_posterize.value = levels;
    }

    setColor(color: Color | string | number): void {
        this.uniforms.u_color.value.set(color);
    }
}
