// =============================================
// Caustics - Ported from Three.js TSL (b/c I'm 
// a noob and can't problem-solve TSL yet)
// Uses standard Worley (cellular) noise
// =============================================

precision highp float;

uniform float uTime;
uniform float uScale;      // default 2.0
uniform float uSpeed;      // default 0.0
uniform vec3  uColor;      // default vec3(0.31, 0.66, 0.75) ≈ #50a8c0
uniform float uSeed;       // default 0.0

varying vec3 vPosition;

// =============================================
// Hash / Random helper (used by Worley)
// =============================================
float hash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}

// 3D Worley noise (F1 distance to nearest feature point)
// Returns value in ~[0, 1] range
float worley(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);

    float minDist = 1e10;

    for (int z = -1; z <= 1; z++) {
        for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
                vec3 b = vec3(float(x), float(y), float(z));
                vec3 r = b - f + hash(i + b);   // random offset in cell
                float d = length(r);
                minDist = min(minDist, d);
            }
        }
    }
    return minDist;
}

// 3D Worley that returns a vec3 of three offset samples (matches mx_worley_noise_vec3 behavior)
vec3 worley3(vec3 p) {
    return vec3(
        worley(p),
        worley(p + vec3(123.456, 789.012, 345.678)),
        worley(p + vec3(901.234, 567.890, 123.456))
    );
}

// =============================================
// Main Caustics Function
// =============================================
vec3 caustics(vec3 position, float scale, float speed, float time, vec3 color, float seed) {
    // Position scaling + seed offset
    vec3 pos = position * exp(scale - 1.0) + seed;

    // Animated time offsets (creates flowing effect)
    vec3 t = sin(time * exp(speed - 1.0) + vec3(0.0, 2.0 * 3.14159265359 / 3.0, 4.0 * 3.14159265359 / 3.0));

    // Combine multiple Worley samples (this is the core of the TSL version)
    vec3 p = worley3(
        pos + vec3(
            worley(pos + t.xyz),
            worley(pos + t.yzx),
            worley(pos + t.zxy)
        )
    );

    // Normalize length (approximates distance field)
    float normalizedLength = length(p) / sqrt(3.0);

    // Color modulation
    return normalizedLength + (color - 0.5) * 2.0;
}

void main() {
    vec3 pos = vPosition;

    vec3 c = caustics(
        pos,
        uScale,
        uSpeed,
        uTime,
        uColor,
        uSeed
    );

    gl_FragColor = vec4(c, 1.0);
}