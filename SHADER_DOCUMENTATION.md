# Van Gogh Shader: Effect Implementation Guide

## Overview

This shader converts a procedurally-generated coastal landscape into a Van Gogh-inspired artistic style. It combines scene generation with artistic stylization techniques to create an oil-painting effect.

## Scene Elements

### 1. **Sky & Sun**

- Radial gradient from sun position (0.3, -0.53)
- Multi-layer glow: outer halo + inner bright core
- Dynamic palette based on distance from sun
- IQ's palette function for smooth color transitions

### 2. **Clouds**

- Perlin noise-based cloud generation
- Time-based animation for drifting effect
- Smooth transitions via smoothstep for soft edges
- Opacity modulation for layering

### 3. **Water**

- Sinusoidal wave pattern (frequency: 12, speed: 3)
- Dual-color blending: deep blue + sandy yellow
- Ripple effects with secondary frequency
- Animated caustic-like patterns

### 4. **Grass Hill**

- Procedural grass blade rendering
- Individual blade animation with wind effect
- Color cycling: green ↔ yellow over time
- 60×scale grid with random variations per blade

### 5. **Tree**

- **Trunk**: Bending trunk with wind sway, curvature noise
- **Foliage**: 4 layers of circular crowns with overlap
- Leaf rippling animation based on wind
- Dynamic color based on layer depth and time

## Van Gogh Stylization Effects

### **Oil Painting Effect**

The stylization works through gradient-based directional flow:

```glsl
// Calculate gradients in R, G, B channels
vec3 gradX = (colorRight - colorLeft) / delta;
vec3 gradY = (colorDown - colorUp) / delta;

// Compute dominant stroke direction
float strokeDir = atan(gradY.g, gradX.r);

// Apply directional sampling offset
vec2 strokeOffset = vec2(cos(strokeDir), sin(strokeDir)) * 0.01;
```

### **Key Stylization Techniques**

1. **Directional Stroke Synthesis**
    - Multi-scale gradient analysis
    - Stroke direction derived from color transitions
    - Offset sampling creates brush stroke appearance

2. **Color Posterization**
    - Quantizes colors to discrete levels (8 levels default)
    - Reduces smooth gradients to bold, flat color regions
    - Creates the characteristic "block" appearance

3. **Edge Enhancement**
    - Strong gradients get emphasized
    - `edgeStrength = length(gradX) + length(gradY)`
    - Adds bold contours typical of Van Gogh's style

4. **Texture & Grain**
    - Hash-based procedural noise
    - Adds subtle canvas texture
    - Varies per frame for slight animation

5. **Vignette**
    - Darkens edges: `result *= (1.0 - length(vignette) * 0.3)`
    - Draws focus to center
    - Adds depth perception

## Uniforms

| Uniform        | Type    | Purpose                | Range   |
| -------------- | ------- | ---------------------- | ------- |
| `u_resolution` | `vec2`  | Canvas dimensions      | Dynamic |
| `u_time`       | `float` | Elapsed time (seconds) | 0.0+    |
| `u_frame`      | `int`   | Frame counter          | 0+      |
| `u_strength`   | `float` | Van Gogh effect blend  | 0.0-1.0 |

## Customization Guide

### Adjust Van Gogh Intensity

```glsl
// Higher = more stylized, lower = more realistic
finalColor = mix(baseColor, vanGoghEffect(...), u_strength);
```

- `0.0` = Pure scene (no stylization)
- `0.5` = Balanced artistic + realistic
- `1.0` = Maximum Van Gogh effect

### Modify Stroke Scale

In `vanGoghEffect()`, adjust the offset magnitude:

```glsl
vec2 strokeOffset = vec2(cos(strokeDir), sin(strokeDir)) * 0.01;  // Current: 0.01
// Larger values = bolder strokes
// Smaller values = finer detail
```

### Change Color Quantization Levels

```glsl
float levels = 8.0;  // Current: 8
result = floor(result * levels) / levels;
// Higher = more colors (less posterized)
// Lower = fewer colors (more posterized)
```

### Adjust Wave Animation Speed

In `renderWater()`:

```glsl
float wave = sin(uv.x * 12.0 - time * 3.0) * 0.25;  // time * 3.0
// Higher multiplier = faster waves
```

### Modify Grass Wind Effect

In `renderGrass()`:

```glsl
float windWave = sin(time * 1.7 + bladeSeed * 2.0 + uv.x * 5.0) * 0.3;  // time * 1.7
// Higher = faster wind sway
```

### Adjust Tree Sway

In `renderTreeTrunk()` and `renderTreeFoliage()`:

```glsl
float swing = sin(time * 0.5);  // time * 0.5
// Higher = faster tree movement
```

## Performance Considerations

### Current Complexity

- Multiple procedural noise evaluations
- Multi-sample gradient computation
- 4-layer foliage rendering
- Multiple hash function calls

### Optimization Techniques (if needed)

1. **Reduce sampling in `vanGoghEffect()`**

    ```glsl
    // Skip every other frame for gradient computation
    if (mod(u_frame, 2.0) < 1.0) { /* compute gradients */ }
    ```

2. **Simplify noise functions**
    - Use value noise instead of gradient noise
    - Reduce octaves in fractal Brownian motion

3. **LOD (Level of Detail) for distance**
    - Disable small details when far from camera

4. **Memoize computations**
    - Cache repeated noise calls with frame-based checks

## Animation Loops

The shader contains several animation cycles:

- **Tree swing**: ~12.6 seconds per cycle (sin(time \* 0.5))
- **Grass color**: ~31.4 seconds per cycle (sin(time \* 0.2))
- **Water waves**: ~2.1 seconds per cycle (sin(time \* 3.0))
- **Cloud drift**: ~62.8 seconds per cycle (sin(time \* 0.1))

## Van Gogh Inspiration

This shader captures the essence of Van Gogh's style through:

✓ **Bold, directional brushstrokes** - Via gradient-based flow  
✓ **Vibrant color blocks** - Through posterization  
✓ **Swirling, dynamic movement** - Wind/wave animations  
✓ **Thick impasto effect** - Directional offset sampling  
✓ **Limited color palette** - 8-level quantization  
✓ **Emotional intensity** - Strong gradients + enhanced edges

## Usage Example

```typescript
import { VanGoghShaderMaterial } from "./VanGoghShaderMaterial";

const material = new VanGoghShaderMaterial(
    window.innerWidth,
    window.innerHeight,
    0.85, // 85% Van Gogh stylization
);

scene.add(material.mesh);

// Animation loop
function animate() {
    material.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Responsive
window.addEventListener("resize", () => {
    material.resize(window.innerWidth, window.innerHeight);
});
```

## Troubleshooting

**Issue**: Colors too muted  
**Solution**: Reduce `u_strength` or increase edge enhancement coefficient

**Issue**: Animation too fast  
**Solution**: Divide time multipliers by 2-3x

**Issue**: Strokes look disconnected  
**Solution**: Increase `strokeOffset` magnitude in `vanGoghEffect()`

**Issue**: Performance issues  
**Solution**: See Optimization Techniques section above

## References

- Inigo Quilez - Color Palettes: https://iquilezles.org/www/articles/palettes/
- The Book of Shaders - Perlin Noise: https://thebookofshaders.com/
- "The Algorithmic Beauty of Plants" concepts applied to shader design
- Van Gogh's "Starry Night" and "Wheatfield" stylistic analysis
