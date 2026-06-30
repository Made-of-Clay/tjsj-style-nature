uniform float uTime;
uniform float uScale;
uniform float uWaveAmplitude;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    // Polygonal water wave displacement — intentional faceted look
    float t = uTime;
    float freq = uScale;
    float w1 = sin(position.x * freq + t * 0.8) * sin(position.z * freq * 0.7 + t * 0.5);
    float w2 = sin(position.x * freq * 1.5 + position.z * freq * 1.2 + t * 1.1);
    float displacement = (w1 * 0.6 + w2 * 0.4) * uWaveAmplitude;

    vec3 pos = position + vec3(0.0, displacement, 0.0);

    vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
