// Van Gogh Object Shader - Apply stylization to any Three.js geometry
precision highp float;

uniform sampler2D map;
uniform vec3 u_color;
uniform float u_strength;
uniform float u_time;
uniform float u_posterize;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

// Hash for texture
float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

// Edge detection via normal discontinuity
float detectEdges(vec3 normal) {
    vec3 dx = dFdx(normal);
    vec3 dy = dFdy(normal);
    return length(cross(dx, dy));
}

// Van Gogh stylization
vec3 applyVanGogh(vec3 baseColor, vec2 uv, vec3 normal) {
    // Directional flow from normal variation
    vec3 dx = dFdx(normal);
    vec3 dy = dFdy(normal);
    float flowDir = atan(length(dy), length(dx));
    
    // Stroke-aligned sampling
    vec2 offset = vec2(cos(flowDir), sin(flowDir)) * 0.01;
    vec3 sample1 = baseColor + textureOffset(map, uv + offset, ivec2(0, 0)).rgb * 0.1;
    vec3 sample2 = baseColor + textureOffset(map, uv - offset * 0.7, ivec2(0, 0)).rgb * 0.1;
    
    vec3 stroked = mix(baseColor, sample1, 0.3) + sample2 * 0.2;
    
    // Posterize to levels
    float levels = u_posterize;
    stroked = floor(stroked * levels) / levels;
    
    // Edge enhancement
    float edges = detectEdges(normal);
    stroked += edges * 0.15;
    
    // Canvas texture
    stroked += (hash21(uv + u_time * 0.1) - 0.5) * 0.3;
    
    return stroked;
}

void main() {
    // Base color from texture or uniform
    // vec3 color = texture2D(map, vUv).rgb;
    // if (length(color) < 0.01) color = u_color;
    
    // // Apply Van Gogh effect
    // vec3 stylized = applyVanGogh(color, vUv, normalize(vNormal));
    // // vec3 stylized = vec3(0.0);
    
    // // Blend with strength
    // vec3 final = mix(color, stylized, u_strength);
    
    // gl_FragColor = vec4(final, 1.0);
    gl_FragColor = vec4(0.0, 0.5, 1.0, 1.0);
}
