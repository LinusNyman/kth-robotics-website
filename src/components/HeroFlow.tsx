import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Audio-reactive water shader — adapted from
 * https://codepen.io/filipz/pen/VYvKJQR (by filipz).
 *
 * Removed for our hero use case:
 *  - audio analysis + tweakpane controls
 *  - logo / paragraph text overlay (the hero supplies its own copy)
 *  - geolocation coords readout
 *
 * Kept:
 *  - the full fragment shader with 21 gradient themes
 *  - the JS water-ripple simulation (CPU-side height field uploaded as a DataTexture)
 *  - mouse-move trails + click bursts
 */

// ---------- Water sim config ----------
const WATER_RES = 128;
const WATER = {
  damping: 0.913,
  tension: 0.025,
  rippleRadius: 6,
  mouseIntensity: 1.2,
  clickIntensity: 3.0,
};
const INPUT_EDGE_FADE_PX = 120;

// Tunables that mirror the original `settings` object (subset we actually use).
const SETTINGS = {
  animationSpeed: 1.3,
  waterStrength: 0.55,
  rippleStrength: 0.5,
  rippleSize: 0.1,
  spiralIntensity: 0.2,
  swirlingMotion: 0.2,
  motionDecay: 0.08,
  rippleDecay: 1.0,
  waveHeight: 0.01,
  impactForce: 50000,
  // Default theme — pick one that reads well over a dark hero. 14 = darkBloom.
  initialTheme: 14,
};

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_speed;
  uniform sampler2D u_waterTexture;
  uniform float u_waterStrength;
  uniform float u_ripple_time;
  uniform vec2 u_ripple_position;
  uniform float u_ripple_strength;
  uniform int u_gradientTheme;

  varying vec2 vUv;

  vec4 electricPlasma(vec2 u, float t) {
    float a=0., d=0., i=0.;
    for (; i < 8.; d += sin(i++ * u.y + a))
       a += sin(i - d + 0.15 * t - a * u.x);
    vec3 c = mix(vec3(0.1,0.0,0.8), vec3(0.5,0.2,1.0), .5+.5*cos(a));
    c = mix(c, vec3(1.0), .5+.5*sin(d));
    return vec4(c, 1.0);
  }
  vec4 moltenGold(vec2 u, float t) {
    float a=0., d=0., i=0.;
    for (; i < 10.; d += cos(i++ * u.y * 0.8 + a))
      a += cos(i - d + 0.1 * t - a * u.x + length(u));
    vec3 c = mix(vec3(0.), vec3(0.6,0.1,0.0), smoothstep(-1.,1.,cos(d)));
    c = mix(c, vec3(1.0,0.5,0.0), smoothstep(-.5,.5,sin(a)));
    c = mix(c, vec3(1.0,0.9,0.3), smoothstep(0.8,1.,cos(a+d)));
    return vec4(pow(c, vec3(1.5)), 1.0);
  }
  vec4 emeraldMist(vec2 u, float t) {
    float angle = t * 0.05;
    mat2 rot = mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
    u = rot * u;
    float a=0., d=0., i=0.;
    for (; i < 5.; d += sin(i++ * u.y + a) * 0.5)
      a += cos(i - d + 0.1 * t - a * u.x);
    vec3 c = mix(vec3(0.0,0.1,0.1), vec3(0.1,0.8,0.6), .5+.5*cos(a));
    c = mix(c, vec3(0.9,1.0,0.9), .5+.5*sin(d));
    return vec4(c, 1.0);
  }
  vec4 auroraWarp(vec2 u, float t) {
    float a=0., d=0., i=0.;
    for (; i < 12.; d += sin(i++ * u.y + a))
       a += sin(i - d + 0.1 * t - a * u.x);
    vec4 o;
    o.r = .5 + .5 * cos(a + d);
    o.g = .5 + .5 * cos(a + d + 2.09);
    o.b = .5 + .5 * cos(a + d + 4.18);
    o.a = 1.0;
    return cos(.5 + .5 * cos(vec4(d,a,2.5,0)) * o);
  }
  vec4 cosmicOcean(vec2 u, float t) {
    vec2 p = vec2(u.x * 0.2, u.y);
    float a=0., d=0., i=0.;
    for (; i < 8.; d += sin(i++ * p.y + a + t*0.08))
       a += cos(i - d + 0.1 * t - a * p.x);
    vec3 c = mix(vec3(0,0.05,0.2), vec3(0.1,0.2,0.7), smoothstep(-1.,1.,cos(a)));
    c = mix(c, vec3(0.8,0.8,1.0), pow(smoothstep(0.5,1.,sin(d*2.)), 4.0));
    return vec4(c, 1.0);
  }
  float rand(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
  }
  vec4 staticInterference(vec2 u, float t) {
    u += (rand(u + t * 0.5) - 0.5) * 0.02;
    float a=0., d=0., i=0.;
    for (; i < 8.; d += sin(i++ * u.y + a))
       a += cos(i - d + 0.3 * t - a * u.x);
    float grey = .5 + .5 * cos(a + d);
    grey += (rand(u * 150.0) - 0.5) * 0.15;
    return vec4(vec3(grey), 1.0);
  }
  vec4 liquidCrystal(vec2 u, float t) {
    u *= 1.2;
    float a=0., d=0., i=0.;
    for (; i < 9.; d += cos(i++ * u.y + a))
       a += sin(i*0.5 - d + 0.1 * t - a * u.x);
    vec3 c = 0.6 + 0.4 * cos(vec3(0.0, 2.1, 4.2) + a + d);
    float gloss = pow(smoothstep(0.6, 1.0, sin(d * 2.0 + a)), 10.0);
    c += vec3(0.8) * gloss;
    return vec4(clamp(c, 0.0, 1.0), 1.0);
  }
  vec4 solarFlare(vec2 u, float t) {
    float a=0., d=0., i=0.;
    for (; i < 9.; d += sin(i++ * u.y + a))
       a += cos(i - d + 0.05 * t - a * u.x);
    float v = .5 + .5 * cos(a+d);
    vec3 c = mix(vec3(0.0), vec3(1.,0.1,0.), smoothstep(0.6, 0.7, v));
    c = mix(c, vec3(1.,0.8,0.2), smoothstep(0.85, 0.9, v));
    c = mix(c, vec3(1.), smoothstep(0.98, 0.99, v));
    return vec4(c, 1.0);
  }
  vec4 dreamscapePastel(vec2 u, float t) {
    float a=0., d=0., i=0.;
    for (; i < 6.; d += sin(i++ * u.y + a))
       a += cos(i - d + 0.04 * t - a * u.x);
    vec3 c1 = vec3(1.0, 0.8, 0.9), c2 = vec3(0.8, 0.9, 1.0), c3 = vec3(0.9, 0.8, 1.0);
    vec3 c = mix(c1, c2, .5+.5*cos(a+d));
    c = mix(c, c3, .5+.5*sin(d));
    return vec4(c, 1.0);
  }
  vec4 dataStream(vec2 u, float t) {
    float a=0., d=0., i=0.;
    for (; i < 8.; d+=sin(i++*u.y+a)) a+=cos(i-d+0.1*t-a*u.x);
    float g=0.;
    for (i=0.; i<4.; g+=cos(i++*u.x+a)) a+=sin(i-d+2.*t-g*u.y);
    vec3 color = 0.5 + 0.5*cos(vec3(0,1,2)+d);
    vec2 grid_uv = u * 8.0;
    vec2 grid = abs(fract(grid_uv) - 0.5);
    float lines = pow(1. - (grid.x+grid.y), 40.0);
    float glitch = pow(fract(g*4.0), 20.0);
    return vec4(color * (lines*0.5 + glitch*2.0), 1.0);
  }
  float gradientPattern(vec2 u, float t) {
    float a=0., d=0., i=0.;
    for (; i < 8.; d += sin(i++ * u.y + a))
      a += cos(i - d + 0.2 * t - a * u.x);
    return .5 + .5 * cos(a + d);
  }
  vec4 chromaticFlow(vec2 u, float t) {
    vec2 oR = vec2(cos(t*0.2),sin(t*0.2))*0.015;
    vec2 oG = vec2(cos(t*0.25),sin(t*0.25))*0.015;
    vec2 oB = vec2(cos(t*0.3),sin(t*0.3))*0.015;
    float r = gradientPattern(u + oR, t);
    float g = gradientPattern(u - oG, t);
    float b = gradientPattern(u + oB, t);
    return vec4(pow(r,2.), pow(g,2.), pow(b,2.), 1.0);
  }
  vec4 wovenDimensions(vec2 u, float t) {
    float a1=0., d1=0., i=0.;
    for (i=0.; i < 8.; d1 += sin(i++ * u.y + a1))
       a1 += cos(i - d1 + 0.1 * t - a1 * u.x);
    float a2=0., d2=0.;
    for (i=0.; i < 8.; d2 += sin(i++ * u.x + a2))
      a2 += cos(i - d2 + 0.12 * t - a2 * u.y);
    float v1 = 0.5 + 0.5 * sin(a1 + d1);
    float v2 = 0.5 + 0.5 * cos(a2 + d2);
    vec3 c = vec3(0.6, 0.7, 0.8) * v1 * v2 * 2.5;
    return vec4(pow(c, vec3(1.2)), 1.0);
  }
  vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
  }
  vec4 cellularMatrix(vec2 u, float t) {
    u *= 2.0;
    vec2 i_u = floor(u);
    vec2 f_u = fract(u);
    float m_dist = 1.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 n = vec2(float(x), float(y));
        vec2 p = hash2(i_u + n);
        p = 0.5 + 0.5 * sin(t * 0.2 + 6.2831 * p);
        m_dist = min(m_dist, length(n + p - f_u));
      }
    }
    float a=0., d=0., i=0.;
    for (i=0.; i<5.; d+=sin(i++*u.y+a)) a+=cos(i-d+0.1*t-a*u.x);
    vec3 c = 0.5 + 0.5 * cos(vec3(0,2,4) + a + d);
    return vec4(c * (1.0 - m_dist) + pow(m_dist, 5.0) * c, 1.0);
  }
  float cellularNoise(vec2 u, float t) {
    float a=0., d=0., i=0.;
    for (; i<5.; d+=sin(i++*u.y+a)) a+=cos(i-d+t-a*u.x);
    return a + d;
  }
  vec4 pearlBloom(vec2 u, float t) {
    float w = cellularNoise(u, t * 0.05) * 0.2;
    vec2 off = vec2(cos(w), sin(w)) * 0.1;
    float f = 0.5 + 0.5 * cellularNoise(u + off, t * 0.1);
    vec3 base = vec3(0.85 + f * 0.15);
    float edge = smoothstep(0.1, 0.0, fwidth(f * 5.0));
    vec3 spec = 0.5 + 0.5 * cos(f * 10.0 + vec3(0,2,4));
    return vec4(mix(base, spec, pow(edge, 2.0)), 1.0);
  }
  float darkNoise(vec2 u, float t) {
    float a=0., d=0., i=0.;
    for (; i<8.; d+=sin(i++*u.y+a)) a+=cos(i-d+t-a*u.x);
    return a + d;
  }
  vec4 darkBloom(vec2 u, float t) {
    float w = darkNoise(u, t * 0.05) * 0.2;
    vec2 off = vec2(cos(w), sin(w)) * 0.1;
    float f = 0.5 + 0.5 * cos(darkNoise(u + off, t * 0.1));
    vec3 base = vec3(0.06, 0.02, 0.02);
    vec3 mid  = vec3(0.961, 0.396, 0.361);
    vec3 hi   = vec3(1.0, 0.7, 0.62);
    vec3 c = mix(base, mid, smoothstep(0.25, 0.75, f));
    c = mix(c, hi, smoothstep(0.85, 1.0, f));
    return vec4(c, 1.0);
  }
  vec4 voxelSunset(vec2 u, float t) {
    vec2 b = floor(u * 25.0) / 25.0;
    float a=0., d=0., i=0.;
    for (; i<8.; d+=sin(i++*b.y+a)) a+=cos(i-d+0.15*t-a*b.x);
    vec3 c = 0.5 + 0.5 * cos(vec3(0,1,2) + d * 2.0);
    float l = dot(normalize(vec2(1,1)), u);
    return vec4(c * (0.8 + l * 0.4), 1.0);
  }
  float inkNoise(vec2 u, float t) {
    float a=0., d=0., i=0.;
    for (; i<8.; d+=sin(i++*u.y+a)) a+=cos(i-d+t-a*u.x);
    return a + d;
  }
  vec4 inkBloom(vec2 u, float t) {
    float w = inkNoise(u, t * 0.05) * 0.2;
    vec2 off = vec2(cos(w), sin(w)) * 0.1;
    float f = inkNoise(u + off, t * 0.1);
    return vec4(vec3(0.5 + 0.5 * cos(f)), 1.0);
  }
  float strataFloor(vec3 u, float t) {
    u += t;
    float a=0., d=0., i=0.;
    for (; i<5.; d+=sin(i++*u.y+a)) a+=cos(i-d+u.z-a*u.x);
    return a + d;
  }
  vec4 etherealStrata(vec2 u, float t) {
    vec3 pos = vec3(u * 1.5, t * 0.1);
    float v = strataFloor(pos, 0.0);
    return vec4(0.6 + 0.4 * cos(v + vec3(0,2,4)), 1.0);
  }
  float solarNoise(vec2 u, float t) {
    float a=0., d=0., i=0.;
    for (; i<5.; d+=sin(i++*u.y+a)) a+=cos(i-d+t-a*u.x);
    return 0.5 + 0.5*cos(a+d);
  }
  vec4 solarPlasma(vec2 u, float t) {
    float f = 0.0;
    vec2 p = u * 1.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    f = 0.5 * solarNoise(p, t * 0.1);
    p = m * p;
    f += 0.25 * solarNoise(p, t * 0.1);
    vec3 c = mix(vec3(0.1, 0.0, 0.0), vec3(1.0, 0.2, 0.0), smoothstep(0.4, 0.7, f));
    c = mix(c, vec3(1.0, 0.9, 0.5), pow(smoothstep(0.8, 0.85, f), 10.0));
    return vec4(c, 1.0);
  }
  float silkNoise(vec2 u, float t) {
    float a=0., d=0., i=0.;
    for (; i<5.; d+=sin(i++*u.y+a)) a+=cos(i-d+t-a*u.x);
    return 0.5 + 0.5*cos(a+d);
  }
  vec4 warpedSilk(vec2 u, float t) {
    vec2 p = u;
    p.y *= 5.0;
    p.x += sin(p.y * 0.5 + t) * 0.2;
    float n = silkNoise(p, t * 0.1);
    vec3 base_color = vec3(0.2, 0.1, 0.5);
    float sheen = pow(smoothstep(0.5, -0.5, u.x + n * 0.2), 2.0);
    return vec4(base_color + sheen, 1.0);
  }
  float cellPattern(vec2 u, float t) {
    float a=0., d=0., i=0.;
    for (; i<8.; d+=sin(i++*u.y+a)) a+=cos(i-d+t-a*u.x);
    return 0.5 + 0.5*cos(a+d);
  }
  vec4 livingCells(vec2 u, float t) {
    float w = cellPattern(u, t * 0.05) * 6.28;
    vec2 off = vec2(cos(w), sin(w)) * 0.1;
    float cell_shape = cellPattern(u + off, t * 0.1);
    float mask = smoothstep(0.4, 0.6, cell_shape);
    float internal_noise = cellPattern(u * 3.0, t * 0.2);
    vec3 c1 = vec3(0.2, 0.8, 0.5), c2 = vec3(0.8, 0.5, 0.2);
    vec3 internal_color = mix(c1, c2, internal_noise);
    return vec4(mix(vec3(0.05), internal_color, mask), 1.0);
  }

  vec4 getGradientColor(vec2 u, float t, int theme) {
    if (theme == 0) return electricPlasma(u, t);
    else if (theme == 1) return moltenGold(u, t);
    else if (theme == 2) return emeraldMist(u, t);
    else if (theme == 3) return auroraWarp(u, t);
    else if (theme == 4) return cosmicOcean(u, t);
    else if (theme == 5) return staticInterference(u, t);
    else if (theme == 6) return liquidCrystal(u, t);
    else if (theme == 7) return solarFlare(u, t);
    else if (theme == 8) return dreamscapePastel(u, t);
    else if (theme == 9) return dataStream(u, t);
    else if (theme == 10) return chromaticFlow(u, t);
    else if (theme == 11) return wovenDimensions(u, t);
    else if (theme == 12) return cellularMatrix(u, t);
    else if (theme == 13) return pearlBloom(u, t);
    else if (theme == 14) return darkBloom(u, t);
    else if (theme == 15) return voxelSunset(u, t);
    else if (theme == 16) return inkBloom(u, t);
    else if (theme == 17) return etherealStrata(u, t);
    else if (theme == 18) return solarPlasma(u, t);
    else if (theme == 19) return warpedSilk(u, t);
    else return livingCells(u, t);
  }

  void main() {
    vec2 r = u_resolution;
    vec2 FC = gl_FragCoord.xy;
    // Normalize so both axes stay in roughly [-1, 1] regardless of aspect
    // ratio. Previously this divided by r.y only, which made screenP.x grow
    // unbounded on wide canvases (the hero is rendered at ~180% width) — the
    // pattern iterations then oscillated extremely fast near the left/right
    // edges, producing the "speeds up and goes chaotic at the edges" look.
    // Tame the coordinate range fed into the pattern loops. The inner
    // iterations multiply u.x (and u.y) by an accumulator that grows each
    // step, so even small increases in the magnitude translate to runaway
    // oscillation frequency near the edges. Scaling down + a soft clamp
    // keeps the pattern visually consistent across the whole canvas.
    vec2 screenP = (vUv * 2.0 - 1.0) * 0.6;
    screenP = clamp(screenP, vec2(-0.7), vec2(0.7));

    vec2 wCoord = vec2(FC.x / r.x, FC.y / r.y);
    float waterHeight = texture2D(u_waterTexture, wCoord).r;
    float waterInfluence = clamp(waterHeight * u_waterStrength, -0.5, 0.5);

    vec2 gradientUV = screenP;
    float totalWaterInfluence = clamp(waterInfluence * u_waterStrength, -0.8, 0.8);
    gradientUV += vec2(totalWaterInfluence * 0.3, totalWaterInfluence * 0.2);

    float rippleTime = u_time - u_ripple_time;
    vec2 ripplePos = u_ripple_position * r;
    float rippleDist = distance(FC.xy, ripplePos);
    float clickRipple = 0.0;
    if (rippleTime < 3.0 && rippleTime > 0.0) {
      float rippleRadius = rippleTime * 150.0;
      float rippleWidth = 30.0;
      float rippleDecay = 1.0 - rippleTime / 3.0;
      clickRipple = exp(-abs(rippleDist - rippleRadius) / rippleWidth) * rippleDecay * u_ripple_strength;
    }

    float totalWaterEffect = totalWaterInfluence + clickRipple * 0.2;
    gradientUV += vec2(totalWaterEffect * 0.4, totalWaterEffect * 0.3);

    float modifiedTime = u_time * u_speed + totalWaterEffect * 2.0;
    vec4 gradientColor = getGradientColor(gradientUV, modifiedTime, u_gradientTheme);

    gl_FragColor = vec4(gradientColor.rgb, 1.0);
  }
