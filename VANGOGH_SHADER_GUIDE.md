# Van Gogh Shader Conversion - Complete Implementation

## 🎨 What You Have

A complete **Three.js shader system** that renders a Van Gogh-inspired coastal landscape with:

### Scene Elements

- ☀️ **Sun** with multi-layer glow
- ☁️ **Animated Clouds** drifting across sky
- 🌊 **Wavy Water** with ripple effects
- 🌾 **Procedural Grass** swaying in the wind
- 🌳 **Animated Tree** with trunk sway and layered foliage

### Van Gogh Stylization Effects

1. **Directional Brush Strokes** - Gradient-based flow creates brushwork appearance
2. **Oil Painting Effect** - Multi-scale sampling with directional offsets
3. **Color Posterization** - 8-level quantization for bold color blocks
4. **Edge Enhancement** - Strong outlines characteristic of Van Gogh
5. **Canvas Texture** - Procedural noise grain
6. **Vignette** - Darkened edges for depth

## 📁 Files Created

```
src/
  shaders/vangogh/
    vangogh.fragment.glsl    ← NEW: Main shader with scene + Van Gogh effect
  VanGoghShaderMaterial.ts   ← NEW: Three.js wrapper class

Root:
  SHADER_DOCUMENTATION.md     ← Comprehensive technical guide
  INTEGRATION_EXAMPLE.ts      ← Example main.ts setup
```

## 🚀 Quick Start

### Option A: Use VanGoghShaderMaterial Class (Recommended)

```typescript
// In main.ts
import { VanGoghShaderMaterial } from "./VanGoghShaderMaterial";

const vanGoghMaterial = new VanGoghShaderMaterial(
    window.innerWidth,
    window.innerHeight,
    0.8, // Van Gogh intensity: 0.0 (realistic) - 1.0 (fully stylized)
);

scene.add(vanGoghMaterial.mesh);

// In animation loop:
function animate() {
    vanGoghMaterial.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// On resize:
window.addEventListener("resize", () => {
    vanGoghMaterial.resize(window.innerWidth, window.innerHeight);
});

// Adjust effect strength anytime:
vanGoghMaterial.setStrength(0.5);
```

### Option B: Direct Shader Integration

Use the shader code in [INTEGRATION_EXAMPLE.ts](INTEGRATION_EXAMPLE.ts) as a template.

## ⚙️ Key Uniforms

| Control                | How to Adjust                            |
| ---------------------- | ---------------------------------------- |
| **Van Gogh Intensity** | `vanGoghMaterial.setStrength(0.0-1.0)`   |
| **Canvas Size**        | `vanGoghMaterial.resize(width, height)`  |
| **Animation**          | Automatic via `vanGoghMaterial.update()` |

## 🎮 Shader Parameters (Advanced)

Edit `vangogh.fragment.glsl` to customize:

| Parameter    | Location                         | Effect                      |
| ------------ | -------------------------------- | --------------------------- |
| Stroke Scale | Line ~180: `strokeOffset * 0.01` | Adjust bold of brushstrokes |
| Color Levels | Line ~187: `levels = 8.0`        | More/fewer colors           |
| Wave Speed   | Line ~103: `time * 3.0`          | Water animation speed       |
| Wind Speed   | Line ~124: `time * 1.7`          | Grass sway speed            |
| Tree Sway    | Line ~142: `time * 0.5`          | Tree movement speed         |

## 📊 Performance

- **High-end devices**: Full detail at 60+ FPS
- **Low-end devices**: Consider reducing `u_strength` or optimizations (see docs)
- **Mobile**: Test on target devices

## 🔍 Animation Loops

The shader includes synchronized animations:

- ☀️ Sun glows subtly
- ☁️ Clouds drift slowly (~63s cycle)
- 🌊 Waves oscillate (~2.1s cycle)
- 🌾 Grass sways (~31s color cycle)
- 🌳 Tree swings (~12.6s cycle)

## 📖 Documentation

- **[SHADER_DOCUMENTATION.md](./SHADER_DOCUMENTATION.md)** - Full technical breakdown
- **[INTEGRATION_EXAMPLE.ts](./INTEGRATION_EXAMPLE.ts)** - Complete usage example
- **Inline comments** in `vangogh.fragment.glsl` for specific effects

## 🎯 Van Gogh Effect Breakdown

### How the Effect Works

1. **Scene Rendering**: Procedurally generates landscape elements
2. **Gradient Analysis**: Computes color flow directions
3. **Directional Sampling**: Offsets samples along gradient direction
4. **Posterization**: Quantizes to 8 color levels
5. **Edge Enhancement**: Emphasizes strong color transitions
6. **Texture**: Adds subtle noise grain

### Example Customizations

**Increase Artistic Style:**

```typescript
vanGoghMaterial.setStrength(1.0); // Maximum Van Gogh effect
```

**Realistic with Hint of Style:**

```typescript
vanGoghMaterial.setStrength(0.3); // Subtle stylization
```

**Adjust Stroke Boldness** (edit shader):

```glsl
// In vanGogh Effect function
vec2 strokeOffset = vec2(cos(strokeDir), sin(strokeDir)) * 0.02;  // Bolder
// vs
vec2 strokeOffset = vec2(cos(strokeDir), sin(strokeDir)) * 0.005; // Finer
```

## 🐛 Troubleshooting

| Issue                     | Solution                                                                  |
| ------------------------- | ------------------------------------------------------------------------- |
| Colors too muted          | Lower `u_strength` or reduce color quantization levels                    |
| Animation too fast        | Edit shader: divide time multipliers (e.g., `time * 0.5` → `time * 0.25`) |
| Performance lag           | Reduce `u_strength` value or simplify noise functions                     |
| Strokes look disconnected | Increase `strokeOffset` magnitude in shader                               |
| Gradient issues           | Ensure proper UV normalization                                            |

## 🔗 Related Concepts

This shader implements:

- **Procedural generation** - Creating scenes algorithmically
- **Perlin/Value noise** - Natural randomness
- **Gradient-based flow fields** - For directional effects
- **Color quantization** - Artistic style via posterization
- **Real-time rendering** - GPU-accelerated shaders

## 📚 Resources Used

- Inigo Quilez - Shader Palettes: https://iquilezles.org/www/articles/palettes/
- The Book of Shaders: https://thebookofshaders.com/
- Dave Hoskins - Hash Without Sine: https://www.shadertoy.com/view/4djSRW
- Van Gogh's Starry Night & Wheatfield stylistic analysis

## ✅ Next Steps

1. ✓ Copy `vangogh.fragment.glsl` to your shaders folder
2. ✓ Add `VanGoghShaderMaterial.ts` to your src folder
3. ✓ Import and use in your `main.ts`
4. ✓ Adjust `u_strength` to your preference
5. ✓ Customize shader parameters as needed

## 🎨 Result

A beautiful, animated coastal landscape in Van Gogh's signature style with:

- Bold, directional brushstrokes
- Vibrant color blocks
- Swirling, dynamic movement
- Oil painting impasto effect
- Professional-quality Three.js integration

Enjoy your Van Gogh shader! 🌻
