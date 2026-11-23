export const faceVertex = /* glsl */ `
  attribute vec3 aStart; attribute float aLum; attribute float aDelay; attribute float aRand;
  uniform float uTime; uniform float uProgress; uniform float uSize; uniform float uGlitch; uniform float uSpeak;
  varying vec3 vColor; varying float vAlpha;
  void main(){
    float p = clamp((uProgress - aDelay) / 0.4, 0.0, 1.0);
    p = 1.0 - pow(1.0 - p, 3.0);
    vec3 start = aStart;
    float ang = (1.0 - p) * 3.0 * (aRand - 0.5);
    start.xz = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * start.xz;
    vec3 pos = mix(start, position, p);
    pos.y += 0.006 * sin(uTime * 2.0 + aRand * 6.2831);
    pos.z += 0.01 * sin(uTime * 1.3 + pos.y * 4.0);
    pos.z += uSpeak * 0.012 * sin(uTime * 14.0 + aRand * 6.2831);
    float band = floor((pos.y + uTime * 0.6) * 9.0);
    float hit = step(0.86, fract(sin(band * 91.7 + floor(uTime * 14.0)) * 43758.5)) * uGlitch;
    pos.x += hit * 0.18 * (fract(sin(band * 12.9) * 999.0) - 0.5) * 2.0;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.6 + aLum * 0.6) * (5.0 / -mv.z);
    vec3 holo = mix(vec3(0.36, 0.26, 0.95), vec3(0.80, 0.70, 1.0), aLum);
    holo = mix(holo, vec3(1.0, 0.70, 0.64), hit * 0.8);
    vColor = holo * (1.0 + uSpeak * 0.25 * (0.5 + 0.5 * sin(uTime * 9.0)));
    vAlpha = (0.12 + aLum * 0.42) * (0.25 + 0.75 * p) * (0.15 + 0.85 * smoothstep(-1.35, -0.85, position.y));
  }`;

export const faceFragment = /* glsl */ `
  uniform float uTime;
  varying vec3 vColor; varying float vAlpha;
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    float scan = 0.7 + 0.3 * sin(gl_FragCoord.y * 1.1 - uTime * 9.0);
    float flick = 0.93 + 0.07 * sin(uTime * 47.0) * sin(uTime * 11.0);
    gl_FragColor = vec4(vColor * scan * flick, a * vAlpha);
  }`;

export const basicVertex = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

export const discFragment = /* glsl */ `
  uniform float uTime; varying vec2 vUv;
  void main(){
    float d = length(vUv - 0.5) * 2.0;
    float glow = smoothstep(1.0, 0.0, d) * 0.55;
    float rings = 0.12 * smoothstep(0.02, 0.0, abs(fract(d * 6.0 - uTime * 0.5) - 0.5) - 0.46);
    gl_FragColor = vec4(vec3(0.55, 0.45, 1.0) * (glow + rings), glow + rings);
  }`;

export const beamFragment = /* glsl */ `
  uniform float uTime; varying vec2 vUv;
  void main(){
    float fade = pow(1.0 - vUv.y, 1.6) * 0.16;
    float streak = 0.6 + 0.4 * sin(vUv.x * 60.0 + uTime * 1.5);
    gl_FragColor = vec4(vec3(0.6, 0.5, 1.0) * fade * streak, fade * streak);
  }`;
