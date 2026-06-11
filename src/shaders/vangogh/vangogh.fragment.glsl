// Van Gogh Style Shader for Three.js
// Coastal landscape with oil painting effect
// Combines: sky, sun, clouds, water, grass, tree with Van Gogh stylization

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform int u_frame;
uniform float u_strength; // Van Gogh effect strength (0.0 - 1.0)

varying vec2 vUv;

// ===== NOISE & HASHING =====

// Hash without Sine by Dave_Hoskins
float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

// Gradient noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(
        mix(dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
            dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
            dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}

// ===== UTILITY FUNCTIONS =====

mat2 rotate2D(vec2 v, float a) {
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
}

float smoothBar(float a, float b, float s) {
    return smoothstep(a - s, a + s, b);
}

// IQ's palette function
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

vec3 skyPalette(float t) {
    return palette(t, vec3(0.26, 0.76, 0.77), vec3(1.0, 0.3, 1.0), 
                   vec3(0.8, 0.4, 0.7), vec3(0.0, 0.12, 0.54));
}

vec3 hue(float v) {
    return cos(6.3 * v + vec3(0.0, 23.0, 21.0)) * 0.76 + 0.6;
}

// ===== SCENE GENERATION =====

// Sky and sun
vec3 renderSky(vec2 uv, float time) {
    float sunDist = length(uv - vec2(0.3, -0.53));
    
    // Sun glow
    vec3 sun = vec3(1.0, 0.9, 0.2) * exp(-sunDist * 5.0) * 0.5;
    sun += vec3(1.0, 0.7, 0.0) * exp(-sunDist * 3.0) * 0.3;
    
    // Sky color
    vec3 sky = skyPalette(sin(sunDist - 0.1) * 0.35);
    
    return mix(sky, sun, smoothstep(0.3, 0.0, sunDist));
}

// Clouds
vec3 renderClouds(vec2 uv, float time) {
    float cloudNoise = noise(uv * 2.0 + vec2(time * 0.1, 0.0));
    cloudNoise = smoothstep(0.3, 0.7, cloudNoise);
    
    vec3 cloudColor = vec3(0.9, 0.9, 0.95);
    return mix(vec3(0.0), cloudColor, cloudNoise * 0.4);
}

// Water with waves
vec3 renderWater(vec2 uv, float time) {
    float wave = sin(uv.x * 12.0 - time * 3.0) * 0.25;
    vec3 waterColor = mix(vec3(0.0, 0.1, 0.5), vec3(0.35, 0.35, 0.0), 0.3);
    
    // Wave ripples
    float ripple = sin(uv.x * 6.0 + time * 2.0) * 0.1;
    waterColor += ripple * vec3(0.1, 0.15, 0.2);
    
    return waterColor;
}

// Grass
vec3 renderGrass(vec2 uv, float time) {
    vec3 grassBase = mix(vec3(0.7, 0.6, 0.2), vec3(0.0, 1.0, 0.0), 
                         sin(time * 0.2) * 0.5 + 0.5);
    
    // Grass blade details
    float bladeSeed = hash12(floor(uv * 60.0));
    vec2 bladePos = fract(uv * 60.0);
    
    // Wind animation
    float windWave = sin(time * 1.7 + bladeSeed * 2.0 + uv.x * 5.0) * 0.3;
    bladePos.x += windWave;
    
    // Blade shape
    float blade = length(bladePos - vec2(0.5, 0.3)) < 0.15 ? 1.0 : 0.0;
    blade *= sin(bladePos.y * 10.0);
    
    return mix(grassBase * 0.4, grassBase * 1.2, blade);
}

// Tree trunk
vec3 renderTreeTrunk(vec2 uv, float time) {
    float t = uv.y;
    float swing = sin(time * 0.5);
    uv.x += sin(uv.y + 1.0) * 0.2 * (swing + 0.75);
    
    // Trunk curvature
    uv += noise(uv * 4.5 - 7.0) * 0.25;
    
    // Trunk shape
    float trunk = abs(uv.x) < 0.08 && uv.y > -1.0 && uv.y < 0.5 ? 1.0 : 0.0;
    trunk *= smoothstep(0.08, 0.0, abs(uv.x));
    
    return mix(vec3(0.07), vec3(0.5, 0.3, 0.0), trunk) * (0.4 + hash12(floor(uv * 10.0)) * 0.4);
}

