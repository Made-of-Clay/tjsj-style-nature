// Van Gogh Shader Material for Three.js
// Integrates the Van Gogh fragment shader with Three.js

import { ShaderMaterial, Vector2, PlaneGeometry, Mesh, Clock } from 'three';
import vanGoghVert from './shaders/vangogh/vertex.glsl?raw';
import vanGoghFrag from './shaders/vangogh/vangogh.fragment.glsl?raw';

export class VanGoghShaderMaterial {
    material: ShaderMaterial;
    mesh: Mesh;
    clock: Clock;
    uniforms: Record<string, any>;

    constructor(
        width: number = window.innerWidth,
        height: number = window.innerHeight,
        vanGoghStrength: number = 0.8,
    ) {
        this.clock = new Clock();

        // Define uniforms
        this.uniforms = {
            u_resolution: { value: new Vector2(width, height) },
            u_time: { value: 0.0 },
            u_frame: { value: 0 },
            u_strength: { value: vanGoghStrength },
        };

        // Create shader material
        this.material = new ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vanGoghVert,
            fragmentShader: vanGoghFrag,
            side: 2, // THREE.BackSide
        });

        // Create full-screen quad
        const geometry = new PlaneGeometry(2, 2);
        this.mesh = new Mesh(geometry, this.material);
    }

    /**
     * Update uniforms each frame
     * Call this in your animation loop
     */
    update(): void {
        this.uniforms.u_time.value += this.clock.getDelta();
        this.uniforms.u_frame.value += 1;
    }

    /**
     * Resize handler for responsive canvas
     */
    resize(width: number, height: number): void {
        this.uniforms.u_resolution.value.set(width, height);
    }

    /**
     * Set Van Gogh effect strength (0.0 - 1.0)
     */
    setStrength(strength: number): void {
        this.uniforms.u_strength.value = Math.max(0, Math.min(1, strength));
    }

    /**
     * Dispose shader material and geometry
     */
    dispose(): void {
        this.material.dispose();
        this.mesh.geometry.dispose();
    }
}

/**
 * Example usage in main.ts:
 *
 * import { VanGoghShaderMaterial } from './VanGoghShaderMaterial';
 *
 * const vanGoghMaterial = new VanGoghShaderMaterial(
 *     window.innerWidth,
 *     window.innerHeight,
 *     0.8  // Van Gogh effect strength
 * );
 *
 * scene.add(vanGoghMaterial.mesh);
 *
 * // In animation loop:
 * function tick() {
 *     vanGoghMaterial.update();
 *     renderer.render(scene, camera);
 *     requestAnimationFrame(tick);
 * }
 *
 * // Handle window resize:
 * window.addEventListener('resize', () => {
 *     vanGoghMaterial.resize(window.innerWidth, window.innerHeight);
 * });
 */
