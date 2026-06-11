// INTEGRATION GUIDE: Van Gogh Shader in main.ts
// Replace or augment existing Three.js scene setup

import { LoadingManager, PCFSoftShadowMap, WebGLRenderer, Scene, OrthographicCamera } from 'three';
import Stats from 'stats.js';
import './style.css';
import { ProjectCamera } from './ProjectCamera';
import { VanGoghShaderMaterial } from './VanGoghShaderMaterial';

// ===== SETUP =====
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

// Scene for fullscreen shader
const scene = new Scene();

// Stats for performance monitoring
const stats = new Stats();
document.body.appendChild(stats.dom);

// ===== VAN GOGH SHADER SETUP =====

// Create Van Gogh shader material
const vanGoghMaterial = new VanGoghShaderMaterial(
    window.innerWidth,
    window.innerHeight,
    0.8, // Van Gogh effect strength (0.0 - 1.0)
);

// Add to scene
scene.add(vanGoghMaterial.mesh);

// Orthographic camera for fullscreen quad
const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
camera.position.z = 100;

// ===== EVENT HANDLERS =====

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    vanGoghMaterial.resize(width, height);
});

// Keyboard controls for Van Gogh intensity
window.addEventListener('keydown', (e) => {
    if (e.key === '+' || e.key === '=') {
        const current = vanGoghMaterial.uniforms.u_strength.value;
        vanGoghMaterial.setStrength(current + 0.1);
        console.log(`Van Gogh strength: ${(current + 0.1).toFixed(2)}`);
    }
    if (e.key === '-' || e.key === '_') {
        const current = vanGoghMaterial.uniforms.u_strength.value;
        vanGoghMaterial.setStrength(current - 0.1);
        console.log(`Van Gogh strength: ${(current - 0.1).toFixed(2)}`);
    }
});

// ===== ANIMATION LOOP =====
function tick() {
    requestAnimationFrame(tick);

    stats.begin();

    // Update shader uniforms
    vanGoghMaterial.update();

    // Render
    renderer.render(scene, camera);

    stats.end();
}

// Initial size
renderer.setSize(window.innerWidth, window.innerHeight);

// Start animation loop
tick();

// ===== OPTIONAL: DEBUG INFO =====
console.log('%cVan Gogh Shader Active', 'color: #FFD700; font-size: 16px; font-weight: bold;');
console.log('Controls:');
console.log('  [+] Increase Van Gogh effect');
console.log('  [-] Decrease Van Gogh effect');
console.log('  Check console for current strength');