`;

export default function HeroFlow() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current!;
    let width = container.clientWidth;
    let height = container.clientHeight;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);

    // ---- Three.js setup ----
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    // ---- Water height-field buffers ----
    const buffers = {
      current: new Float32Array(WATER_RES * WATER_RES),
      previous: new Float32Array(WATER_RES * WATER_RES),
      velocity: new Float32Array(WATER_RES * WATER_RES * 2),
      vorticity: new Float32Array(WATER_RES * WATER_RES),
    };

    const waterTexture = new THREE.DataTexture(
      buffers.current,
      WATER_RES,
      WATER_RES,
      THREE.RedFormat,
      THREE.FloatType
    );
    waterTexture.minFilter = THREE.LinearFilter;
    waterTexture.magFilter = THREE.LinearFilter;
    waterTexture.needsUpdate = true;

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        u_time: { value: 0 },
        u_resolution: {
          value: new THREE.Vector2(width * pixelRatio, height * pixelRatio),
        },
        u_speed: { value: SETTINGS.animationSpeed },
        u_waterTexture: { value: waterTexture },
        u_waterStrength: { value: SETTINGS.waterStrength },
        u_ripple_time: { value: -10.0 },
        u_ripple_position: { value: new THREE.Vector2(0.5, 0.5) },
        u_ripple_strength: { value: SETTINGS.rippleStrength },
        u_gradientTheme: { value: SETTINGS.initialTheme },
      },
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    // ---- Water sim step (CPU) ----
    function step() {
      const { current, previous, velocity, vorticity } = buffers;
      const damping = WATER.damping;
      const safeTension = Math.min(WATER.tension, 0.05);
      const velocityDissipation = SETTINGS.motionDecay;
      const densityDissipation = SETTINGS.rippleDecay;
      const vorticityInfluence = Math.min(
        Math.max(SETTINGS.swirlingMotion, 0.0),
        0.5
      );

      // velocity dissipation + hard cap on per-cell velocity magnitude
      const MAX_VEL = 0.05;
      const MAX_VEL_SQ = MAX_VEL * MAX_VEL;
      for (let i = 0; i < WATER_RES * WATER_RES; i++) {
        const vIdx = i * 2;
        velocity[vIdx] *= 1.0 - velocityDissipation;
        velocity[vIdx + 1] *= 1.0 - velocityDissipation;
        const vx = velocity[vIdx];
        const vy = velocity[vIdx + 1];
        const magSq = vx * vx + vy * vy;
        if (magSq > MAX_VEL_SQ) {
          const scale = MAX_VEL / Math.sqrt(magSq);
          velocity[vIdx] = vx * scale;
          velocity[vIdx + 1] = vy * scale;
        }
      }

      // vorticity
      for (let i = 1; i < WATER_RES - 1; i++) {
        for (let j = 1; j < WATER_RES - 1; j++) {
          const idx = i * WATER_RES + j;
          const left = velocity[(idx - 1) * 2 + 1];
          const right = velocity[(idx + 1) * 2 + 1];
          const bottom = velocity[(idx - WATER_RES) * 2];
          const top = velocity[(idx + WATER_RES) * 2];
          vorticity[idx] = (right - left - (top - bottom)) * 0.5;
        }
      }

      if (vorticityInfluence > 0.001) {
        for (let i = 1; i < WATER_RES - 1; i++) {
          for (let j = 1; j < WATER_RES - 1; j++) {
            const idx = i * WATER_RES + j;
            const vIdx = idx * 2;
            const left = Math.abs(vorticity[idx - 1]);
            const right = Math.abs(vorticity[idx + 1]);
            const bottom = Math.abs(vorticity[idx - WATER_RES]);
            const top = Math.abs(vorticity[idx + WATER_RES]);
            const gradX = (right - left) * 0.5;
            const gradY = (top - bottom) * 0.5;
            const len = Math.sqrt(gradX * gradX + gradY * gradY) + 1e-5;
            const safeVort = Math.max(-1, Math.min(1, vorticity[idx]));
            const fx = (gradY / len) * safeVort * vorticityInfluence * 0.1;
            const fy = (-gradX / len) * safeVort * vorticityInfluence * 0.1;
            velocity[vIdx] += Math.max(-0.1, Math.min(0.1, fx));
            velocity[vIdx + 1] += Math.max(-0.1, Math.min(0.1, fy));
          }
        }
      }

      // wave propagation — explicit 2D wave equation:
      //   u_next = 2u - u_prev + c² (left+right+top+bot - 4u)
      // CFL stability limit in 2D is c² <= 0.5; we run well below it so the
      // wave speed is capped and the sim stays stable even with strong input.
      const WAVE_SPEED_SQ = 0.22;
      const MAX_DELTA = 0.08; // cap how much a cell can change in one step
      for (let i = 1; i < WATER_RES - 1; i++) {
        for (let j = 1; j < WATER_RES - 1; j++) {
          const idx = i * WATER_RES + j;
          const vIdx = idx * 2;
          const u = previous[idx];
          const top = previous[idx - WATER_RES];
          const bottom = previous[idx + WATER_RES];
          const left = previous[idx - 1];
          const right = previous[idx + 1];

          const laplacian = top + bottom + left + right - 4 * u;
          let next = 2 * u - current[idx] + WAVE_SPEED_SQ * laplacian;
          next = next * damping + u * (1 - damping);
          next += (0 - u) * safeTension;

          const velMag = Math.sqrt(
            velocity[vIdx] * velocity[vIdx] +
              velocity[vIdx + 1] * velocity[vIdx + 1]
          );
          const safeVel = Math.min(velMag * SETTINGS.waveHeight, 0.05);
          next += safeVel;
          next *= 1.0 - densityDissipation * 0.01;

          // cap per-frame delta so no cell can jump too fast
          const delta = next - u;
          if (delta > MAX_DELTA) next = u + MAX_DELTA;
          else if (delta < -MAX_DELTA) next = u - MAX_DELTA;

          current[idx] = Math.max(-1.5, Math.min(1.5, next));
        }
      }


      // Mur 1st-order absorbing boundary condition.
      // For each outermost cell, sample what the next-inner cell held one step
      // ago (`previous`). With c = 1 (normalized scheme) this lets outgoing
      // waves pass through with negligible reflection and zero damping — no
      // sponge, no visible "sucking".
      const N = WATER_RES;
      for (let i = 0; i < N; i++) {
        // top row (i, 0) -> inner (i, 1)
        const top = i;
        const topInner = N + i;
        current[top] = previous[topInner];
        previous[top] = previous[topInner];
        velocity[top * 2] = 0;
        velocity[top * 2 + 1] = 0;

        // bottom row
        const bot = (N - 1) * N + i;
        const botInner = (N - 2) * N + i;
        current[bot] = previous[botInner];
        previous[bot] = previous[botInner];
        velocity[bot * 2] = 0;
        velocity[bot * 2 + 1] = 0;

        // left column
        const left = i * N;
        const leftInner = i * N + 1;
        current[left] = previous[leftInner];
        previous[left] = previous[leftInner];
        velocity[left * 2] = 0;
        velocity[left * 2 + 1] = 0;

        // right column
        const right = i * N + (N - 1);
        const rightInner = i * N + (N - 2);
        current[right] = previous[rightInner];
        previous[right] = previous[rightInner];
        velocity[right * 2] = 0;
        velocity[right * 2 + 1] = 0;
      }

      // swap
      const tmp = buffers.current;
      buffers.current = buffers.previous;
      buffers.previous = tmp;
      // (re-point the texture to the new "current" buffer)
      (waterTexture.image as { data: Float32Array }).data = buffers.current;
      waterTexture.needsUpdate = true;
    }

    function addRipple(x: number, y: number, strength = 1.0) {
      const fadedStrength = strength;
      if (fadedStrength <= 0.001) return;
      const nx = x / width;
      const ny = 1.0 - y / height;
      const tx = Math.floor(nx * WATER_RES);
      const ty = Math.floor(ny * WATER_RES);
      const radius = Math.max(
        WATER.rippleRadius,
        Math.floor(SETTINGS.rippleSize * WATER_RES)
      );
      const rs = fadedStrength * (SETTINGS.impactForce / 100000);
      const r2 = radius * radius;

      for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
          const d2 = i * i + j * j;
          if (d2 > r2) continue;
          const px = tx + i;
          const py = ty + j;
          if (px < 0 || px >= WATER_RES || py < 0 || py >= WATER_RES) continue;
          const idx = py * WATER_RES + px;
          const vIdx = idx * 2;
          const dist = Math.sqrt(d2);
          const falloff = 1.0 - dist / radius;
          const val = Math.cos((dist / radius) * Math.PI * 0.5) * rs * falloff;
          buffers.previous[idx] += val;

          const ang = Math.atan2(j, i);
          const vs = val * SETTINGS.spiralIntensity;
          buffers.velocity[vIdx] += Math.cos(ang) * vs;
          buffers.velocity[vIdx + 1] += Math.sin(ang) * vs;
          const sa = ang + Math.PI * 0.5;
          const ss = Math.min(vs * 0.3, 0.1);
          buffers.velocity[vIdx] += Math.cos(sa) * ss;
          buffers.velocity[vIdx + 1] += Math.sin(sa) * ss;
        }
      }
    }

    // ---- Pointer / click input ----
    const lastPointer = { x: 0, y: 0, t: 0, inside: false };
    const onMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Ignore moves outside the canvas (the listener is on window).
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        lastPointer.t = 0;
        lastPointer.inside = false;
        return;
      }
      const now = performance.now();
      // Re-prime on first sample, after leaving the canvas, or after a long idle gap.
      if (
        !lastPointer.inside ||
        lastPointer.t === 0 ||
        now - lastPointer.t > 120
      ) {
        lastPointer.x = x;
        lastPointer.y = y;
        lastPointer.t = now;
        lastPointer.inside = true;
        return;
      }
      const dx = x - lastPointer.x;
      const dy = y - lastPointer.y;
      const dist = Math.hypot(dx, dy);
      const dt = Math.max(8, Math.min(64, now - lastPointer.t));
      const vel = dist / dt;
      // Guard against teleport-like jumps (e.g. cursor warps).
      if (dist > 200) {
        lastPointer.x = x;
        lastPointer.y = y;
        lastPointer.t = now;
        return;
      }
      if (dist > 1) {
        const velInf = Math.min(vel * 100, 2.0);
        const base = Math.min(dist / 20, 1.0);
        const intensity =
          base * velInf * WATER.mouseIntensity * (Math.random() * 0.3 + 0.7);
        addRipple(
          x + (Math.random() - 0.5) * 3,
          y + (Math.random() - 0.5) * 3,
          intensity
        );
        lastPointer.x = x;
        lastPointer.y = y;
        lastPointer.t = now;
      }
    };
    const onClick = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      addRipple(x, y, WATER.clickIntensity);
      material.uniforms.u_ripple_position.value.set(x / width, 1 - y / height);
      material.uniforms.u_ripple_time.value = clock.getElapsedTime();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onClick);

    // ---- Resize ----
    // Debounced + change-thresholded resize. Avoids per-frame churn during
    // drag-resize and prevents pointer-coordinate "jumps" from injecting
    // ripples right after the canvas reflows (e.g. orientation change).
    let resizeTimer: number | null = null;
    const applyResize = () => {
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW === width && newH === height) return;
      if (newW < 2 || newH < 2) return;
      width = newW;
      height = newH;
      renderer.setSize(width, height, false);
      material.uniforms.u_resolution.value.set(
        width * pixelRatio,
        height * pixelRatio
      );
      // Re-prime pointer so the next move doesn't compute a huge delta
      // against stale pre-resize coordinates.
      lastPointer.t = 0;
      lastPointer.inside = false;
    };
    const onResize = () => {
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(applyResize, 80);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);
    window.addEventListener("orientationchange", onResize);

    // ---- Animation loop ----
    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      material.uniforms.u_time.value = clock.getElapsedTime();
      step();
      renderer.render(scene, camera);
    };
    animate();

    // Welcome ripple
    setTimeout(() => addRipple(width / 2, height / 2, 1.5), 100);

    return () => {
      cancelAnimationFrame(raf);
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      ro.disconnect();
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onClick);
      
      renderer.dispose();
      material.dispose();
      mesh.geometry.dispose();
      waterTexture.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" aria-hidden="true" />;
}
