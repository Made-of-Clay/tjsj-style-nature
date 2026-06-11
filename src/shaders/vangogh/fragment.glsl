uniform vec2 u_resolution;
uniform float u_time;
uniform int u_frame;
uniform sampler2D u_channel0;
uniform sampler2D u_channel1;
uniform sampler2D u_channel2;

varying vec2 vUv;

// Remap Shadertoy legacy macros to uniform sizes
#define Res  u_resolution.xy
#define Res0 u_resolution.xy
#define Res1 u_resolution.xy
#define Res2 u_resolution.xy

vec4 getCol(vec2 pos) {
    vec2 uv = pos / Res0;
    vec4 c1 = texture2D(u_channel0, uv);
    
    // Vector inversion syntax fixed for strict GLSL
    uv = uv * vec2(-1.0, -1.0) * 0.39 + 0.015 * vec2(sin(u_time * 1.1), sin(u_time * 0.271));
    vec4 c2 = vec4(0.5, 0.7, 1.0, 1.0) * 1.0 * texture2D(u_channel2, uv).xxxw;
    
    float d = clamp(dot(c1.xyz, vec3(-0.5, 1.0, -0.5)), 0.0, 1.0);
    return mix(c1, c2, 1.8 * d);
}

float getVal(vec2 pos, float level) {
    return length(getCol(pos).xyz) + 0.0001 * length(pos - 0.5 * Res0);
}
    
vec2 getGrad(vec2 pos, float delta) {
    float l = 1.0 * log2(delta);
    vec2 d = vec2(delta, 0.0);
    return vec2(
        getVal(pos + d.xy, l) - getVal(pos - d.xy, l),
        getVal(pos + d.yx, l) - getVal(pos - d.yx, l)
    ) / delta;
}

vec4 getRand(vec2 pos) {
    vec2 uv = pos / Res1;
    uv += 1.0 * float(u_frame) * vec2(0.2, 0.1) / Res1;
    return texture2D(u_channel1, uv);
}

vec4 getColDist(vec2 pos) {
    return floor(0.8 * getCol(pos) + 1.1 * getRand(1.2 * pos));
}

#define SampNum 16

void main() {
    // Reconstruct fragCoord from Three.js screen UV
    vec2 fragCoord = vUv * u_resolution;
    
    vec2 pos = fragCoord / Res * Res0;
    vec3 col = vec3(0.0);
    float cnt = 0.0;
    float fact = 1.0;
    
    for(int i = 0; i < SampNum; i++) {
        col += fact * getColDist(pos).xyz;
        vec2 gr = getGrad(pos, 4.0);
        pos += 0.6 * normalize(mix(gr.yx * vec2(1.0, -1.0), -gr, 0.2));
        fact *= 0.87;
        cnt += fact;
    }
    col /= cnt;
    gl_FragColor = vec4(col, 1.0);
}