// Tree foliage
vec3 renderTreeFoliage(vec2 uv, float time) {
    vec3 foliage = vec3(0.0);
    float swing = sin(time * 0.5);
    
    // Multiple layers of foliage
    for (float layer = 0.0; layer < 4.0; layer += 1.0) {
        vec2 foliagePos = uv + vec2(layer * 0.15 - (swing + 0.75) * 0.15, -0.7);
        
        // Wind ripple on leaves
        foliagePos += noise(foliagePos * 2.0 + vec2(-time + layer * 0.05, 0.0)) * 
                      vec2(-0.25, 0.1) * smoothstep(0.5, -1.0, foliagePos.y + 0.7) * 0.75;
        
        // Foliage shape - circular
        float dist = length(foliagePos);
        float foil = smoothstep(0.5, 0.3, dist);
        
        // Color variation
        float colorSeed = hash12(foliagePos + layer);
        vec3 foilColor = hue((colorSeed + sin(time * 0.2) * 0.5 + 0.5) * 0.2) * (0.7 + layer * 0.2);
        
        foliage = mix(foliage, foilColor, foil * 0.5);
    }
    
    return foliage;
}

// ===== SCENE COMPOSITION =====

vec3 renderScene(vec2 uv) {
    float time = u_time;
    vec3 color = vec3(0.0);
    
    // Normalize UV coordinates
    vec2 resolution = u_resolution;
    uv = (uv * 2.0 - 1.0);
    uv.x *= resolution.x / resolution.y;
    
    // Sky, sun, and clouds
    if (uv.y > -0.4) {
        color = renderSky(uv, time);
        color += renderClouds(uv, time);
    }
    
    // Water
    if (uv.y < -0.35 && uv.y > -1.0) {
        color = renderWater(uv, time);
    }
    
    // Grass
    if (uv.y < 0.0 && uv.y > -0.5) {
        color = mix(color, renderGrass(uv, time) * 0.4, 0.6);
    }
    
    // Tree (positioned on grass)
    if (abs(uv.x + 0.3) < 0.5 && uv.y > -0.4 && uv.y < 0.3) {
        color = mix(color, renderTreeTrunk(uv + vec2(0.3, 0.0), time), 0.7);
        color = mix(color, renderTreeFoliage(uv + vec2(0.3, 0.0), time), 0.7);
    }
    
    return color;
}

// ===== VAN GOGH EFFECT =====

// Oil painting effect via gradient-based stroke direction
vec3 vanGoghEffect(vec2 uv, vec3 baseColor) {
    // Calculate local gradients
    float delta = 1.0 / u_resolution.y;
    
    vec3 colorLeft = renderScene(uv - vec2(delta, 0.0));
    vec3 colorRight = renderScene(uv + vec2(delta, 0.0));
    vec3 colorUp = renderScene(uv - vec2(0.0, delta));
    vec3 colorDown = renderScene(uv + vec2(0.0, delta));
    
    // Gradient vectors
    vec3 gradX = colorRight - colorLeft;
    vec3 gradY = colorDown - colorUp;
    
    // Directional flow for brush strokes
    float strokeDir = atan(gradY.g, gradX.r);
    
    // Apply directional distortion
    vec2 strokeOffset = vec2(cos(strokeDir), sin(strokeDir)) * 0.01;
    
    // Multi-scale sampling for painterly effect
    vec3 paint1 = renderScene(uv + strokeOffset);
    vec3 paint2 = renderScene(uv - strokeOffset * 0.7);
    
    // Blend with posterization for Van Gogh style
    vec3 result = mix(baseColor, paint1, 0.3) + paint2 * 0.2;
    
    // Color quantization for oil paint effect
    float levels = 8.0;
    result = floor(result * levels) / levels;
    
    // Add edge enhancement for bold strokes
    float edgeStrength = length(gradX) + length(gradY);
    result += edgeStrength * 0.1;
    
    return result;
}

// ===== MAIN =====

void main() {
    // Get fragment position
    vec2 fragCoord = vUv * u_resolution;
    vec2 uv = vUv;
    
    // Render base scene
    vec3 baseColor = renderScene(uv);
    
    // Apply Van Gogh effect
    vec3 finalColor = mix(baseColor, vanGoghEffect(uv, baseColor), u_strength);
    
    // Add slight vignette for depth
    vec2 vignette = uv - vec2(0.5);
    finalColor *= (1.0 - length(vignette) * 0.3);
    
    // Subtle noise for texture
    finalColor += (hash12(uv + u_time * 0.1) - 0.5) * 0.05;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
