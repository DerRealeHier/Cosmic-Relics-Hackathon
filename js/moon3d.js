/**
 * Comic / Cel-Shaded 3D Horizon & Monument Showcase Renderer (Moon, Mars, Deep Space)
 * Zero external CDN dependencies — custom WebGL2 comic toon shader + crisp black ink outlines.
 *
 * Matches the comic aesthetic of `stille_denkm_ler_des_mondes_nasa_space_apps(1).html`:
 *   - Hand-painted comic 2D canvas surface textures (`createComicSurfaceTexture(realm)`)
 *     with hand-drawn crater rings (bright highlight arc + dark shadow arc)
 *   - 96x96 displaced 3D sphere (`radius = 5.2`, `y = -3.55`) with wave-like comic ridge relief
 *     and a `1.006` black ink `BackSide` outline rim
 *   - 4-step quantized `MeshToonMaterial` cel-shading (`#475569`, `#94a3b8`, `#e2e8f0`, `#ffffff`)
 *   - 16 mission-specific, richly detailed comic 3D NASA hardware models sitting directly
 *     on the curved horizon ridge inside a glowing yellow `beaconAura` ring (`#fef08a`)
 */

const PLANET_VERT = `#version 300 es
precision highp float;
precision highp int;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat3 uNormalMatrix;
uniform float uOutlineScale; // > 1.0 when drawing comic ink outline pass

out vec3 vNormal;
out vec3 vWorldPos;
out vec2 vTexCoord;

void main() {
  vec3 pos = aPosition * uOutlineScale;
  vec3 norm = normalize(aNormal);

  vec4 worldPos = uModel * vec4(pos, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = normalize(uNormalMatrix * norm);
  vTexCoord = aTexCoord;
  gl_Position = uProjection * uView * worldPos;
}
`;

const PLANET_FRAG = `#version 300 es
precision highp float;
precision highp int;

in vec3 vNormal;
in vec3 vWorldPos;
in vec2 vTexCoord;

uniform sampler2D uBaseColorTex;
uniform float uOutlineScale;
uniform vec3 uBeaconPos;

out vec4 fragColor;

// Exact 4-step comic cel-shading ramp from stille_denkm_ler_des_mondes_nasa_space_apps(1).html
// (#475569 -> #94a3b8 -> #e2e8f0 -> #ffffff)
vec3 comicGradientRamp(float irr) {
  if (irr > 0.72) return vec3(1.00, 1.00, 1.00);
  if (irr > 0.44) return vec3(0.886, 0.910, 0.941);
  if (irr > 0.18) return vec3(0.580, 0.639, 0.722);
  return vec3(0.278, 0.333, 0.412);
}

void main() {
  // Pass 1: Crisp comic black ink outline (#050811)
  if (uOutlineScale > 1.0001) {
    fragColor = vec4(0.020, 0.031, 0.067, 1.0);
    return;
  }

  vec3 N = normalize(vNormal);
  // Crisp Comic Key Light (7, 12, 6) + Sky Fill (-7, 5, 8)
  vec3 L1 = normalize(vec3(7.0, 12.0, 6.0));
  vec3 L2 = normalize(vec3(-7.0, 5.0, 8.0));

  float diff1 = max(dot(N, L1), 0.0);
  float diff2 = max(dot(N, L2), 0.0) * 0.28;
  float totalIrr = clamp(diff1 * 0.92 + diff2 + 0.12, 0.0, 1.0);

  vec3 texColor = texture(uBaseColorTex, vTexCoord).rgb;
  vec3 toonRamp = comicGradientRamp(totalIrr);

  // Subtle golden beacon point light glow near the artifact ridge
  float distToBeacon = length(vWorldPos - uBeaconPos);
  float beaconGlow = clamp(1.0 - distToBeacon / 2.6, 0.0, 1.0);
  vec3 pointLightAdd = vec3(0.99, 0.88, 0.28) * (beaconGlow * beaconGlow * 0.20);

  vec3 color = texColor * toonRamp * 1.08 + pointLightAdd;
  fragColor = vec4(color, 1.0);
}
`;

const MONUMENT_VERT = `#version 300 es
precision highp float;
precision highp int;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec3 aColor;
layout(location = 3) in vec2 aMeta;      // x = outlineThickness, y = mode (0=toon, >0=emissive, <0=translucent)
layout(location = 4) in vec3 aPartPivot; // local pivot of each primitive part for uniform scale outline

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat3 uNormalMatrix;
uniform float uOutlinePass; // 1.0 when rendering comic black ink outline

out vec3 vNormal;
out vec3 vWorldPos;
out vec3 vColor;
out vec2 vMeta;

void main() {
  vec3 norm = normalize(aNormal);
  vec3 pos = aPosition;

  if (uOutlinePass > 0.5) {
    // Inflate part uniformly from its local center + along vertex normal for crisp comic ink outlines
    vec3 localOffset = pos - aPartPivot;
    pos = aPartPivot + localOffset * (1.0 + aMeta.x * 1.15) + norm * (aMeta.x * 0.55);
  }

  vec4 worldPos = uModel * vec4(pos, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = normalize(uNormalMatrix * norm);
  vColor = aColor;
  vMeta = aMeta;
  gl_Position = uProjection * uView * worldPos;
}
`;

const MONUMENT_FRAG = `#version 300 es
precision highp float;
precision highp int;

in vec3 vNormal;
in vec3 vWorldPos;
in vec3 vColor;
in vec2 vMeta;

uniform vec3 uCameraPos;
uniform float uPulse;
uniform float uOutlinePass;

out vec4 fragColor;

vec3 comicGradientRamp(float irr) {
  if (irr > 0.70) return vec3(1.04, 1.04, 1.04);
  if (irr > 0.42) return vec3(0.90, 0.92, 0.95);
  if (irr > 0.16) return vec3(0.64, 0.69, 0.76);
  return vec3(0.38, 0.43, 0.52);
}

void main() {
  // Pass 1: Crisp black ink outline (#050811)
  if (uOutlinePass > 0.5) {
    if (vMeta.x <= 0.0001) discard;
    fragColor = vec4(0.020, 0.031, 0.067, 1.0);
    return;
  }

  // Translucent MeshBasicMaterial mode (beaconAura ring & upward laserBeam: vMeta.y < 0 encodes -opacity)
  if (vMeta.y < 0.0) {
    float baseAlpha = clamp(-vMeta.y, 0.10, 0.95);
    float animAlpha = clamp(baseAlpha * (0.78 + 0.28 * uPulse), 0.12, 0.95);
    fragColor = vec4(vColor, animAlpha);
    return;
  }

  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) {
    N = -N;
  }
  vec3 L1 = normalize(vec3(7.0, 12.0, 8.5));
  vec3 L2 = normalize(vec3(-7.0, 5.0, 8.0));
  vec3 L3 = normalize(vec3(0.0, 2.0, 10.0));

  float diff = max(dot(N, L1), 0.0) * 0.85 + max(dot(N, L2), 0.0) * 0.35 + max(dot(N, L3), 0.0) * 0.38 + 0.18;
  vec3 ramp = comicGradientRamp(diff);

  // Emissive boost matching createComicMaterial(hex, emissiveHex, emissiveIntensity)
  float emissiveBoost = clamp(vMeta.y, 0.0, 1.0);
  vec3 shaded = vColor * mix(ramp, vec3(1.15), emissiveBoost * 0.65);

  fragColor = vec4(shaded, 1.0);
}
`;

// ============================================================================
// MATRIX & VECTOR MATH HELPERS
// ============================================================================
function mat4Perspective(fovyRad, aspect, near, far) {
  const f = 1.0 / Math.tan(fovyRad / 2);
  const nf = 1 / (near - far);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
  return out;
}

function mat4LookAt(eye, center, up) {
  let zx = eye[0] - center[0];
  let zy = eye[1] - center[1];
  let zz = eye[2] - center[2];
  let len = Math.hypot(zx, zy, zz) || 1;
  zx /= len; zy /= len; zz /= len;

  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  len = Math.hypot(xx, xy, xz) || 1;
  xx /= len; xy /= len; xz /= len;

  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  const out = new Float32Array(16);
  out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
  out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0;
  out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;
  out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
  out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
  out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
  out[15] = 1;
  return out;
}

function mat4Multiply(a, b) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[0 * 4 + r] * b[c * 4 + 0] +
        a[1 * 4 + r] * b[c * 4 + 1] +
        a[2 * 4 + r] * b[c * 4 + 2] +
        a[3 * 4 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

function mat4FromTranslationRotationScale(tx, ty, tz, rx, ry, rz, scale) {
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cz = Math.cos(rz), sz = Math.sin(rz);

  const r00 = cy * cz;
  const r01 = sx * sy * cz - cx * sz;
  const r02 = cx * sy * cz + sx * sz;

  const r10 = cy * sz;
  const r11 = sx * sy * sz + cx * cz;
  const r12 = cx * sy * sz - sx * cz;

  const r20 = -sy;
  const r21 = sx * cy;
  const r22 = cx * cy;

  const out = new Float32Array(16);
  out[0] = r00 * scale;
  out[1] = r10 * scale;
  out[2] = r20 * scale;
  out[3] = 0;

  out[4] = r01 * scale;
  out[5] = r11 * scale;
  out[6] = r21 * scale;
  out[7] = 0;

  out[8] = r02 * scale;
  out[9] = r12 * scale;
  out[10] = r22 * scale;
  out[11] = 0;

  out[12] = tx;
  out[13] = ty;
  out[14] = tz;
  out[15] = 1;
  return out;
}

function mat3FromMat4(m) {
  return new Float32Array([
    m[0], m[1], m[2],
    m[4], m[5], m[6],
    m[8], m[9], m[10]
  ]);
}

function createProgram(gl, vsSource, fsSource) {
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vsSource);
  gl.compileShader(vs);
  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    throw new Error('Vertex shader error: ' + gl.getShaderInfoLog(vs));
  }

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fsSource);
  gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    throw new Error('Fragment shader error: ' + gl.getShaderInfoLog(fs));
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error('Shader link error: ' + gl.getProgramInfoLog(prog));
  }
  return prog;
}

// ============================================================================
// COMIC-STYLED 2D SURFACE TEXTURE GENERATOR & 3D RELIEF SPHERE
// (Exact port of createLunarSurfaceTextures + 96x96 relief sphere from (1).html)
// ============================================================================
function createDeterministicRng(seed = 1969) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function createComicSurfaceCanvas(realm = 'moon') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const palettes = {
    moon: {
      base: '#94a3b8',
      patchInner: 'rgba(51, 65, 85, 0.42)',
      patchOuter: 'rgba(51, 65, 85, 0)',
      craterFill: 'rgba(30, 41, 59, 0.45)',
      rimLight: 'rgba(241, 245, 249, 0.62)',
      rimDark: 'rgba(15, 23, 42, 0.68)',
      seed: 1969
    },
    mars: {
      base: '#d97745',
      patchInner: 'rgba(124, 45, 18, 0.44)',
      patchOuter: 'rgba(124, 45, 18, 0)',
      craterFill: 'rgba(67, 20, 7, 0.45)',
      rimLight: 'rgba(254, 215, 170, 0.62)',
      rimDark: 'rgba(41, 13, 5, 0.68)',
      seed: 1997
    },
    universe: {
      base: '#64748b',
      patchInner: 'rgba(30, 58, 138, 0.42)',
      patchOuter: 'rgba(30, 58, 138, 0)',
      craterFill: 'rgba(15, 23, 42, 0.48)',
      rimLight: 'rgba(186, 230, 253, 0.62)',
      rimDark: 'rgba(8, 15, 32, 0.70)',
      seed: 1977
    }
  };

  const pal = palettes[realm] || palettes.moon;
  const rand = createDeterministicRng(pal.seed);

  // 1. Base comic regolith fill
  ctx.fillStyle = pal.base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Subtle maria / albedo patches
  for (let i = 0; i < 45; i++) {
    const mx = rand() * canvas.width;
    const my = rand() * canvas.height;
    const mr = rand() * 80 + 25;
    const grad = ctx.createRadialGradient(mx, my, 4, mx, my, mr);
    grad.addColorStop(0, pal.patchInner);
    grad.addColorStop(1, pal.patchOuter);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Hand-drawn comic impact craters with bright highlight & dark ink rim arcs
  for (let i = 0; i < 160; i++) {
    const cx = rand() * canvas.width;
    const cy = rand() * canvas.height;
    const cr = rand() * 20 + 3;

    ctx.fillStyle = pal.craterFill;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = pal.rimLight;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0.15 * Math.PI, 1.15 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = pal.rimDark;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, cr * 0.92, 1.15 * Math.PI, 2.15 * Math.PI);
    ctx.stroke();
  }

  return canvas;
}

function buildComicReliefSphere(radius = 5.2, latBands = 96, lonBands = 96) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // Helper to evaluate the exact displaced surface position at (theta, phi)
  function evalSurfacePoint(theta, phi) {
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    const ux = -cosPhi * sinTheta;
    const uy = cosTheta;
    const uz = sinPhi * sinTheta;

    const vx = ux * radius;
    const vy = uy * radius;
    const vz = uz * radius;

    // Exact wave-crater relief formula from stille_denkm_ler_des_mondes_nasa_space_apps(1).html (lines 764-768)
    const relief =
      Math.sin(vx * 3.1 + vy * 2.4) * 0.045 +
      Math.cos(vz * 4.2 - vx * 2.8) * 0.035 +
      Math.sin(vy * 7.5 + vz * 6.0) * 0.015;

    const r = radius + relief;
    return [ux * r, uy * r, uz * r];
  }

  const eps = 0.008;
  for (let lat = 0; lat <= latBands; lat++) {
    const theta = (lat * Math.PI) / latBands;
    for (let lon = 0; lon <= lonBands; lon++) {
      const phi = (lon * 2 * Math.PI) / lonBands;
      const p = evalSurfacePoint(theta, phi);
      positions.push(p[0], p[1], p[2]);

      // Compute vertex normal accounting for the comic wave relief
      const pTheta = evalSurfacePoint(Math.min(Math.PI, theta + eps), phi);
      const pPhi = evalSurfacePoint(theta, phi + eps);
      const tx = pTheta[0] - p[0], ty = pTheta[1] - p[1], tz = pTheta[2] - p[2];
      const bx = pPhi[0] - p[0],   by = pPhi[1] - p[1],   bz = pPhi[2] - p[2];

      let nx = by * tz - bz * ty;
      let ny = bz * tx - bx * tz;
      let nz = bx * ty - by * tx;
      const nLen = Math.hypot(nx, ny, nz) || 1;
      if (nx * p[0] + ny * p[1] + nz * p[2] < 0) {
        nx = -nx; ny = -ny; nz = -nz;
      }
      normals.push(nx / nLen, ny / nLen, nz / nLen);
      uvs.push(lon / lonBands, 1 - lat / latBands);
    }
  }

  for (let lat = 0; lat < latBands; lat++) {
    for (let lon = 0; lon < lonBands; lon++) {
      const first = lat * (lonBands + 1) + lon;
      const second = first + lonBands + 1;
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices)
  };
}

// Optional parser for custom user-uploaded .glb files
// ============================================================================
// OFFICIAL NASA .GLB PARSER -> COMIC / CEL-SHADED CONVERTER
// Traverses full glTF 2.0 node hierarchy, decodes embedded PBR textures &
// baseColorFactors, boosts vibrancy for cel-shading, and generates per-part
// black ink outline pivots so detailed NASA hardware looks comic-styled!
// ============================================================================
const OFFICIAL_NASA_GLBS = {
  apollo11:    { url: 'assets/nasa/models/apollo-lunar-module.glb', size: 0.92, aura: true,  centerY: false },
  viking1:     { url: 'assets/nasa/models/viking-lander.glb',       size: 0.90, aura: true,  centerY: false },
  opportunity: { url: 'assets/nasa/models/opportunity-mer.glb',     size: 0.88, aura: true,  centerY: false },
  insight:     { url: 'assets/nasa/models/insight-lander.glb',      size: 0.96, aura: true,  centerY: false },
  ingenuity:   { url: 'assets/nasa/models/ingenuity-helicopter.glb',size: 0.84, aura: true,  centerY: false },
  pioneer10:   { url: 'assets/nasa/models/pioneer10.glb',           size: 1.18, aura: false, centerY: true  },
  voyager1:    { url: 'assets/nasa/models/voyager.glb',             size: 1.50, aura: false, centerY: true  },
  voyager2:    { url: 'assets/nasa/models/voyager.glb',             size: 1.50, aura: false, centerY: true  },
  huygens:     { url: 'assets/nasa/models/cassini-huygens.glb',     size: 1.24, aura: false, centerY: true  },
  newhorizons: { url: 'assets/nasa/models/new-horizons.glb',        size: 1.10, aura: false, centerY: true  }
};

function mat4Identity() {
  const out = new Float32Array(16);
  out[0] = 1; out[5] = 1; out[10] = 1; out[15] = 1;
  return out;
}

function mat4FromTRS(t, q, s) {
  const x = q[0], y = q[1], z = q[2], w = q[3];
  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, xy = x * y2, xz = x * z2;
  const yy = y * y2, yz = y * z2, zz = z * z2;
  const wx = w * x2, wy = w * y2, wz = w * z2;
  const sx = s[0], sy = s[1], sz = s[2];
  const out = new Float32Array(16);
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[12] = t[0]; out[13] = t[1]; out[14] = t[2]; out[15] = 1;
  return out;
}

function comicBoostRgb(r, g, b) {
  // Prevent dark metallic NASA PBR surfaces from turning pitch black under toon shading
  const avg = (r + g + b) / 3;
  const sat = 1.24;
  let cr = avg + (r - avg) * sat;
  let cg = avg + (g - avg) * sat;
  let cb = avg + (b - avg) * sat;
  const lum = 0.299 * cr + 0.587 * cg + 0.114 * cb;
  if (lum < 0.16) {
    const lift = 0.16 - lum;
    cr += lift * 0.9;
    cg += lift * 0.95;
    cb += lift * 1.1;
  }
  return [
    Math.max(0.05, Math.min(1.0, cr)),
    Math.max(0.05, Math.min(1.0, cg)),
    Math.max(0.05, Math.min(1.0, cb))
  ];
}

let _dracoDecoderPromise = null;
function getDracoDecoder() {
  if (_dracoDecoderPromise) return _dracoDecoderPromise;
  _dracoDecoderPromise = new Promise((resolve, reject) => {
    const initModule = () => {
      if (typeof window.DracoDecoderModule !== 'function') {
        reject(new Error('DracoDecoderModule unavailable'));
        return;
      }
      Promise.resolve(window.DracoDecoderModule({
        locateFile: (file) => `assets/vendor/draco/${file}`
      })).then(resolve, reject);
    };
    if (typeof window.DracoDecoderModule === 'function') {
      initModule();
      return;
    }
    const script = document.createElement('script');
    script.src = 'assets/vendor/draco/draco_decoder_gltf.js';
    script.async = true;
    script.onload = initModule;
    script.onerror = () => reject(new Error('Failed to load Draco glTF decoder'));
    document.head.appendChild(script);
  });
  return _dracoDecoderPromise;
}

async function parseGlbBuffer(arrayBuffer, opts = {}) {
  const { targetSize = 0.96, addBeaconAura = false, centerY = false } = opts;
  const view = new DataView(arrayBuffer);
  const magic = view.getUint32(0, true);
  if (magic !== 0x46546c67) {
    throw new Error('Invalid GLB file header');
  }

  const totalLength = view.getUint32(8, true);
  let offset = 12;
  let jsonChunk = null;
  let binChunk = null;

  while (offset < totalLength) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    offset += 8;
    if (chunkType === 0x4e4f534a) {
      const jsonBytes = new Uint8Array(arrayBuffer, offset, chunkLength);
      jsonChunk = JSON.parse(new TextDecoder('utf-8').decode(jsonBytes));
    } else if (chunkType === 0x004e4942) {
      binChunk = arrayBuffer.slice(offset, offset + chunkLength);
    }
    offset += chunkLength;
  }

  if (!jsonChunk || !binChunk) {
    throw new Error('Incomplete GLB chunks');
  }

  const usesDraco =
    jsonChunk.extensionsUsed?.includes('KHR_draco_mesh_compression') ||
    jsonChunk.extensionsRequired?.includes('KHR_draco_mesh_compression');
  const draco = usesDraco ? await getDracoDecoder() : null;

  // Decode embedded glTF images into small 2D ImageData buffers for fast per-vertex comic color sampling
  const decodedImages = [];
  if (Array.isArray(jsonChunk.images) && typeof createImageBitmap === 'function') {
    const decodeCanvas = document.createElement('canvas');
    const decodeCtx = decodeCanvas.getContext('2d', { willReadFrequently: true });
    for (let i = 0; i < jsonChunk.images.length; i++) {
      const imgDef = jsonChunk.images[i];
      if (imgDef.bufferView === undefined) {
        decodedImages.push(null);
        continue;
      }
      try {
        const bv = jsonChunk.bufferViews[imgDef.bufferView];
        const bytes = new Uint8Array(binChunk, bv.byteOffset || 0, bv.byteLength);
        const blob = new Blob([bytes], { type: imgDef.mimeType || 'image/png' });
        const bmp = await createImageBitmap(blob);
        const w = Math.min(256, Math.max(1, bmp.width));
        const h = Math.min(256, Math.max(1, bmp.height));
        decodeCanvas.width = w;
        decodeCanvas.height = h;
        decodeCtx.clearRect(0, 0, w, h);
        decodeCtx.drawImage(bmp, 0, 0, w, h);
        bmp.close?.();
        decodedImages.push({ w, h, data: decodeCtx.getImageData(0, 0, w, h).data });
      } catch (_) {
        decodedImages.push(null);
      }
    }
  }

  const COMP_SIZE = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
  const TYPE_COUNT = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };

  function readAccessorAsFloat(accIdx) {
    if (accIdx === undefined) return null;
    const acc = jsonChunk.accessors[accIdx];
    if (!acc) return null;
    const numComp = TYPE_COUNT[acc.type] || 1;
    if (acc.bufferView === undefined) {
      return new Float32Array(acc.count * numComp);
    }
    const bv = jsonChunk.bufferViews[acc.bufferView];
    if (!bv) return new Float32Array(acc.count * numComp);
    const compSize = COMP_SIZE[acc.componentType] || 4;
    const stride = bv.byteStride || numComp * compSize;
    const base = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    const dv = new DataView(binChunk);
    const out = new Float32Array(acc.count * numComp);
    const norm = Boolean(acc.normalized);

    for (let i = 0; i < acc.count; i++) {
      const row = base + i * stride;
      for (let c = 0; c < numComp; c++) {
        const p = row + c * compSize;
        let v = 0;
        if (acc.componentType === 5126) v = dv.getFloat32(p, true);
        else if (acc.componentType === 5121) v = norm ? dv.getUint8(p) / 255 : dv.getUint8(p);
        else if (acc.componentType === 5123) v = norm ? dv.getUint16(p, true) / 65535 : dv.getUint16(p, true);
        else if (acc.componentType === 5125) v = dv.getUint32(p, true);
        out[i * numComp + c] = v;
      }
    }
    return out;
  }

  function readIndices(accIdx, vertCount) {
    if (accIdx === undefined) {
      const seq = new Uint32Array(vertCount);
      for (let i = 0; i < vertCount; i++) seq[i] = i;
      return seq;
    }
    const acc = jsonChunk.accessors[accIdx];
    if (!acc || acc.bufferView === undefined || !jsonChunk.bufferViews[acc.bufferView]) {
      const seq = new Uint32Array(vertCount);
      for (let i = 0; i < vertCount; i++) seq[i] = i;
      return seq;
    }
    const bv = jsonChunk.bufferViews[acc.bufferView];
    const compSize = COMP_SIZE[acc.componentType] || 2;
    const stride = bv.byteStride || compSize;
    const base = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    const dv = new DataView(binChunk);
    const out = new Uint32Array(acc.count);
    for (let i = 0; i < acc.count; i++) {
      const p = base + i * stride;
      if (acc.componentType === 5123) out[i] = dv.getUint16(p, true);
      else if (acc.componentType === 5125) out[i] = dv.getUint32(p, true);
      else if (acc.componentType === 5121) out[i] = dv.getUint8(p);
    }
    return out;
  }

  const positions = [];
  const normals = [];
  const colors = [];
  const metas = [];
  const pivots = [];
  const indices = [];

  function decodeDracoPrimitive(dracoExt) {
    const bv = jsonChunk.bufferViews[dracoExt.bufferView];
    if (!bv) return null;
    const compressed = new Int8Array(binChunk, bv.byteOffset || 0, bv.byteLength);
    const decoder = new draco.Decoder();
    const dracoBuf = new draco.DecoderBuffer();
    const mesh = new draco.Mesh();
    try {
      dracoBuf.Init(compressed, compressed.length);
      const geomType = decoder.GetEncodedGeometryType(dracoBuf);
      if (geomType !== draco.TRIANGULAR_MESH) return null;
      const status = decoder.DecodeBufferToMesh(dracoBuf, mesh);
      if (!status.ok() || mesh.ptr === 0) return null;

      const numPoints = mesh.num_points();
      const numFaces = mesh.num_faces();
      const idxArr = new Uint32Array(numFaces * 3);
      const ia = new draco.DracoInt32Array();
      try {
        for (let f = 0; f < numFaces; f++) {
          decoder.GetFaceFromMesh(mesh, f, ia);
          idxArr[f * 3] = ia.GetValue(0);
          idxArr[f * 3 + 1] = ia.GetValue(1);
          idxArr[f * 3 + 2] = ia.GetValue(2);
        }
      } finally {
        draco.destroy(ia);
      }

      const readDracoAttr = (attrName) => {
        const uid = dracoExt.attributes?.[attrName];
        if (uid === undefined) return null;
        const attr = decoder.GetAttributeByUniqueId(mesh, uid);
        if (!attr || attr.ptr === 0) return null;
        const numComp = attr.num_components();
        const arr = new draco.DracoFloat32Array();
        try {
          decoder.GetAttributeFloatForAllPoints(mesh, attr, arr);
          const out = new Float32Array(numPoints * numComp);
          for (let i = 0; i < out.length; i++) {
            out[i] = arr.GetValue(i);
          }
          return out;
        } finally {
          draco.destroy(arr);
        }
      };

      return {
        posArr: readDracoAttr('POSITION'),
        normArr: readDracoAttr('NORMAL'),
        uvArr: readDracoAttr('TEXCOORD_0'),
        colArr: readDracoAttr('COLOR_0'),
        idxArr
      };
    } finally {
      draco.destroy(mesh);
      draco.destroy(dracoBuf);
      draco.destroy(decoder);
    }
  }

  function appendPrimitive(prim, worldMat) {
    if (prim.mode !== undefined && prim.mode !== 4) return; // TRIANGLES only
    const dracoExt = prim.extensions?.KHR_draco_mesh_compression;
    let posArr, normArr, uvArr, colArr, idxArr;
    if (dracoExt && draco) {
      const decoded = decodeDracoPrimitive(dracoExt);
      if (!decoded || !decoded.posArr || !decoded.posArr.length) return;
      posArr = decoded.posArr;
      normArr = decoded.normArr;
      uvArr = decoded.uvArr;
      colArr = decoded.colArr;
      idxArr = decoded.idxArr;
    } else {
      posArr = readAccessorAsFloat(prim.attributes?.POSITION);
      if (!posArr || !posArr.length) return;
      normArr = readAccessorAsFloat(prim.attributes?.NORMAL);
      uvArr = readAccessorAsFloat(prim.attributes?.TEXCOORD_0);
      colArr = readAccessorAsFloat(prim.attributes?.COLOR_0);
      idxArr = readIndices(prim.indices, posArr.length / 3);
    }

    const vertCount = posArr.length / 3;
    const colStride = colArr ? colArr.length / vertCount : 0;

    // Resolve material baseColorFactor + baseColorTexture
    let baseFactor = [0.85, 0.88, 0.92];
    let emissiveBoost = 0.08;
    let texImg = null;
    if (prim.material !== undefined && jsonChunk.materials?.[prim.material]) {
      const mat = jsonChunk.materials[prim.material];
      const pbr = mat.pbrMetallicRoughness || {};
      if (Array.isArray(pbr.baseColorFactor)) {
        baseFactor = [pbr.baseColorFactor[0], pbr.baseColorFactor[1], pbr.baseColorFactor[2]];
      }
      if (Array.isArray(mat.emissiveFactor)) {
        const em = Math.max(mat.emissiveFactor[0], mat.emissiveFactor[1], mat.emissiveFactor[2]);
        emissiveBoost = Math.max(emissiveBoost, Math.min(0.85, em));
      }
      if (pbr.baseColorTexture?.index !== undefined) {
        const texDef = jsonChunk.textures?.[pbr.baseColorTexture.index];
        if (texDef?.source !== undefined) {
          texImg = decodedImages[texDef.source] || null;
        }
      }
    }

    // Transform positions by node world matrix and find primitive center for comic outline pivot
    const baseVertex = positions.length / 3;
    const m = worldMat;
    let pMinX = Infinity, pMinY = Infinity, pMinZ = Infinity;
    let pMaxX = -Infinity, pMaxY = -Infinity, pMaxZ = -Infinity;
    const txPos = new Float32Array(posArr.length);

    for (let i = 0; i < vertCount; i++) {
      const x = posArr[i * 3], y = posArr[i * 3 + 1], z = posArr[i * 3 + 2];
      const wx = m[0] * x + m[4] * y + m[8] * z + m[12];
      const wy = m[1] * x + m[5] * y + m[9] * z + m[13];
      const wz = m[2] * x + m[6] * y + m[10] * z + m[14];
      txPos[i * 3] = wx;
      txPos[i * 3 + 1] = wy;
      txPos[i * 3 + 2] = wz;
      if (wx < pMinX) pMinX = wx; if (wx > pMaxX) pMaxX = wx;
      if (wy < pMinY) pMinY = wy; if (wy > pMaxY) pMaxY = wy;
      if (wz < pMinZ) pMinZ = wz; if (wz > pMaxZ) pMaxZ = wz;
    }

    const pivX = (pMinX + pMaxX) * 0.5;
    const pivY = (pMinY + pMaxY) * 0.5;
    const pivZ = (pMinZ + pMaxZ) * 0.5;

    // Compute fallback face normals if NORMAL is absent
    if (!normArr) {
      normArr = new Float32Array(posArr.length);
      for (let i = 0; i < idxArr.length; i += 3) {
        const a = idxArr[i] * 3, b = idxArr[i + 1] * 3, c = idxArr[i + 2] * 3;
        const ax = posArr[b] - posArr[a], ay = posArr[b + 1] - posArr[a + 1], az = posArr[b + 2] - posArr[a + 2];
        const bx = posArr[c] - posArr[a], by = posArr[c + 1] - posArr[a + 1], bz = posArr[c + 2] - posArr[a + 2];
        const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
        normArr[a] += nx; normArr[a + 1] += ny; normArr[a + 2] += nz;
        normArr[b] += nx; normArr[b + 1] += ny; normArr[b + 2] += nz;
        normArr[c] += nx; normArr[c + 1] += ny; normArr[c + 2] += nz;
      }
    }

    for (let i = 0; i < vertCount; i++) {
      positions.push(txPos[i * 3], txPos[i * 3 + 1], txPos[i * 3 + 2]);

      const nx0 = normArr[i * 3], ny0 = normArr[i * 3 + 1], nz0 = normArr[i * 3 + 2];
      const wnx = m[0] * nx0 + m[4] * ny0 + m[8] * nz0;
      const wny = m[1] * nx0 + m[5] * ny0 + m[9] * nz0;
      const wnz = m[2] * nx0 + m[6] * ny0 + m[10] * nz0;
      const nLen = Math.hypot(wnx, wny, wnz) || 1;
      normals.push(wnx / nLen, wny / nLen, wnz / nLen);

      let r = baseFactor[0], g = baseFactor[1], b = baseFactor[2];
      if (texImg && uvArr) {
        const u = ((uvArr[i * 2] % 1) + 1) % 1;
        const v = ((uvArr[i * 2 + 1] % 1) + 1) % 1;
        const px = Math.min(texImg.w - 1, Math.floor(u * texImg.w));
        const py = Math.min(texImg.h - 1, Math.floor(v * texImg.h));
        const off = (py * texImg.w + px) * 4;
        r *= texImg.data[off] / 255;
        g *= texImg.data[off + 1] / 255;
        b *= texImg.data[off + 2] / 255;
      }
      if (colArr) {
        r *= colArr[i * colStride];
        g *= colArr[i * colStride + 1];
        b *= colArr[i * colStride + 2];
      }

      const [cr, cg, cb] = comicBoostRgb(r, g, b);
      colors.push(cr, cg, cb);
      metas.push(0.008, emissiveBoost);
      pivots.push(pivX, pivY, pivZ);
    }

    for (let i = 0; i < idxArr.length; i++) {
      indices.push(baseVertex + idxArr[i]);
    }
  }

  function walkNode(nodeIdx, parentMat) {
    const node = jsonChunk.nodes?.[nodeIdx];
    if (!node) return;
    let localMat;
    if (Array.isArray(node.matrix)) {
      localMat = new Float32Array(node.matrix);
    } else {
      localMat = mat4FromTRS(
        node.translation || [0, 0, 0],
        node.rotation || [0, 0, 0, 1],
        node.scale || [1, 1, 1]
      );
    }
    const worldMat = mat4Multiply(parentMat, localMat);
    if (node.mesh !== undefined && jsonChunk.meshes?.[node.mesh]) {
      for (const prim of jsonChunk.meshes[node.mesh].primitives || []) {
        appendPrimitive(prim, worldMat);
      }
    }
    for (const childIdx of node.children || []) {
      walkNode(childIdx, worldMat);
    }
  }

  const sceneIdx = jsonChunk.scene || 0;
  const rootNodes = jsonChunk.scenes?.[sceneIdx]?.nodes || [0];
  const rootMat = mat4Identity();
  for (const nIdx of rootNodes) {
    walkNode(nIdx, rootMat);
  }

  // Normalize overall model scale & ground/center position
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }

  const cx = (minX + maxX) * 0.5;
  const cy = centerY ? (minY + maxY) * 0.5 : minY;
  const cz = (minZ + maxZ) * 0.5;
  const maxExtent = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;
  const scale = targetSize / maxExtent;

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (positions[i] - cx) * scale;
    positions[i + 1] = (positions[i + 1] - cy) * scale + (centerY ? 0.0 : 0.04);
    positions[i + 2] = (positions[i + 2] - cz) * scale;

    pivots[i] = (pivots[i] - cx) * scale;
    pivots[i + 1] = (pivots[i + 1] - cy) * scale + (centerY ? 0.0 : 0.04);
    pivots[i + 2] = (pivots[i + 2] - cz) * scale;
  }

  if (addBeaconAura) {
    const auraRing = makeRingGeometry(0.46, 0.54, 40);
    const baseV = positions.length / 3;
    for (let i = 0; i < auraRing.positions.length; i += 3) {
      const px = auraRing.positions[i], py = auraRing.positions[i + 1], pz = auraRing.positions[i + 2];
      positions.push(px, py + 0.03, pz);
      normals.push(0, 1, 0);
      colors.push(0.996, 0.941, 0.541);
      metas.push(0.0, -0.35);
      pivots.push(0, 0.03, 0);
    }
    for (let i = 0; i < auraRing.indices.length; i++) {
      indices.push(baseV + auraRing.indices[i]);
    }
  }

  const useUint32 = positions.length / 3 > 65535;
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    colors: new Float32Array(colors),
    metas: new Float32Array(metas),
    pivots: new Float32Array(pivots),
    indices: useUint32 ? new Uint32Array(indices) : new Uint16Array(indices)
  };
}

// ============================================================================
// PROCEDURAL 3D COMIC / CEL-SHADED HARDWARE BUILDER
// Exact color palette from stille_denkm_ler_des_mondes_nasa_space_apps(1).html (lines 858-866)
// ============================================================================
const PALETTE = {
  goldFoil:    [0.984, 0.749, 0.141], // 0xfbbf24
  deepOrange:  [0.976, 0.451, 0.086], // 0xf97316
  whiteHull:   [0.973, 0.980, 0.988], // 0xf8fafc
  slateMetal:  [0.392, 0.455, 0.545], // 0x64748b
  darkSteel:   [0.118, 0.161, 0.231], // 0x1e293b
  skySolar:    [0.008, 0.518, 0.780], // 0x0284c7
  laserCyan:   [0.133, 0.827, 0.933], // 0x22d3ee
  crimsonFlag: [0.937, 0.267, 0.267], // 0xef4444
  cobaltBlue:  [0.145, 0.388, 0.922], // 0x2563eb
  beaconAura:  [0.996, 0.941, 0.541], // 0xfef08a
  arrokothRed: [0.820, 0.310, 0.240]
};

class MeshBuilder {
  constructor() {
    this.positions = [];
    this.normals = [];
    this.colors = [];
    this.metas = [];  // [outlineWidth, mode]
    this.pivots = []; // [px, py, pz] center of part for uniform BackSide outline scaling
    this.indices = [];
  }

  addPart(geom, opts = {}) {
    const {
      translate = [0, 0, 0],
      rotate = [0, 0, 0],
      scale = [1, 1, 1],
      color = PALETTE.whiteHull,
      outline = 0.014,
      mode = 0.0
    } = opts;

    const baseVertex = this.positions.length / 3;
    const [tx, ty, tz] = translate;
    const [rx, ry, rz] = rotate;
    const [sx, sy, sz] = Array.isArray(scale) ? scale : [scale, scale, scale];

    // Three.js Euler 'XYZ' intrinsic rotation matrix: R = Rx * Ry * Rz
    const cx = Math.cos(rx), sX = Math.sin(rx);
    const cy = Math.cos(ry), sY = Math.sin(ry);
    const cz = Math.cos(rz), sZ = Math.sin(rz);

    const r00 = cy * cz;
    const r01 = -cy * sZ;
    const r02 = sY;

    const r10 = sX * sY * cz + cx * sZ;
    const r11 = -sX * sY * sZ + cx * cz;
    const r12 = -sX * cy;

    const r20 = -cx * sY * cz + sX * sZ;
    const r21 = cx * sY * sZ + sX * cz;
    const r22 = cx * cy;

    for (let i = 0; i < geom.positions.length; i += 3) {
      const px = geom.positions[i] * sx;
      const py = geom.positions[i + 1] * sy;
      const pz = geom.positions[i + 2] * sz;

      const wx = r00 * px + r01 * py + r02 * pz + tx;
      const wy = r10 * px + r11 * py + r12 * pz + ty;
      const wz = r20 * px + r21 * py + r22 * pz + tz;
      this.positions.push(wx, wy, wz);

      const nx = geom.normals[i] / (sx || 1);
      const ny = geom.normals[i + 1] / (sy || 1);
      const nz = geom.normals[i + 2] / (sz || 1);
      const wnx = r00 * nx + r01 * ny + r02 * nz;
      const wny = r10 * nx + r11 * py * 0 + r11 * ny + r12 * nz;
      const wnz = r20 * nx + r21 * ny + r22 * nz;
      const len = Math.hypot(wnx, wny, wnz) || 1;
      this.normals.push(wnx / len, wny / len, wnz / len);

      this.colors.push(color[0], color[1], color[2]);
      this.metas.push(outline, mode);
      this.pivots.push(tx, ty, tz);
    }

    for (let i = 0; i < geom.indices.length; i++) {
      this.indices.push(baseVertex + geom.indices[i]);
    }
  }

  addGroup(childBuilder, opts = {}) {
    const {
      translate = [0, 0, 0],
      rotate = [0, 0, 0],
      scale = [1, 1, 1]
    } = opts;

    const baseVertex = this.positions.length / 3;
    const [tx, ty, tz] = translate;
    const [rx, ry, rz] = rotate;
    const [sx, sy, sz] = Array.isArray(scale) ? scale : [scale, scale, scale];

    const cx = Math.cos(rx), sX = Math.sin(rx);
    const cy = Math.cos(ry), sY = Math.sin(ry);
    const cz = Math.cos(rz), sZ = Math.sin(rz);

    const r00 = cy * cz;
    const r01 = -cy * sZ;
    const r02 = sY;

    const r10 = sX * sY * cz + cx * sZ;
    const r11 = -sX * sY * sZ + cx * cz;
    const r12 = -sX * cy;

    const r20 = -cx * sY * cz + sX * sZ;
    const r21 = cx * sY * sZ + sX * cz;
    const r22 = cx * cy;

    for (let i = 0; i < childBuilder.positions.length; i += 3) {
      const vIdx = i / 3;
      const px = childBuilder.positions[i] * sx;
      const py = childBuilder.positions[i + 1] * sy;
      const pz = childBuilder.positions[i + 2] * sz;

      const wx = r00 * px + r01 * py + r02 * pz + tx;
      const wy = r10 * px + r11 * py + r12 * pz + ty;
      const wz = r20 * px + r21 * py + r22 * pz + tz;
      this.positions.push(wx, wy, wz);

      const nx = childBuilder.normals[i] / (sx || 1);
      const ny = childBuilder.normals[i + 1] / (sy || 1);
      const nz = childBuilder.normals[i + 2] / (sz || 1);
      const wnx = r00 * nx + r01 * ny + r02 * nz;
      const wny = r10 * nx + r11 * ny + r12 * nz;
      const wnz = r20 * nx + r21 * ny + r22 * nz;
      const len = Math.hypot(wnx, wny, wnz) || 1;
      this.normals.push(wnx / len, wny / len, wnz / len);

      this.colors.push(
        childBuilder.colors[i],
        childBuilder.colors[i + 1],
        childBuilder.colors[i + 2]
      );
      this.metas.push(
        childBuilder.metas[vIdx * 2],
        childBuilder.metas[vIdx * 2 + 1]
      );

      const pivX = childBuilder.pivots[i] * sx;
      const pivY = childBuilder.pivots[i + 1] * sy;
      const pivZ = childBuilder.pivots[i + 2] * sz;
      this.pivots.push(
        r00 * pivX + r01 * pivY + r02 * pivZ + tx,
        r10 * pivX + r11 * pivY + r12 * pivZ + ty,
        r20 * pivX + r21 * pivY + r22 * pivZ + tz
      );
    }

    for (let i = 0; i < childBuilder.indices.length; i++) {
      this.indices.push(baseVertex + childBuilder.indices[i]);
    }
  }
}

// ============================================================================
// PRIMITIVE GEOMETRY GENERATORS
// ============================================================================
function makeBoxGeometry(w = 1, h = 1, d = 1) {
  const hw = w * 0.5, hh = h * 0.5, hd = d * 0.5;
  const faces = [
    { n: [0, 0, 1],  v: [[-hw, -hh,  hd], [ hw, -hh,  hd], [ hw,  hh,  hd], [-hw,  hh,  hd]] },
    { n: [0, 0, -1], v: [[ hw, -hh, -hd], [-hw, -hh, -hd], [-hw,  hh, -hd], [ hw,  hh, -hd]] },
    { n: [0, 1, 0],  v: [[-hw,  hh,  hd], [ hw,  hh,  hd], [ hw,  hh, -hd], [-hw,  hh, -hd]] },
    { n: [0, -1, 0], v: [[-hw, -hh, -hd], [ hw, -hh, -hd], [ hw, -hh,  hd], [-hw, -hh,  hd]] },
    { n: [1, 0, 0],  v: [[ hw, -hh,  hd], [ hw, -hh, -hd], [ hw,  hh, -hd], [ hw,  hh,  hd]] },
    { n: [-1, 0, 0], v: [[-hw, -hh, -hd], [-hw, -hh,  hd], [-hw,  hh,  hd], [-hw,  hh, -hd]] }
  ];
  const positions = [];
  const normals = [];
  const indices = [];
  faces.forEach((f, idx) => {
    const base = idx * 4;
    f.v.forEach((p) => {
      positions.push(p[0], p[1], p[2]);
      normals.push(f.n[0], f.n[1], f.n[2]);
    });
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });
  return { positions, normals, indices };
}

function makeCylinderGeometry(rTop = 1, rBottom = 1, height = 1, segs = 16, openEnded = false) {
  const hh = height * 0.5;
  const positions = [];
  const normals = [];
  const indices = [];

  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    const slope = (rBottom - rTop) / (height || 1);
    const nLen = Math.hypot(c, slope, s) || 1;

    positions.push(rTop * c, hh, rTop * s);
    normals.push(c / nLen, slope / nLen, s / nLen);

    positions.push(rBottom * c, -hh, rBottom * s);
    normals.push(c / nLen, slope / nLen, s / nLen);
  }

  for (let i = 0; i < segs; i++) {
    const i0 = i * 2;
    const i1 = i0 + 1;
    const i2 = i0 + 2;
    const i3 = i0 + 3;
    indices.push(i0, i1, i2, i1, i3, i2);
  }

  if (!openEnded && rTop > 0.0001) {
    const topCenter = positions.length / 3;
    positions.push(0, hh, 0);
    normals.push(0, 1, 0);
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      positions.push(rTop * Math.cos(a), hh, rTop * Math.sin(a));
      normals.push(0, 1, 0);
    }
    for (let i = 0; i < segs; i++) {
      indices.push(topCenter, topCenter + i + 2, topCenter + i + 1);
    }
  }

  if (!openEnded && rBottom > 0.0001) {
    const botCenter = positions.length / 3;
    positions.push(0, -hh, 0);
    normals.push(0, -1, 0);
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      positions.push(rBottom * Math.cos(a), -hh, rBottom * Math.sin(a));
      normals.push(0, -1, 0);
    }
    for (let i = 0; i < segs; i++) {
      indices.push(botCenter, botCenter + i + 1, botCenter + i + 2);
    }
  }

  return { positions, normals, indices };
}

function makeConeGeometry(radius = 1, height = 1, segs = 16, openEnded = false) {
  return makeCylinderGeometry(0.002, radius, height, segs, openEnded);
}

function makeSphereGeometry(radius = 1, latBands = 12, lonBands = 14) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let lat = 0; lat <= latBands; lat++) {
    const theta = (lat * Math.PI) / latBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    for (let lon = 0; lon <= lonBands; lon++) {
      const phi = (lon * 2 * Math.PI) / lonBands;
      const x = Math.cos(phi) * sinTheta;
      const y = cosTheta;
      const z = Math.sin(phi) * sinTheta;
      positions.push(radius * x, radius * y, radius * z);
      normals.push(x, y, z);
    }
  }

  for (let lat = 0; lat < latBands; lat++) {
    for (let lon = 0; lon < lonBands; lon++) {
      const first = lat * (lonBands + 1) + lon;
      const second = first + lonBands + 1;
      indices.push(first, second, first + 1, second, second + 1, first + 1);
    }
  }
  return { positions, normals, indices };
}

function makeTorusGeometry(R = 0.34, tubeR = 0.065, radialSegs = 12, tubularSegs = 24) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let j = 0; j <= radialSegs; j++) {
    const v = (j / radialSegs) * Math.PI * 2;
    const cosV = Math.cos(v), sinV = Math.sin(v);
    for (let i = 0; i <= tubularSegs; i++) {
      const u = (i / tubularSegs) * Math.PI * 2;
      const cosU = Math.cos(u), sinU = Math.sin(u);

      const x = (R + tubeR * cosV) * cosU;
      const y = (R + tubeR * cosV) * sinU;
      const z = tubeR * sinV;
      positions.push(x, y, z);
      normals.push(cosV * cosU, cosV * sinU, sinV);
    }
  }

  for (let j = 0; j < radialSegs; j++) {
    for (let i = 0; i < tubularSegs; i++) {
      const a = (tubularSegs + 1) * j + i;
      const b = (tubularSegs + 1) * (j + 1) + i;
      const c = (tubularSegs + 1) * (j + 1) + i + 1;
      const d = (tubularSegs + 1) * j + i + 1;
      indices.push(a, b, d, b, c, d);
    }
  }
  return { positions, normals, indices };
}

function makeOctahedronGeometry(r = 0.04) {
  const v = [
    [ r,  0,  0], [-r,  0,  0],
    [ 0,  r,  0], [ 0, -r,  0],
    [ 0,  0,  r], [ 0,  0, -r]
  ];
  const faces = [
    [0, 2, 4], [4, 2, 1], [1, 2, 5], [5, 2, 0],
    [4, 3, 0], [1, 3, 4], [5, 3, 1], [0, 3, 5]
  ];
  const positions = [];
  const normals = [];
  const indices = [];
  faces.forEach((f, idx) => {
    const p0 = v[f[0]], p1 = v[f[1]], p2 = v[f[2]];
    const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2];
    const vx = p2[0] - p0[0], vy = p2[1] - p0[1], vz = p2[2] - p0[2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len; ny /= len; nz /= len;
    const base = idx * 3;
    [p0, p1, p2].forEach((p) => {
      positions.push(p[0], p[1], p[2]);
      normals.push(nx, ny, nz);
    });
    indices.push(base, base + 1, base + 2);
  });
  return { positions, normals, indices };
}

function makeRingGeometry(innerR = 0.54, outerR = 0.64, segs = 36) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    positions.push(innerR * c, 0, innerR * s);
    normals.push(0, 1, 0);
    positions.push(outerR * c, 0, outerR * s);
    normals.push(0, 1, 0);
  }
  for (let i = 0; i < segs; i++) {
    const b = i * 2;
    indices.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
  }
  return { positions, normals, indices };
}

// ============================================================================
// LUMINOUS COMIC BEACON RING ON THE DUST (Exact port of lines 1058-1070 in (1).html)
// No grey base disc — the comic hardware sits directly on the surface inside the yellow ring!
// ============================================================================
function addComicBeaconAura(mb) {
  mb.addPart(makeRingGeometry(0.54, 0.64, 36), {
    translate: [0, 0.02, 0],
    color: PALETTE.beaconAura,
    outline: 0.0,
    mode: -0.78
  });
}

// ============================================================================
// 16 MISSION-SPECIFIC DETAILED COMIC 3D MODELS (MOON, MARS & UNIVERSE)
// ============================================================================
function buildDetailedArtifactMesh(id, fallbackType = 'apollo11') {
  const mb = new MeshBuilder();
  const key = id || fallbackType;

  // ==========================================================================
  // MOON MISSIONS (6) — Exact recipes from stille_denkm_ler_des_mondes_nasa_space_apps(1).html
  // ==========================================================================
  if (key === 'apollo11') {
    // 1. APOLLO 11: Detailed LM-5 "Eagle" Descent Stage + Ladder + Laser Retroreflector + US Flag
    mb.addPart(makeCylinderGeometry(0.26, 0.28, 0.22, 8), {
      translate: [0, 0.22, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    mb.addPart(makeBoxGeometry(0.36, 0.20, 0.36), {
      translate: [0, 0.22, 0],
      rotate: [0, Math.PI / 4, 0],
      color: PALETTE.deepOrange,
      mode: 0.20
    });
    // Upper docking collar & thruster bell
    mb.addPart(makeCylinderGeometry(0.15, 0.21, 0.08, 8), {
      translate: [0, 0.36, 0],
      color: PALETTE.darkSteel
    });
    mb.addPart(makeConeGeometry(0.06, 0.09, 12), {
      translate: [0, 0.08, 0],
      rotate: [Math.PI, 0, 0],
      color: PALETTE.darkSteel
    });

    // 4 Articulated Landing Legs + Circular Footpads + Boarding Ladder
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const legGroup = new MeshBuilder();
      legGroup.addPart(makeCylinderGeometry(0.015, 0.015, 0.36, 8), {
        translate: [0.27, 0.15, 0],
        rotate: [0, 0, -0.58],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      legGroup.addPart(makeCylinderGeometry(0.01, 0.01, 0.26, 8), {
        translate: [0.22, 0.22, 0],
        rotate: [0, 0, 0.55],
        color: PALETTE.slateMetal
      });
      legGroup.addPart(makeCylinderGeometry(0.065, 0.075, 0.022, 14), {
        translate: [0.37, 0.012, 0],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      if (i === 0) {
        legGroup.addPart(makeBoxGeometry(0.03, 0.26, 0.06), {
          translate: [0.29, 0.16, 0],
          rotate: [0, 0, -0.58],
          color: PALETTE.whiteHull
        });
      }
      mb.addGroup(legGroup, { rotate: [0, angle, 0] });
    }

    // Deployed Lunar Laser Ranging Retroreflector (LRRR) beside Eagle with glowing cyan prism grid
    const lrrrGroup = new MeshBuilder();
    lrrrGroup.addPart(makeBoxGeometry(0.13, 0.05, 0.11), {
      translate: [0, 0.03, 0],
      color: PALETTE.whiteHull
    });
    lrrrGroup.addPart(makeBoxGeometry(0.11, 0.02, 0.09), {
      translate: [0, 0.065, 0],
      rotate: [0.32, 0, 0],
      color: PALETTE.laserCyan,
      mode: 0.80
    });
    // Miniature Laser Pulse Beam shooting upward
    lrrrGroup.addPart(makeCylinderGeometry(0.006, 0.018, 0.65, 8), {
      translate: [0, 0.38, 0.06],
      rotate: [0.22, 0, 0],
      color: PALETTE.laserCyan,
      outline: 0.0,
      mode: -0.65
    });
    mb.addGroup(lrrrGroup, {
      translate: [-0.46, 0.02, 0.24],
      rotate: [0, 0.4, 0]
    });

    // Iconic Flagpole beside Lander
    mb.addPart(makeCylinderGeometry(0.007, 0.007, 0.34, 8), {
      translate: [0.46, 0.17, 0.22],
      color: PALETTE.whiteHull
    });
    mb.addPart(makeBoxGeometry(0.12, 0.075, 0.008), {
      translate: [0.52, 0.30, 0.22],
      color: PALETTE.crimsonFlag,
      mode: 0.20
    });
    mb.addPart(makeBoxGeometry(0.055, 0.04, 0.01), {
      translate: [0.49, 0.317, 0.22],
      color: PALETTE.cobaltBlue
    });

    addComicBeaconAura(mb);

  } else if (key === 'surveyor3') {
    // 2. SURVEYOR 3: Detailed Robotic Tripod Lander + Space-Frame Trusses + Thermal Compartments + Mast + Digging Scoop
    // Triangular tubular space-frame base & 3 Vernier engine nozzles
    mb.addPart(makeCylinderGeometry(0.16, 0.19, 0.05, 3), {
      translate: [0, 0.14, 0],
      color: PALETTE.slateMetal
    });
    for (let i = 0; i < 3; i++) {
      const va = (i * Math.PI * 2) / 3 + Math.PI / 3;
      mb.addPart(makeConeGeometry(0.032, 0.055, 10), {
        translate: [Math.cos(va) * 0.11, 0.10, Math.sin(va) * 0.11],
        rotate: [Math.PI, 0, 0],
        color: PALETTE.darkSteel
      });
    }
    // Dual Gold & White Thermal Electronics Compartments
    mb.addPart(makeBoxGeometry(0.14, 0.12, 0.11), {
      translate: [-0.07, 0.21, -0.05],
      rotate: [0, 0.4, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    mb.addPart(makeBoxGeometry(0.12, 0.10, 0.10), {
      translate: [0.08, 0.20, -0.06],
      rotate: [0, -0.5, 0],
      color: PALETTE.whiteHull
    });
    // Central Telemetry Mast & Cross-Arm
    mb.addPart(makeCylinderGeometry(0.018, 0.024, 0.56, 10), {
      translate: [0, 0.36, 0],
      color: PALETTE.whiteHull
    });
    mb.addPart(makeCylinderGeometry(0.008, 0.008, 0.22, 8), {
      translate: [0, 0.56, 0],
      rotate: [0, 0, Math.PI / 2],
      color: PALETTE.slateMetal
    });
    // Angled Blue Solar Panel & High-Gain Planar Antenna on Top
    mb.addPart(makeBoxGeometry(0.40, 0.022, 0.21), {
      translate: [0.02, 0.65, 0],
      rotate: [0.22, 0.2, 0.32],
      color: PALETTE.skySolar,
      mode: 0.35
    });
    mb.addPart(makeBoxGeometry(0.24, 0.17, 0.022), {
      translate: [-0.14, 0.48, 0.05],
      rotate: [0, 0.4, -0.25],
      color: PALETTE.whiteHull
    });
    mb.addPart(makeBoxGeometry(0.19, 0.13, 0.028), {
      translate: [-0.14, 0.48, 0.055],
      rotate: [0, 0.4, -0.25],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    // Omnidirectional Whip Antennas
    mb.addPart(makeCylinderGeometry(0.005, 0.007, 0.26, 6), {
      translate: [0.14, 0.52, -0.08],
      rotate: [0.2, 0, -0.2],
      color: PALETTE.slateMetal
    });
    // TV Camera Turret with Mirror Hood & Cyan Lens
    mb.addPart(makeCylinderGeometry(0.045, 0.045, 0.13, 12), {
      translate: [0.09, 0.37, 0.08],
      color: PALETTE.whiteHull
    });
    mb.addPart(makeBoxGeometry(0.06, 0.05, 0.06), {
      translate: [0.09, 0.44, 0.08],
      rotate: [0.35, 0.2, 0],
      color: PALETTE.slateMetal
    });
    mb.addPart(makeSphereGeometry(0.036, 12, 12), {
      translate: [0.11, 0.40, 0.11],
      color: PALETTE.laserCyan,
      mode: 0.80
    });

    // 3 Tripod Legs with Struts, Shock Absorbers & Crushable Gold Footpads
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 + 0.3;
      const leg = new MeshBuilder();
      leg.addPart(makeCylinderGeometry(0.014, 0.014, 0.36, 8), {
        translate: [0.19, 0.13, 0],
        rotate: [0, 0, -0.62],
        color: PALETTE.whiteHull
      });
      leg.addPart(makeCylinderGeometry(0.009, 0.009, 0.22, 8), {
        translate: [0.16, 0.17, 0],
        rotate: [0, 0, -1.15],
        color: PALETTE.slateMetal
      });
      leg.addPart(makeCylinderGeometry(0.062, 0.072, 0.025, 12), {
        translate: [0.32, 0.012, 0],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      mb.addGroup(leg, { rotate: [0, angle, 0] });
    }

    // Extended Articulated Pantograph Soil-Sampler Scoop Arm digging into lunar dust!
    const armGroup = new MeshBuilder();
    armGroup.addPart(makeBoxGeometry(0.24, 0.022, 0.035), {
      translate: [0.12, -0.04, 0.06],
      rotate: [0, -0.45, -0.35],
      color: PALETTE.slateMetal
    });
    armGroup.addPart(makeBoxGeometry(0.22, 0.018, 0.03), {
      translate: [0.28, -0.14, 0.14],
      rotate: [0, -0.45, -0.55],
      color: PALETTE.whiteHull
    });
    armGroup.addPart(makeBoxGeometry(0.065, 0.042, 0.048), {
      translate: [0.38, -0.19, 0.19],
      rotate: [0, -0.45, 0.2],
      color: PALETTE.deepOrange,
      mode: 0.20
    });
    mb.addGroup(armGroup, { translate: [0.11, 0.21, 0.08] });

    addComicBeaconAura(mb);

  } else if (key === 'apollo15') {
    // 3. APOLLO 15: Detailed Lunar Roving Vehicle (LRV-1) + ALSEP RTG + Dish + TV Camera + Hammer & Feather!
    const rover = new MeshBuilder();

    // Aluminum Space-Frame Chassis, Side Rails & Gold Foil Forward Avionics
    rover.addPart(makeBoxGeometry(0.58, 0.045, 0.30), {
      translate: [0, 0.13, 0],
      color: PALETTE.slateMetal
    });
    rover.addPart(makeBoxGeometry(0.17, 0.095, 0.28), {
      translate: [0.21, 0.175, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    // Aft Science & Tool Rack
    rover.addPart(makeBoxGeometry(0.12, 0.075, 0.26), {
      translate: [-0.23, 0.18, 0],
      color: PALETTE.slateMetal
    });
    rover.addPart(makeBoxGeometry(0.09, 0.06, 0.11), {
      translate: [-0.24, 0.23, 0.06],
      color: PALETTE.whiteHull
    });
    // Two Astronaut Mesh Seats with Orange Backrests & Roll Bars
    for (const sz of [0.08, -0.08]) {
      rover.addPart(makeBoxGeometry(0.14, 0.03, 0.11), {
        translate: [-0.02, 0.17, sz],
        color: PALETTE.whiteHull
      });
      rover.addPart(makeBoxGeometry(0.03, 0.14, 0.11), {
        translate: [-0.08, 0.235, sz],
        rotate: [0, 0, 0.2],
        color: PALETTE.deepOrange,
        mode: 0.20
      });
    }
    // Center Control Console & T-Bar Steering Controller
    rover.addPart(makeBoxGeometry(0.08, 0.055, 0.07), {
      translate: [0.11, 0.23, 0],
      rotate: [0, 0, -0.35],
      color: PALETTE.darkSteel
    });
    rover.addPart(makeCylinderGeometry(0.008, 0.008, 0.15, 8), {
      translate: [0.09, 0.21, 0],
      rotate: [0, 0, -0.3],
      color: PALETTE.whiteHull
    });

    // Umbrella High-Gain Dish Antenna + Feed Horn & Color TV Camera
    rover.addPart(makeCylinderGeometry(0.008, 0.008, 0.23, 8), {
      translate: [0.23, 0.31, -0.09],
      color: PALETTE.whiteHull
    });
    rover.addPart(makeConeGeometry(0.14, 0.075, 18, true), {
      translate: [0.23, 0.43, -0.09],
      rotate: [0, 0, -0.45],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    rover.addPart(makeBoxGeometry(0.075, 0.055, 0.055), {
      translate: [0.23, 0.28, 0.09],
      color: PALETTE.whiteHull
    });
    rover.addPart(makeCylinderGeometry(0.018, 0.018, 0.045, 10), {
      translate: [0.27, 0.28, 0.09],
      rotate: [0, 0, Math.PI / 2],
      color: PALETTE.laserCyan,
      mode: 0.80
    });

    // 4 Wire-Mesh Wheels with Suspension Wishbones, Gold Hubs & Orange Fenders
    [
      [0.20, 0.195],
      [0.20, -0.195],
      [-0.20, 0.195],
      [-0.20, -0.195]
    ].forEach(([wx, wz]) => {
      rover.addPart(makeBoxGeometry(0.025, 0.02, 0.08), {
        translate: [wx, 0.11, wz * 0.78],
        color: PALETTE.slateMetal
      });
      rover.addPart(makeCylinderGeometry(0.088, 0.088, 0.058, 16), {
        translate: [wx, 0.088, wz],
        rotate: [Math.PI / 2, 0, 0],
        color: PALETTE.darkSteel
      });
      rover.addPart(makeCylinderGeometry(0.046, 0.046, 0.064, 12), {
        translate: [wx, 0.088, wz],
        rotate: [Math.PI / 2, 0, 0],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      rover.addPart(makeBoxGeometry(0.16, 0.02, 0.072), {
        translate: [wx, 0.182, wz],
        color: PALETTE.deepOrange,
        mode: 0.20
      });
    });

    mb.addGroup(rover, {
      translate: [-0.08, 0.02, 0.04],
      rotate: [0, -0.35, 0]
    });

    // Nearby ALSEP Science Station & SNAP-27 RTG Generator
    mb.addPart(makeBoxGeometry(0.11, 0.075, 0.11), {
      translate: [-0.42, 0.045, -0.22],
      color: PALETTE.whiteHull
    });
    mb.addPart(makeCylinderGeometry(0.032, 0.032, 0.11, 10), {
      translate: [-0.46, 0.06, -0.06],
      color: PALETTE.darkSteel
    });
    mb.addPart(makeCylinderGeometry(0.008, 0.008, 0.24, 8), {
      translate: [-0.42, 0.18, -0.22],
      color: PALETTE.goldFoil,
      mode: 0.25
    });

    // Galileo Experiment Props: Geological Hammer & Falcon Feather resting in the dust!
    mb.addPart(makeCylinderGeometry(0.008, 0.008, 0.14, 8), {
      translate: [0.38, 0.015, 0.22],
      rotate: [0, 0.5, Math.PI / 2],
      color: PALETTE.slateMetal
    });
    mb.addPart(makeBoxGeometry(0.045, 0.025, 0.025), {
      translate: [0.43, 0.02, 0.19],
      rotate: [0, 0.5, 0],
      color: PALETTE.darkSteel
    });
    mb.addPart(makeBoxGeometry(0.11, 0.006, 0.032), {
      translate: [0.36, 0.012, 0.31],
      rotate: [0, -0.3, 0.05],
      color: PALETTE.whiteHull
    });

    addComicBeaconAura(mb);

  } else if (key === 'apollo16') {
    // 4. APOLLO 16: Detailed "Orion" Descent Stage (Ladder, Engine Bell, RCS, MESA) + Gold S-201 Far-UV Telescope
    mb.addPart(makeCylinderGeometry(0.22, 0.24, 0.19, 8), {
      translate: [-0.14, 0.19, -0.06],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    mb.addPart(makeBoxGeometry(0.30, 0.17, 0.30), {
      translate: [-0.14, 0.19, -0.06],
      rotate: [0, Math.PI / 4, 0],
      color: PALETTE.deepOrange,
      mode: 0.20
    });
    // Descent Engine Bell & Upper Hatch Ring
    mb.addPart(makeConeGeometry(0.085, 0.12, 14), {
      translate: [-0.14, 0.08, -0.06],
      color: PALETTE.darkSteel
    });
    mb.addPart(makeCylinderGeometry(0.15, 0.17, 0.04, 8), {
      translate: [-0.14, 0.295, -0.06],
      color: PALETTE.slateMetal
    });
    // 4 Landing Legs + Ladder on Front Leg
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const leg = new MeshBuilder();
      leg.addPart(makeCylinderGeometry(0.012, 0.012, 0.30, 8), {
        translate: [0.23, 0.13, 0],
        rotate: [0, 0, -0.58],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      leg.addPart(makeCylinderGeometry(0.008, 0.008, 0.18, 6), {
        translate: [0.16, 0.19, 0],
        rotate: [0, 0, -1.15],
        color: PALETTE.slateMetal
      });
      if (i === 0) {
        leg.addPart(makeBoxGeometry(0.015, 0.22, 0.055), {
          translate: [0.23, 0.14, 0],
          rotate: [0, 0, -0.58],
          color: PALETTE.whiteHull
        });
      }
      leg.addPart(makeCylinderGeometry(0.055, 0.065, 0.02, 12), {
        translate: [0.31, 0.01, 0],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      mb.addGroup(leg, { translate: [-0.14, 0, -0.06], rotate: [0, angle, 0] });
    }

    // Gold-Plated S-201 Far-UV Schmidt Camera Telescope on Braced Tripod
    const uvScope = new MeshBuilder();
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const leg = new MeshBuilder();
      leg.addPart(makeCylinderGeometry(0.01, 0.01, 0.22, 8), {
        translate: [0.06, 0.09, 0],
        rotate: [0, 0, -0.45],
        color: PALETTE.whiteHull
      });
      uvScope.addGroup(leg, { rotate: [0, a, 0] });
    }
    uvScope.addPart(makeBoxGeometry(0.07, 0.05, 0.07), {
      translate: [0, 0.16, 0],
      color: PALETTE.slateMetal
    });
    uvScope.addPart(makeCylinderGeometry(0.056, 0.064, 0.19, 14), {
      translate: [0, 0.22, 0],
      rotate: [-0.45, 0.3, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    uvScope.addPart(makeCylinderGeometry(0.044, 0.044, 0.045, 12), {
      translate: [0.025, 0.295, 0.055],
      rotate: [-0.45, 0.3, 0],
      color: PALETTE.laserCyan,
      mode: 0.80
    });
    mb.addGroup(uvScope, { translate: [0.30, 0.01, 0.20] });

    // Descartes Highlands White Anorthosite Boulder ("Big Muley")
    mb.addPart(makeSphereGeometry(0.08, 10, 10), {
      translate: [-0.38, 0.05, 0.26],
      scale: [1.2, 0.8, 1.0],
      color: PALETTE.whiteHull
    });

    addComicBeaconAura(mb);

  } else if (key === 'apollo17') {
    // 5. APOLLO 17: Detailed "Challenger" Lander + Full LRV-3 + Orange Volcanic Glass Crater + ALSEP
    mb.addPart(makeCylinderGeometry(0.22, 0.24, 0.19, 8), {
      translate: [-0.16, 0.19, -0.06],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    mb.addPart(makeBoxGeometry(0.30, 0.17, 0.30), {
      translate: [-0.16, 0.19, -0.06],
      rotate: [0, Math.PI / 4, 0],
      color: PALETTE.deepOrange,
      mode: 0.20
    });
    mb.addPart(makeConeGeometry(0.085, 0.12, 14), {
      translate: [-0.16, 0.08, -0.06],
      color: PALETTE.darkSteel
    });
    mb.addPart(makeCylinderGeometry(0.15, 0.17, 0.04, 8), {
      translate: [-0.16, 0.295, -0.06],
      color: PALETTE.slateMetal
    });
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const leg = new MeshBuilder();
      leg.addPart(makeCylinderGeometry(0.012, 0.012, 0.30, 8), {
        translate: [0.23, 0.13, 0],
        rotate: [0, 0, -0.58],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      if (i === 0) {
        leg.addPart(makeBoxGeometry(0.015, 0.22, 0.055), {
          translate: [0.23, 0.14, 0],
          rotate: [0, 0, -0.58],
          color: PALETTE.whiteHull
        });
      }
      leg.addPart(makeCylinderGeometry(0.055, 0.065, 0.02, 12), {
        translate: [0.31, 0.01, 0],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      mb.addGroup(leg, { translate: [-0.16, 0, -0.06], rotate: [0, angle, 0] });
    }

    // Detailed LRV-3 Parked in Foreground Right (Seats, Console, Dish, TV Cam, 4 Fenders)
    const lrv3 = new MeshBuilder();
    lrv3.addPart(makeBoxGeometry(0.38, 0.035, 0.22), {
      translate: [0, 0.095, 0],
      color: PALETTE.slateMetal
    });
    lrv3.addPart(makeBoxGeometry(0.11, 0.065, 0.20), {
      translate: [0.14, 0.125, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    for (const sz of [0.055, -0.055]) {
      lrv3.addPart(makeBoxGeometry(0.09, 0.022, 0.08), {
        translate: [-0.02, 0.12, sz],
        color: PALETTE.whiteHull
      });
      lrv3.addPart(makeBoxGeometry(0.022, 0.09, 0.08), {
        translate: [-0.06, 0.165, sz],
        rotate: [0, 0, 0.2],
        color: PALETTE.deepOrange,
        mode: 0.20
      });
    }
    lrv3.addPart(makeCylinderGeometry(0.007, 0.007, 0.16, 8), {
      translate: [0.14, 0.21, -0.05],
      color: PALETTE.whiteHull
    });
    lrv3.addPart(makeConeGeometry(0.095, 0.052, 16, true), {
      translate: [0.14, 0.29, -0.05],
      rotate: [0, 0, -0.4],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    lrv3.addPart(makeBoxGeometry(0.05, 0.04, 0.04), {
      translate: [0.14, 0.19, 0.06],
      color: PALETTE.laserCyan,
      mode: 0.80
    });
    [
      [0.13, 0.135],
      [0.13, -0.135],
      [-0.13, 0.135],
      [-0.13, -0.135]
    ].forEach(([wx, wz]) => {
      lrv3.addPart(makeCylinderGeometry(0.06, 0.06, 0.042, 14), {
        translate: [wx, 0.06, wz],
        rotate: [Math.PI / 2, 0, 0],
        color: PALETTE.darkSteel
      });
      lrv3.addPart(makeCylinderGeometry(0.032, 0.032, 0.046, 10), {
        translate: [wx, 0.06, wz],
        rotate: [Math.PI / 2, 0, 0],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      lrv3.addPart(makeBoxGeometry(0.11, 0.015, 0.05), {
        translate: [wx, 0.125, wz],
        color: PALETTE.deepOrange,
        mode: 0.20
      });
    });
    mb.addGroup(lrv3, {
      translate: [0.32, 0.01, 0.18],
      rotate: [0, 0.55, 0]
    });

    // Shorty Crater Glowing Orange Volcanic Glass Patch + ALSEP Central Station & RTG
    mb.addPart(makeCylinderGeometry(0.18, 0.22, 0.025, 18), {
      translate: [0.06, 0.012, 0.34],
      color: PALETTE.deepOrange,
      mode: 0.35
    });
    mb.addPart(makeBoxGeometry(0.11, 0.09, 0.11), {
      translate: [-0.46, 0.05, 0.24],
      color: PALETTE.whiteHull
    });
    mb.addPart(makeCylinderGeometry(0.028, 0.028, 0.09, 10), {
      translate: [-0.46, 0.05, 0.36],
      color: PALETTE.darkSteel
    });
    mb.addPart(makeCylinderGeometry(0.01, 0.01, 0.26, 8), {
      translate: [-0.46, 0.18, 0.24],
      color: PALETTE.goldFoil,
      mode: 0.25
    });

    addComicBeaconAura(mb);

  } else if (key === 'lcross_blueghost' || key === 'lcross') {
    // 6. LCROSS & CENTAUR: Detailed Polar Crater Impact Monument + Centaur Upper Stage + Shepherding Satellite + Ice Plume!
    mb.addPart(makeTorusGeometry(0.35, 0.065, 12, 24), {
      translate: [0, 0.03, 0],
      rotate: [Math.PI / 2, 0, 0],
      color: PALETTE.slateMetal
    });

    // Centaur Upper-Stage Rocket Cylinder with Engine Bell, Propellant Ribs & Avionics Ring
    const centaurGroup = new MeshBuilder();
    centaurGroup.addPart(makeCylinderGeometry(0.11, 0.11, 0.44, 16), {
      color: PALETTE.whiteHull
    });
    centaurGroup.addPart(makeCylinderGeometry(0.116, 0.116, 0.04, 16), {
      translate: [0, -0.12, 0],
      color: PALETTE.slateMetal
    });
    centaurGroup.addPart(makeCylinderGeometry(0.115, 0.115, 0.09, 16), {
      translate: [0, 0.08, 0],
      color: PALETTE.deepOrange,
      mode: 0.20
    });
    centaurGroup.addPart(makeConeGeometry(0.075, 0.11, 14), {
      translate: [0, 0.26, 0],
      color: PALETTE.darkSteel
    });
    mb.addGroup(centaurGroup, {
      translate: [-0.06, 0.22, 0.02],
      rotate: [0.15, 0.20, -0.42]
    });

    // LCROSS Shepherding Spacecraft Octagonal Bus + Dual Solar Wings + S-Band Dish + IR Spectrometer Optics
    const lcrossSat = new MeshBuilder();
    lcrossSat.addPart(makeCylinderGeometry(0.12, 0.12, 0.095, 8), {
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    lcrossSat.addPart(makeBoxGeometry(0.48, 0.016, 0.115), {
      color: PALETTE.skySolar,
      mode: 0.35
    });
    lcrossSat.addPart(makeConeGeometry(0.065, 0.04, 14, true), {
      translate: [0, 0.08, 0],
      color: PALETTE.whiteHull
    });
    lcrossSat.addPart(makeSphereGeometry(0.042, 12, 12), {
      translate: [0, -0.065, 0],
      color: PALETTE.laserCyan,
      mode: 0.80
    });
    mb.addGroup(lcrossSat, {
      translate: [0.24, 0.56, 0.08],
      rotate: [0.25, -0.30, 0.35]
    });

    // Comic Water-Ice Plume Crystals shooting upward from the dark crater
    [
      [0.05, 0.24, 0.08, 0.045],
      [-0.12, 0.34, 0.12, 0.038],
      [0.14, 0.36, -0.06, 0.042],
      [0.02, 0.45, 0.04, 0.032],
      [-0.06, 0.19, -0.11, 0.04]
    ].forEach(([ix, iy, iz, ir]) => {
      mb.addPart(makeOctahedronGeometry(ir), {
        translate: [ix, iy, iz],
        rotate: [ix * 5, iy * 4, 0],
        color: PALETTE.laserCyan,
        outline: 0.02,
        mode: 0.80
      });
    });

    addComicBeaconAura(mb);

  // ==========================================================================
  // MARS MISSIONS (5) — Comic-styled 3D Mars Hardware
  // ==========================================================================
  } else if (key === 'viking1') {
    // VIKING 1: Hexagonal White Hull + Twin Orange RTGCovers + High-Gain Dish + Trenching Scoop Arm
    mb.addPart(makeCylinderGeometry(0.26, 0.28, 0.16, 6), {
      translate: [0, 0.18, 0],
      color: PALETTE.whiteHull
    });
    for (const rx of [-0.10, 0.10]) {
      mb.addPart(makeCylinderGeometry(0.06, 0.07, 0.12, 8), {
        translate: [rx, 0.30, -0.04],
        color: PALETTE.deepOrange,
        mode: 0.20
      });
    }
    for (const cx of [-0.07, 0.07]) {
      mb.addPart(makeCylinderGeometry(0.03, 0.03, 0.12, 10), {
        translate: [cx, 0.31, 0.11],
        color: PALETTE.slateMetal
      });
      mb.addPart(makeSphereGeometry(0.024, 10, 10), {
        translate: [cx, 0.37, 0.13],
        color: PALETTE.laserCyan,
        mode: 0.80
      });
    }
    // Parabolic S-band dish antenna on mast
    mb.addPart(makeCylinderGeometry(0.012, 0.012, 0.26, 8), {
      translate: [-0.13, 0.38, -0.09],
      color: PALETTE.whiteHull
    });
    mb.addPart(makeConeGeometry(0.14, 0.06, 14, true), {
      translate: [-0.13, 0.51, -0.09],
      rotate: [0, 0, -0.35],
      color: PALETTE.whiteHull
    });
    // 3 Tripod Legs with Gold Footpads
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3 + Math.PI / 6;
      const leg = new MeshBuilder();
      leg.addPart(makeCylinderGeometry(0.015, 0.015, 0.30, 8), {
        translate: [0.27, 0.11, 0],
        rotate: [0, 0, -0.62],
        color: PALETTE.slateMetal
      });
      leg.addPart(makeCylinderGeometry(0.065, 0.075, 0.022, 12), {
        translate: [0.38, 0.012, 0],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      mb.addGroup(leg, { rotate: [0, a, 0] });
    }
    // Surface Sampler Collector Arm digging Martian trench
    mb.addPart(makeBoxGeometry(0.32, 0.024, 0.03), {
      translate: [0.24, 0.11, 0.20],
      rotate: [0, -0.45, -0.40],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    mb.addPart(makeBoxGeometry(0.08, 0.045, 0.05), {
      translate: [0.38, 0.03, 0.30],
      rotate: [0, -0.45, 0.2],
      color: PALETTE.deepOrange,
      mode: 0.20
    });

    addComicBeaconAura(mb);

  } else if (key === 'sojourner') {
    // SOJOURNER & PATHFINDER: 3 Detailed Unfolded Solar Petals + IMP Mast + 6-Wheeled Rocker-Bogie Rover + APXS + Barnacle Bill
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3 + 0.3;
      const petal = new MeshBuilder();
      petal.addPart(makeCylinderGeometry(0.21, 0.23, 0.022, 3), {
        translate: [0.24, 0.016, 0],
        color: PALETTE.skySolar,
        mode: 0.35
      });
      petal.addPart(makeBoxGeometry(0.18, 0.026, 0.02), {
        translate: [0.22, 0.018, 0],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      mb.addGroup(petal, { translate: [-0.14, 0, -0.08], rotate: [0, a, 0] });
    }
    // Central Lander Deck, Gold Electronics Box & IMP Stereo Mast
    mb.addPart(makeCylinderGeometry(0.11, 0.12, 0.035, 3), {
      translate: [-0.14, 0.03, -0.08],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    mb.addPart(makeCylinderGeometry(0.02, 0.024, 0.36, 10), {
      translate: [-0.14, 0.19, -0.08],
      color: PALETTE.whiteHull
    });
    mb.addPart(makeBoxGeometry(0.095, 0.055, 0.06), {
      translate: [-0.14, 0.38, -0.08],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    mb.addPart(makeSphereGeometry(0.018, 8, 8), {
      translate: [-0.11, 0.38, -0.05],
      color: PALETTE.laserCyan,
      mode: 0.80
    });

    // Detailed 6-Wheeled Sojourner Micro-Rover with Rocker-Bogie Suspension, APXS & Whip Antenna
    const soj = new MeshBuilder();
    soj.addPart(makeBoxGeometry(0.27, 0.072, 0.19), {
      translate: [0, 0.09, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    soj.addPart(makeBoxGeometry(0.29, 0.018, 0.21), {
      translate: [0, 0.135, 0],
      color: PALETTE.skySolar,
      mode: 0.35
    });
    // Rocker-Bogie Struts & 6 Wheels with Gold Hubs
    for (const wz of [-0.11, 0.11]) {
      soj.addPart(makeBoxGeometry(0.22, 0.014, 0.014), {
        translate: [0, 0.065, wz * 0.88],
        color: PALETTE.slateMetal
      });
    }
    for (const wx of [-0.105, 0, 0.105]) {
      for (const wz of [-0.115, 0.115]) {
        soj.addPart(makeCylinderGeometry(0.042, 0.042, 0.032, 12), {
          translate: [wx, 0.042, wz],
          rotate: [Math.PI / 2, 0, 0],
          color: PALETTE.darkSteel
        });
        soj.addPart(makeCylinderGeometry(0.022, 0.022, 0.036, 10), {
          translate: [wx, 0.042, wz],
          rotate: [Math.PI / 2, 0, 0],
          color: PALETTE.goldFoil,
          mode: 0.25
        });
      }
    }
    // Rear APXS Spectrometer Arm & Whip Antenna
    soj.addPart(makeCylinderGeometry(0.022, 0.022, 0.075, 10), {
      translate: [0.165, 0.07, 0],
      rotate: [0, 0, Math.PI / 2],
      color: PALETTE.laserCyan,
      mode: 0.80
    });
    soj.addPart(makeCylinderGeometry(0.005, 0.006, 0.18, 6), {
      translate: [-0.10, 0.22, -0.06],
      color: PALETTE.whiteHull
    });
    mb.addGroup(soj, { translate: [0.16, 0.01, 0.16], rotate: [0, -0.25, 0] });

    // "Barnacle Bill" Martian Rock
    mb.addPart(makeSphereGeometry(0.088, 10, 10), {
      translate: [0.38, 0.06, 0.10],
      scale: [1.1, 0.85, 1.1],
      color: PALETTE.deepOrange,
      mode: 0.20
    });

    addComicBeaconAura(mb);

  } else if (key === 'opportunity') {
    // OPPORTUNITY (MER-B): Gull-Wing Solar Arrays + Gold Body + Pancam Mast + 6 Wheels + Blueberries
    mb.addPart(makeBoxGeometry(0.32, 0.13, 0.24), {
      translate: [0, 0.18, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    mb.addPart(makeBoxGeometry(0.40, 0.022, 0.32), {
      translate: [0, 0.26, 0],
      color: PALETTE.skySolar,
      mode: 0.35
    });
    mb.addPart(makeCylinderGeometry(0.25, 0.25, 0.02, 3), {
      translate: [0, 0.258, 0.25],
      color: PALETTE.skySolar,
      mode: 0.35
    });
    mb.addPart(makeCylinderGeometry(0.25, 0.25, 0.02, 3), {
      translate: [0, 0.258, -0.25],
      rotate: [0, Math.PI, 0],
      color: PALETTE.skySolar,
      mode: 0.35
    });

    // Pancam Mast & Twin Cyan Eyes
    mb.addPart(makeCylinderGeometry(0.02, 0.024, 0.34, 10), {
      translate: [0.14, 0.42, -0.04],
      color: PALETTE.whiteHull
    });
    mb.addPart(makeBoxGeometry(0.085, 0.06, 0.14), {
      translate: [0.15, 0.60, -0.04],
      color: PALETTE.whiteHull
    });
    for (const cz of [-0.08, 0.0]) {
      mb.addPart(makeCylinderGeometry(0.018, 0.018, 0.03, 10), {
        translate: [0.195, 0.60, cz],
        rotate: [0, 0, Math.PI / 2],
        color: PALETTE.laserCyan,
        mode: 0.80
      });
    }

    // 6 Rocker-Bogie Wheels
    for (const wx of [-0.22, 0, 0.22]) {
      for (const wz of [-0.19, 0.19]) {
        mb.addPart(makeCylinderGeometry(0.068, 0.068, 0.05, 14), {
          translate: [wx, 0.068, wz],
          rotate: [Math.PI / 2, 0, 0],
          color: PALETTE.darkSteel
        });
        mb.addPart(makeCylinderGeometry(0.032, 0.032, 0.056, 10), {
          translate: [wx, 0.068, wz],
          rotate: [Math.PI / 2, 0, 0],
          color: PALETTE.goldFoil,
          mode: 0.25
        });
      }
    }

    // Robotic Arm + Hematite "Blueberries"
    mb.addPart(makeBoxGeometry(0.20, 0.024, 0.026), {
      translate: [0.26, 0.11, 0.05],
      rotate: [0, -0.2, -0.45],
      color: PALETTE.slateMetal
    });
    for (const [bx, bz] of [[0.40, 0.15], [0.34, 0.21], [0.44, 0.05]]) {
      mb.addPart(makeSphereGeometry(0.026, 10, 10), {
        translate: [bx, 0.026, bz],
        color: PALETTE.laserCyan,
        mode: 0.80
      });
    }

    addComicBeaconAura(mb);

  } else if (key === 'insight') {
    // INSIGHT: Round Deck + Twin Circular Solar Fan Wings + Deployed SEIS Dome & HP3 Mole
    mb.addPart(makeCylinderGeometry(0.22, 0.24, 0.13, 12), {
      translate: [0, 0.19, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    mb.addPart(makeCylinderGeometry(0.23, 0.23, 0.028, 12), {
      translate: [0, 0.265, 0],
      color: PALETTE.whiteHull
    });
    for (const side of [-1, 1]) {
      mb.addPart(makeCylinderGeometry(0.21, 0.21, 0.022, 10), {
        translate: [0, 0.26, side * 0.44],
        color: PALETTE.skySolar,
        mode: 0.35
      });
      mb.addPart(makeCylinderGeometry(0.05, 0.05, 0.028, 10), {
        translate: [0, 0.265, side * 0.44],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
    }
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const leg = new MeshBuilder();
      leg.addPart(makeCylinderGeometry(0.015, 0.015, 0.24, 8), {
        translate: [0.20, 0.10, 0],
        rotate: [0, 0, -0.45],
        color: PALETTE.slateMetal
      });
      leg.addPart(makeCylinderGeometry(0.055, 0.065, 0.022, 10), {
        translate: [0.26, 0.012, 0],
        color: PALETTE.darkSteel
      });
      mb.addGroup(leg, { rotate: [0, a, 0] });
    }
    // SEIS Seismometer Dome & HP3 Mole in Foreground
    mb.addPart(makeCylinderGeometry(0.10, 0.13, 0.08, 12), {
      translate: [0.36, 0.04, 0.12],
      color: PALETTE.deepOrange,
      mode: 0.25
    });
    mb.addPart(makeCylinderGeometry(0.02, 0.025, 0.18, 8), {
      translate: [0.22, 0.09, -0.18],
      color: PALETTE.darkSteel
    });

    addComicBeaconAura(mb);

  } else if (key === 'ingenuity') {
    // INGENUITY (GINNY): Gold Fuselage + Coaxial Carbon-Fiber Rotors + Top Solar Panel + 4 Spindly Legs
    mb.addPart(makeBoxGeometry(0.20, 0.16, 0.20), {
      translate: [0, 0.22, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    mb.addPart(makeBoxGeometry(0.21, 0.045, 0.21), {
      translate: [0, 0.22, 0],
      color: PALETTE.deepOrange,
      mode: 0.20
    });
    mb.addPart(makeSphereGeometry(0.032, 10, 10), {
      translate: [0.105, 0.20, 0],
      color: PALETTE.laserCyan,
      mode: 0.80
    });
    // Central Mast & Counter-Rotating Rotor Blades
    mb.addPart(makeCylinderGeometry(0.022, 0.028, 0.34, 12), {
      translate: [0, 0.42, 0],
      color: PALETTE.darkSteel
    });
    mb.addPart(makeBoxGeometry(0.84, 0.016, 0.085), {
      translate: [0, 0.42, 0],
      rotate: [0.10, 0.38, 0],
      color: PALETTE.darkSteel
    });
    mb.addPart(makeBoxGeometry(0.84, 0.016, 0.085), {
      translate: [0, 0.51, 0],
      rotate: [-0.10, -0.52, 0],
      color: PALETTE.whiteHull
    });
    mb.addPart(makeBoxGeometry(0.32, 0.022, 0.14), {
      translate: [0, 0.60, 0],
      color: PALETTE.skySolar,
      mode: 0.35
    });
    // 4 Spindly Landing Legs
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const leg = new MeshBuilder();
      leg.addPart(makeCylinderGeometry(0.012, 0.01, 0.34, 8), {
        translate: [0.22, 0.12, 0],
        rotate: [0, 0, -0.72],
        color: PALETTE.slateMetal
      });
      leg.addPart(makeCylinderGeometry(0.045, 0.05, 0.018, 10), {
        translate: [0.34, 0.012, 0],
        color: PALETTE.deepOrange,
        mode: 0.20
      });
      mb.addGroup(leg, { rotate: [0, a, 0] });
    }

    addComicBeaconAura(mb);

  // ==========================================================================
  // UNIVERSE / DEEP SPACE MISSIONS (5) — Free-Flying Comic Deep Space Probes!
  // (No support pylon or surface ring — they fly freely across the starfield!)
  // ==========================================================================
  } else if (key === 'pioneer10') {
    const probe = new MeshBuilder();
    // Large White Parabolic High-Gain Dish + 3-Strut Feed Horn
    probe.addPart(makeConeGeometry(0.36, 0.11, 20, true), {
      translate: [0, 0.06, 0],
      rotate: [Math.PI, 0, 0],
      color: PALETTE.whiteHull
    });
    probe.addPart(makeCylinderGeometry(0.038, 0.045, 0.16, 10), {
      translate: [0, 0.18, 0],
      color: PALETTE.slateMetal
    });
    probe.addPart(makeSphereGeometry(0.036, 10, 10), {
      translate: [0, 0.26, 0],
      color: PALETTE.laserCyan,
      mode: 0.80
    });
    // Hexagonal Gold-Foil Bus behind Dish
    probe.addPart(makeCylinderGeometry(0.18, 0.18, 0.12, 6), {
      translate: [0, -0.05, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    // Famous Gold-Anodized Pioneer Plaque mounted on side strut!
    probe.addPart(makeBoxGeometry(0.11, 0.08, 0.018), {
      translate: [0.16, -0.03, 0.10],
      rotate: [0, -0.5, 0],
      color: PALETTE.goldFoil,
      mode: 0.55
    });
    // Twin SNAP-19 RTG Nuclear Booms + Long Magnetometer Boom
    for (const angle of [0.6, 2.5]) {
      const rtg = new MeshBuilder();
      rtg.addPart(makeCylinderGeometry(0.012, 0.012, 0.38, 8), {
        translate: [0.26, -0.05, 0],
        rotate: [0, 0, Math.PI / 2],
        color: PALETTE.slateMetal
      });
      rtg.addPart(makeCylinderGeometry(0.042, 0.042, 0.12, 10), {
        translate: [0.45, -0.05, 0],
        rotate: [0, 0, Math.PI / 2],
        color: PALETTE.deepOrange,
        mode: 0.25
      });
      probe.addGroup(rtg, { rotate: [0, angle, 0] });
    }
    probe.addPart(makeCylinderGeometry(0.01, 0.01, 0.52, 8), {
      translate: [-0.32, -0.05, -0.14],
      rotate: [0, -0.4, Math.PI / 2],
      color: PALETTE.slateMetal
    });
    // Glowing ion/thruster trail ring behind bus
    probe.addPart(makeTorusGeometry(0.12, 0.014, 8, 18), {
      translate: [0, -0.14, 0],
      rotate: [Math.PI / 2, 0, 0],
      color: PALETTE.laserCyan,
      mode: 0.85
    });
    mb.addGroup(probe, { translate: [0, 0.26, 0], rotate: [0.52, -0.35, 0.18] });

  } else if (key === 'voyager1' || key === 'voyager2') {
    const vgr = new MeshBuilder();
    vgr.addPart(makeCylinderGeometry(0.18, 0.18, 0.12, 10), {
      translate: [0, -0.05, 0],
      color: key === 'voyager1' ? PALETTE.slateMetal : PALETTE.goldFoil,
      mode: 0.25
    });
    // Famous Golden Record on the bus side
    vgr.addPart(makeCylinderGeometry(0.068, 0.068, 0.022, 16), {
      translate: [0.175, -0.05, 0.04],
      rotate: [0, 0, Math.PI / 2],
      color: PALETTE.goldFoil,
      mode: 0.55
    });
    // High-Gain White Parabolic Dish + Feed Horn
    vgr.addPart(makeConeGeometry(0.37, 0.11, 20, true), {
      translate: [0, 0.06, 0],
      rotate: [Math.PI, 0, 0],
      color: PALETTE.whiteHull
    });
    vgr.addPart(makeCylinderGeometry(0.042, 0.042, 0.17, 10), {
      translate: [0, 0.16, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    // RTG Boom + Camera Scan Platform + Magnetometer Boom
    vgr.addPart(makeCylinderGeometry(0.015, 0.015, 0.40, 8), {
      translate: [-0.26, -0.09, 0.10],
      rotate: [0.2, 0.4, 1.35],
      color: PALETTE.slateMetal
    });
    vgr.addPart(makeCylinderGeometry(0.044, 0.044, 0.16, 10), {
      translate: [-0.42, -0.13, 0.18],
      rotate: [0.2, 0.4, 1.35],
      color: PALETTE.deepOrange,
      mode: 0.25
    });
    vgr.addPart(makeCylinderGeometry(0.012, 0.012, 0.30, 8), {
      translate: [0.24, -0.04, -0.08],
      rotate: [0, -0.3, Math.PI / 2],
      color: PALETTE.slateMetal
    });
    vgr.addPart(makeBoxGeometry(0.10, 0.08, 0.09), {
      translate: [0.38, -0.04, -0.13],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    vgr.addPart(makeSphereGeometry(0.032, 10, 10), {
      translate: [0.43, -0.04, -0.13],
      color: PALETTE.laserCyan,
      mode: 0.80
    });
    vgr.addPart(makeCylinderGeometry(0.01, 0.01, 0.56, 8), {
      translate: [-0.10, -0.22, -0.30],
      rotate: [0.95, 0.2, 0.3],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    mb.addGroup(vgr, { translate: [0, 0.28, 0], rotate: [0.48, 0.32, -0.18] });

    if (key === 'voyager2') {
      // Orbiting Ringed Uranus & Neptune Ice-Giant Companion Spheres
      mb.addPart(makeSphereGeometry(0.075, 12, 12), {
        translate: [0.42, 0.08, 0.22],
        color: PALETTE.laserCyan,
        mode: 0.60
      });
      mb.addPart(makeTorusGeometry(0.12, 0.014, 8, 20), {
        translate: [0.42, 0.08, 0.22],
        rotate: [0.35, 0.4, 1.2],
        color: PALETTE.whiteHull
      });
      mb.addPart(makeSphereGeometry(0.062, 12, 12), {
        translate: [-0.42, 0.42, -0.18],
        color: PALETTE.cobaltBlue,
        mode: 0.45
      });
    }

  } else if (key === 'huygens') {
    // HUYGENS: Golden Saucer Probe descending through space with Ringed Saturn Companion!
    const saucer = new MeshBuilder();
    saucer.addPart(makeCylinderGeometry(0.22, 0.38, 0.11, 18), {
      translate: [0, 0.0, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    saucer.addPart(makeCylinderGeometry(0.16, 0.22, 0.08, 16), {
      translate: [0, 0.08, 0],
      color: PALETTE.deepOrange,
      mode: 0.20
    });
    saucer.addPart(makeSphereGeometry(0.14, 12, 12), {
      translate: [0, 0.12, 0],
      scale: [1, 0.55, 1],
      color: PALETTE.whiteHull
    });
    saucer.addPart(makeSphereGeometry(0.036, 10, 10), {
      translate: [0.24, 0.06, 0.12],
      color: PALETTE.laserCyan,
      mode: 0.80
    });
    mb.addGroup(saucer, { translate: [0.06, 0.22, 0.05], rotate: [0.25, -0.3, 0.18] });

    // Ringed Saturn Companion Floating Nearby
    mb.addPart(makeSphereGeometry(0.11, 14, 14), {
      translate: [-0.34, 0.46, -0.16],
      color: PALETTE.goldFoil,
      mode: 0.30
    });
    mb.addPart(makeTorusGeometry(0.21, 0.022, 10, 24), {
      translate: [-0.34, 0.46, -0.16],
      rotate: [1.15, 0.25, -0.35],
      color: PALETTE.whiteHull
    });

  } else if (key === 'newhorizons') {
    // NEW HORIZONS: Triangular Gold "Grand Piano" Body + White Dish + RTG + Snowman Arrokoth Companion
    const nh = new MeshBuilder();
    nh.addPart(makeCylinderGeometry(0.28, 0.28, 0.12, 3), {
      translate: [0, -0.04, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    nh.addPart(makeConeGeometry(0.32, 0.09, 20, true), {
      translate: [0, 0.06, 0],
      rotate: [Math.PI, 0, 0],
      color: PALETTE.whiteHull
    });
    nh.addPart(makeCylinderGeometry(0.048, 0.048, 0.25, 12), {
      translate: [-0.30, -0.04, 0],
      rotate: [0, 0, Math.PI / 2],
      color: PALETTE.darkSteel
    });
    nh.addPart(makeCylinderGeometry(0.044, 0.044, 0.12, 12), {
      translate: [0.17, -0.04, 0.13],
      rotate: [0.4, 0.5, Math.PI / 2],
      color: PALETTE.laserCyan,
      mode: 0.80
    });
    mb.addGroup(nh, { translate: [-0.06, 0.28, 0], rotate: [0.46, 0.35, -0.20] });

    // Dual-lobed Kuiper Belt contact binary Arrokoth floating alongside
    mb.addPart(makeSphereGeometry(0.092, 12, 12), {
      translate: [0.36, 0.14, 0.20],
      scale: [1.2, 0.75, 1.1],
      color: PALETTE.arrokothRed
    });
    mb.addPart(makeSphereGeometry(0.066, 12, 12), {
      translate: [0.47, 0.19, 0.15],
      scale: [1.1, 0.85, 1.0],
      color: PALETTE.deepOrange,
      mode: 0.20
    });

  } else {
    return buildDetailedArtifactMesh('apollo11');
  }

  return {
    positions: new Float32Array(mb.positions),
    normals: new Float32Array(mb.normals),
    colors: new Float32Array(mb.colors),
    metas: new Float32Array(mb.metas),
    pivots: new Float32Array(mb.pivots),
    indices: new Uint16Array(mb.indices)
  };
}

// ============================================================================
// MAIN WEBGL2 COMIC HORIZON & MONUMENT ENGINE
// ============================================================================
export class Horizon3DEngine {
  constructor(canvasOrOptions, options = {}) {
    if (canvasOrOptions && typeof canvasOrOptions.getContext === 'function') {
      this.canvas = canvasOrOptions;
      this.container = canvasOrOptions.parentElement;
      this.onArtifactClick = options.onArtifactClick || options.onInspectArtifact || (() => {});
      this.onStatusChange = options.onStatusChange || (() => {});
      this.onGlbLoaded = options.onGlbLoaded || (() => {});
      this.onGlobeModeChange = options.onGlobeModeChange || (() => {});
    } else {
      const opts = canvasOrOptions || {};
      this.container = opts.container || null;
      this.canvas = opts.canvas || (this.container ? this.container.querySelector('canvas') : null);
      this.onArtifactClick = opts.onInspectArtifact || opts.onArtifactClick || (() => {});
      this.onStatusChange = opts.onStatusChange || (() => {});
      this.onGlbLoaded = opts.onGlbLoaded || (() => {});
      this.onGlobeModeChange = opts.onGlobeModeChange || (() => {});
    }

    this.gl = this.canvas ? this.canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    }) : null;

    this.realm = 'moon';
    this.artifactId = 'apollo11';
    this.artifactType = 'lander';
    this.customGlbMesh = null;

    // Planet rotation & zoom state matching stille_denkm_ler_des_mondes_nasa_space_apps(1).html
    this.targetRotY = 0.25;
    this.currentRotY = 0.25;
    this.targetRotX = 0.0;
    this.currentRotX = 0.0;
    this.targetZoomZ = 7.2;
    this.currentZoomZ = 7.2;

    // Smooth Horizon (0) <-> Centered Full Globe (1) transition state
    this.targetGlobeProgress = 0.0;
    this.currentGlobeProgress = 0.0;
    this.manualGlobeLock = false;

    this.isDragging = false;
    this.dragMoved = false;
    this.lastX = 0;
    this.lastY = 0;

    // Showcase monument scale (1.38 default, pulses to 1.62 on click)
    this.monumentBaseScale = 1.38;
    this.monumentScale = 1.38;
    this.targetMonumentScale = 1.38;

    this.monumentScreenPos = { x: 0, y: 0 };

    this.planetVao = null;
    this.planetIndexCount = 0;
    this.planetIndexType = 0;
    this.realmTextures = {};

    this.monumentMeshes = {};
    this.monumentGeoms = {};
    this.customGlbGeom = null;
    this.rafId = 0;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.gl) {
      this._initGL();
      this._bindEvents();
      this.resize();
      this._startLoop();
    }
  }

  _initGL() {
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.planetProg = createProgram(gl, PLANET_VERT, PLANET_FRAG);
    this.monumentProg = createProgram(gl, MONUMENT_VERT, MONUMENT_FRAG);

    this.planetLocs = {
      uProjection: gl.getUniformLocation(this.planetProg, 'uProjection'),
      uView: gl.getUniformLocation(this.planetProg, 'uView'),
      uModel: gl.getUniformLocation(this.planetProg, 'uModel'),
      uNormalMatrix: gl.getUniformLocation(this.planetProg, 'uNormalMatrix'),
      uBaseColorTex: gl.getUniformLocation(this.planetProg, 'uBaseColorTex'),
      uOutlineScale: gl.getUniformLocation(this.planetProg, 'uOutlineScale'),
      uBeaconPos: gl.getUniformLocation(this.planetProg, 'uBeaconPos')
    };

    this.monumentLocs = {
      uProjection: gl.getUniformLocation(this.monumentProg, 'uProjection'),
      uView: gl.getUniformLocation(this.monumentProg, 'uView'),
      uModel: gl.getUniformLocation(this.monumentProg, 'uModel'),
      uNormalMatrix: gl.getUniformLocation(this.monumentProg, 'uNormalMatrix'),
      uCameraPos: gl.getUniformLocation(this.monumentProg, 'uCameraPos'),
      uPulse: gl.getUniformLocation(this.monumentProg, 'uPulse'),
      uOutlinePass: gl.getUniformLocation(this.monumentProg, 'uOutlinePass')
    };

    // 1. Build the exact 96x96 comic relief sphere (radius = 5.2) from (1).html
    const sphere = buildComicReliefSphere(5.2, 96, 96);
    this._uploadPlanetGeometry(sphere);

    // 2. Build comic hand-drawn crater textures for Moon, Mars, and Universe
    ['moon', 'mars', 'universe'].forEach((r) => {
      const cnv = createComicSurfaceCanvas(r);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cnv);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.realmTextures[r] = tex;
    });

    // 3. Pre-build all 16 mission-specific comic 3D models
    const allIds = [
      'apollo11', 'surveyor3', 'apollo15', 'apollo16', 'apollo17', 'lcross_blueghost',
      'viking1', 'sojourner', 'opportunity', 'insight', 'ingenuity',
      'pioneer10', 'voyager1', 'voyager2', 'huygens', 'newhorizons'
    ];
    allIds.forEach((id) => {
      const geom = buildDetailedArtifactMesh(id);
      this.monumentGeoms[id] = geom;
      this.monumentMeshes[id] = this._uploadMonumentGeometry(geom);
    });
  }

  _uploadPlanetGeometry(geom) {
    const gl = this.gl;
    if (this.planetVao) gl.deleteVertexArray(this.planetVao);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geom.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const normBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geom.normals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    const uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geom.uvs, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geom.indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    this.planetVao = vao;
    this.planetIndexCount = geom.indices.length;
    this.planetIndexType =
      geom.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
  }

  _uploadMonumentGeometry(geom) {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geom.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const normBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geom.normals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    const colBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geom.colors, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

    const metaBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, metaBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geom.metas, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, 0);

    const pivBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pivBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geom.pivots, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 3, gl.FLOAT, false, 0, 0);

    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geom.indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    return {
      vao,
      count: geom.indices.length,
      indexType: geom.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT
    };
  }

  async init() {
    this.onStatusChange('Comic 3D Horizon Active');
    this.renderFrame(performance.now());

    // Load the active artifact's official NASA .glb first, then preload the rest
    this._officialLoading = this._officialLoading || new Set();
    this._officialLoaded = this._officialLoaded || new Set();
    await this._loadOfficialModel(this.artifactId);
    this._preloadOfficialModels();
    return true;
  }

  async _preloadOfficialModels() {
    const priorityOrder = [
      'apollo11', 'voyager1', 'opportunity', 'ingenuity',
      'viking1', 'insight', 'pioneer10', 'huygens', 'newhorizons', 'voyager2'
    ];
    for (const id of priorityOrder) {
      await this._loadOfficialModel(id);
    }
  }

  async _loadOfficialModel(id) {
    const spec = OFFICIAL_NASA_GLBS[id];
    if (!spec || !this.gl) return false;
    this._officialLoading = this._officialLoading || new Set();
    this._officialLoaded = this._officialLoaded || new Set();
    if (this._officialLoaded.has(id) || this._officialLoading.has(id)) return false;

    this._officialLoading.add(id);
    try {
      const resp = await fetch(spec.url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const buf = await resp.arrayBuffer();
      const parsed = await parseGlbBuffer(buf, {
        targetSize: spec.size,
        addBeaconAura: spec.aura,
        centerY: spec.centerY
      });
      this.monumentGeoms[id] = parsed;
      this.monumentMeshes[id] = this._uploadMonumentGeometry(parsed);
      this._officialLoaded.add(id);
      if (this.artifactId === id) {
        this.renderFrame(performance.now());
      }
      return true;
    } catch (err) {
      console.warn(`Official NASA GLB fallback to comic mesh for ${id}:`, err);
      return false;
    } finally {
      this._officialLoading.delete(id);
    }
  }

  async loadCustomGlbFile(file) {
    if (!this.gl || !file) return false;
    try {
      this.onStatusChange(`Loading ${file.name}…`);
      const buf = await file.arrayBuffer();
      const parsed = await parseGlbBuffer(buf);
      this.customGlbGeom = parsed;
      this.customGlbMesh = this._uploadMonumentGeometry(parsed);
      this.onStatusChange(`3D Model: ${file.name} Active ✓`);
      this.onGlbLoaded(file.name);
      this.renderFrame(performance.now());
      return true;
    } catch (err) {
      console.error('Custom GLB parse error:', err);
      this.onStatusChange('Error loading .glb file');
      return false;
    }
  }

  getActiveMonumentGeom() {
    if (this.customGlbGeom) {
      return { geom: this.customGlbGeom, isOfficial: false, isCustom: true };
    }
    return {
      geom: this.monumentGeoms[this.artifactId] || this.monumentGeoms.apollo11 || null,
      isOfficial: Boolean(this._officialLoaded?.has(this.artifactId)),
      isCustom: false
    };
  }

  setRealm(realm) {
    this.realm = realm;
    if (realm === 'universe') {
      this.targetGlobeProgress = 0.0;
      this.currentGlobeProgress = 0.0;
      this.manualGlobeLock = false;
      this.onGlobeModeChange(false);
    }
    this.renderFrame(performance.now());
  }

  setFullGlobeMode(enabled, manualLock = false) {
    if (this.realm === 'universe') return;
    const nextTarget = enabled ? 1.0 : 0.0;
    this.manualGlobeLock = Boolean(manualLock && enabled);
    if (this.targetGlobeProgress !== nextTarget) {
      this.targetGlobeProgress = nextTarget;
      this.onGlobeModeChange(enabled);
    }
  }

  toggleFullGlobeMode() {
    const nextState = this.targetGlobeProgress < 0.5;
    this.setFullGlobeMode(nextState, nextState);
    return nextState;
  }

  setArtifact({ id, artifactType, horizonAngle }) {
    if (id) {
      this.artifactId = id;
      if (OFFICIAL_NASA_GLBS[id]) {
        this._loadOfficialModel(id);
      }
    }
    if (artifactType) {
      this.artifactType = artifactType;
    }
    if (typeof horizonAngle === 'number') {
      this.targetRotY = horizonAngle;
    }
    this.monumentScale = 1.56;
    this.targetMonumentScale = this.monumentBaseScale;
    this.renderFrame(performance.now());
  }

  _bindEvents() {
    const el = this.canvas;
    if (!el) return;

    el.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.dragMoved = false;
      this.startY = e.clientY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      // Automatic Hover-at-Bottom Full-Globe Centering & Lowering
      // Only raise & zoom out into Full Globe when mouse is down near the bottom edge (y >= 85% of viewport)!
      if (this.realm !== 'universe' && !this.isDragging) {
        const overHudCard = e.target && typeof e.target.closest === 'function' && e.target.closest('.hud-panel');
        if (!this.manualGlobeLock) {
          if (e.clientY >= window.innerHeight * 0.85 && !overHudCard) {
            this.setFullGlobeMode(true, false);
          } else if (e.clientY <= window.innerHeight * 0.52) {
            this.setFullGlobeMode(false, false);
          }
        }
      }

      const distToMonument = Math.hypot(px - this.monumentScreenPos.x, py - this.monumentScreenPos.y);
      if (!this.isDragging) {
        if (distToMonument < 105) {
          el.style.cursor = 'pointer';
          this.targetMonumentScale = 1.48;
        } else {
          el.style.cursor = 'grab';
          this.targetMonumentScale = this.monumentBaseScale;
        }
      }

      if (!this.isDragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        this.dragMoved = true;
      }
      this.targetRotY += dx * 0.009;
      this.targetRotX = Math.max(-0.55, Math.min(0.55, this.targetRotX + dy * 0.006));

      // Also allow dragging vertically to pull the Moon up into the center or push it back down!
      if (this.realm !== 'universe') {
        const totalDy = e.clientY - (this.startY || e.clientY);
        if (totalDy < -48) {
          this.setFullGlobeMode(true, false);
        } else if (totalDy > 48) {
          this.manualGlobeLock = false;
          this.setFullGlobeMode(false, false);
        }
      }

      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    window.addEventListener('pointerup', (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      el.style.cursor = 'grab';

      if (!this.dragMoved) {
        const rect = el.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const dist = Math.hypot(px - this.monumentScreenPos.x, py - this.monumentScreenPos.y);
        if (dist < 96) {
          this.monumentScale = 1.62;
          this.onArtifactClick();
        }
      }
    });

    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.targetZoomZ = Math.min(8.6, Math.max(5.3, this.targetZoomZ + e.deltaY * 0.004));
      },
      { passive: false }
    );

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.gl || !this.canvas) return;
    const container = this.container || this.canvas.parentElement;
    const cssW = (container && container.clientWidth) || window.innerWidth;
    const cssH = (container && container.clientHeight) || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(cssW * dpr));
    const h = Math.max(1, Math.floor(cssH * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.renderFrame(performance.now());
  }

  _startLoop() {
    const tick = (now) => {
      this.rafId = requestAnimationFrame(tick);
      if (document.hidden) return;
      this.renderFrame(now);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  renderFrame(now = 0) {
    const gl = this.gl;
    if (!gl || !this.planetVao) return;

    // Smooth interpolation matching animateMoon3D + Full-Globe centering transition
    this.currentRotY += (this.targetRotY - this.currentRotY) * 0.06;
    this.currentRotX += (this.targetRotX - this.currentRotX) * 0.06;
    this.currentZoomZ += (this.targetZoomZ - this.currentZoomZ) * 0.08;
    this.monumentScale += (this.targetMonumentScale - this.monumentScale) * 0.12;
    this.currentGlobeProgress += (this.targetGlobeProgress - this.currentGlobeProgress) * 0.14;

    if (!this.reducedMotion && !this.isDragging) {
      this.targetRotY += 0.00045;
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = (this.canvas.width || 1) / (this.canvas.height || 1);
    const g = this.realm === 'universe' ? 0.0 : this.currentGlobeProgress;

    const isMobile = window.innerWidth < 768;

    // Interpolate camera between Bottom Horizon (g=0) and Centered Full Globe (g=1)
    const proj = mat4Perspective((40 * Math.PI) / 180, aspect, 0.1, 100.0);
    const camX = isMobile ? 0.0 : 0.28 * (1.0 - g);
    const camY = (isMobile ? 0.45 : 1.25) * (1.0 - g);
    const camPos = [camX, camY, this.currentZoomZ];
    const lookX = isMobile ? 0.0 : 0.28 * (1.0 - g);
    const lookY = (isMobile ? 0.05 : -0.35) * (1.0 - g);
    const view = mat4LookAt(camPos, [lookX, lookY, 0.0], [0, 1, 0]);

    // Interpolate Planet center & scale so at g=0 it forms a clean, less-zoomed bottom horizon,
    // and at g=1 the entire 3D Moon/Mars globe sits compact & completely visible in the center of the screen!
    const planetScale = (isMobile ? 0.36 : 0.56) * (1.0 - g) + (isMobile ? 0.17 : 0.21) * g;
    const planetCenterY = (isMobile ? -1.95 : -3.72) * (1.0 - g) - 0.05 * g;

    // Monument local coordinates sitting on top of the planet ridge [0.85, 5.14, 0.55]
    const planetModel = mat4FromTranslationRotationScale(
      0.0,
      planetCenterY,
      0.0,
      this.currentRotX * 0.45 * g,
      this.currentRotY,
      0.0,
      planetScale
    );
    const ridgeX = planetModel[0] * 0.85 + planetModel[4] * 5.14 + planetModel[8] * 0.55 + planetModel[12];
    const ridgeY = planetModel[1] * 0.85 + planetModel[5] * 5.14 + planetModel[9] * 0.55 + planetModel[13];
    const ridgeZ = planetModel[2] * 0.85 + planetModel[6] * 5.14 + planetModel[10] * 0.55 + planetModel[14];

    const beaconX = planetModel[0] * 0.85 + planetModel[4] * 5.49 + planetModel[8] * 0.55 + planetModel[12];
    const beaconY = planetModel[1] * 0.85 + planetModel[5] * 5.49 + planetModel[9] * 0.55 + planetModel[13];
    const beaconZ = planetModel[2] * 0.85 + planetModel[6] * 5.49 + planetModel[10] * 0.55 + planetModel[14];

    // 1. Draw Comic Horizon / Centered Full Sphere ONLY in Moon & Mars modes!
    // In Universe mode, there is NO planet below — the 3D spacecraft flies freely through space!
    if (this.realm !== 'universe') {
      const planetNormalMat = mat3FromMat4(planetModel);

      gl.useProgram(this.planetProg);
      gl.uniformMatrix4fv(this.planetLocs.uProjection, false, proj);
      gl.uniformMatrix4fv(this.planetLocs.uView, false, view);
      gl.uniformMatrix4fv(this.planetLocs.uModel, false, planetModel);
      gl.uniformMatrix3fv(this.planetLocs.uNormalMatrix, false, planetNormalMat);
      gl.uniform3f(this.planetLocs.uBeaconPos, beaconX, beaconY, beaconZ);

      const activeTex = this.realmTextures[this.realm] || this.realmTextures.moon;
      if (activeTex) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, activeTex);
        gl.uniform1i(this.planetLocs.uBaseColorTex, 0);
      }

      gl.bindVertexArray(this.planetVao);

      // Pass 1a: Comic black ink outline around the horizon/globe rim (scale = 1.006, BackSide)
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.FRONT);
      gl.uniform1f(this.planetLocs.uOutlineScale, 1.006);
      gl.drawElements(gl.TRIANGLES, this.planetIndexCount, this.planetIndexType, 0);

      // Pass 1b: Comic cel-shaded surface with hand-drawn craters
      gl.cullFace(gl.BACK);
      gl.uniform1f(this.planetLocs.uOutlineScale, 1.0);
      gl.drawElements(gl.TRIANGLES, this.planetIndexCount, this.planetIndexType, 0);
    }

    // 2. Draw Detailed Comic 3D Artifact
    // On Moon & Mars: sits on the planet ridge and scales proportionally with the Moon/Mars (plus extra shrink in Full Globe mode so it never looks oversized!).
    // In Universe: flies freely in 3D figure-8 flight path across the starry sky!
    const monMesh = this.customGlbMesh || this.monumentMeshes[this.artifactId] || this.monumentMeshes.apollo11;
    if (monMesh) {
      let mx = ridgeX;
      let my = ridgeY;
      let mz = ridgeZ;
      let monModel;

      if (this.realm === 'universe') {
        const t = this.reducedMotion ? 0.5 : now * 0.00065;
        mx = 0.0 + Math.sin(t) * 1.15;
        my = 0.10 + Math.sin(t * 2.0) * 0.36;
        mz = 0.65 + Math.cos(t * 1.3) * 0.45;
        const rx = 0.18 + Math.sin(t * 1.5) * 0.18 + this.currentRotX;
        const ry = this.currentRotY + Math.cos(t * 0.85) * 0.65;
        const rz = -0.16 * Math.cos(t); // Dynamic banking into turns!
        const renderScale = this.monumentScale * 0.92;
        monModel = mat4FromTranslationRotationScale(mx, my, mz, rx, ry, rz, renderScale);
      } else {
        const localSpin = this.reducedMotion ? 0.25 : Math.sin(now * 0.0008) * 0.35;
        const renderScale = this.monumentScale * planetScale * (0.98 - 0.16 * g);
        const localMon = mat4FromTranslationRotationScale(
          0.85,
          5.14,
          0.55,
          0.0,
          localSpin,
          -0.14,
          renderScale / (planetScale || 1)
        );
        monModel = mat4Multiply(planetModel, localMon);
      }
      const monNormalMat = mat3FromMat4(monModel);
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.004);

      gl.useProgram(this.monumentProg);
      gl.uniformMatrix4fv(this.monumentLocs.uProjection, false, proj);
      gl.uniformMatrix4fv(this.monumentLocs.uView, false, view);
      gl.uniformMatrix4fv(this.monumentLocs.uModel, false, monModel);
      gl.uniformMatrix3fv(this.monumentLocs.uNormalMatrix, false, monNormalMat);
      gl.uniform3f(this.monumentLocs.uCameraPos, camPos[0], camPos[1], camPos[2]);
      gl.uniform1f(this.monumentLocs.uPulse, pulse);

      gl.bindVertexArray(monMesh.vao);

      // Pass 2a: Crisp comic black ink outline pass (BackSide)
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.FRONT);
      gl.uniform1f(this.monumentLocs.uOutlinePass, 1.0);
      gl.drawElements(gl.TRIANGLES, monMesh.count, monMesh.indexType || gl.UNSIGNED_SHORT, 0);

      // Pass 2b: Comic cel-shaded fill pass
      gl.disable(gl.CULL_FACE);
      gl.uniform1f(this.monumentLocs.uOutlinePass, 0.0);
      gl.drawElements(gl.TRIANGLES, monMesh.count, monMesh.indexType || gl.UNSIGNED_SHORT, 0);

      // Project monument 3D center to container CSS pixels for click/hover detection
      const vp = mat4Multiply(proj, view);
      const clipX = vp[0] * mx + vp[4] * (my + 0.25) + vp[8] * mz + vp[12];
      const clipY = vp[1] * mx + vp[5] * (my + 0.25) + vp[9] * mz + vp[13];
      const clipW = vp[3] * mx + vp[7] * (my + 0.25) + vp[11] * mz + vp[15] || 1;
      const ndcX = clipX / clipW;
      const ndcY = clipY / clipW;

      const rect = this.canvas.getBoundingClientRect();
      this.monumentScreenPos.x = (ndcX * 0.5 + 0.5) * rect.width;
      this.monumentScreenPos.y = (-ndcY * 0.5 + 0.5) * rect.height;
    }

    gl.bindVertexArray(null);
  }
}

export class ModelInspector3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas ? canvas.getContext('webgl2', { antialias: true, alpha: true }) : null;
    this.prog = null;
    this.locs = null;
    this.mesh = null;
    this.centerY = 0;
    this.targetRotY = 0.55;
    this.currentRotY = 0.55;
    this.targetRotX = 0.25;
    this.currentRotX = 0.25;
    this.targetZoom = 2.15;
    this.currentZoom = 2.15;
    this.autoSpin = true;
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.active = false;
    this.rafId = 0;

    if (this.gl) {
      this._initGL();
      this._bindEvents();
    }
  }

  _initGL() {
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.prog = createProgram(gl, MONUMENT_VERT, MONUMENT_FRAG);
    this.locs = {
      uProjection: gl.getUniformLocation(this.prog, 'uProjection'),
      uView: gl.getUniformLocation(this.prog, 'uView'),
      uModel: gl.getUniformLocation(this.prog, 'uModel'),
      uNormalMatrix: gl.getUniformLocation(this.prog, 'uNormalMatrix'),
      uCameraPos: gl.getUniformLocation(this.prog, 'uCameraPos'),
      uPulse: gl.getUniformLocation(this.prog, 'uPulse'),
      uOutlinePass: gl.getUniformLocation(this.prog, 'uOutlinePass')
    };
  }

  _bindEvents() {
    const el = this.canvas;
    if (!el) return;

    el.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      el.setPointerCapture?.(e.pointerId);
    });

    el.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.targetRotY += dx * 0.012;
      this.targetRotX = Math.max(-1.35, Math.min(1.35, this.targetRotX + dy * 0.010));
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    el.addEventListener('pointerup', () => {
      this.isDragging = false;
    });
    el.addEventListener('pointercancel', () => {
      this.isDragging = false;
    });

    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.targetZoom = Math.min(3.8, Math.max(1.25, this.targetZoom + e.deltaY * 0.002));
      },
      { passive: false }
    );
  }

  setGeometry(geom) {
    if (!this.gl || !geom) return;
    const gl = this.gl;
    if (this.mesh?.vao) gl.deleteVertexArray(this.mesh.vao);

    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 1; i < geom.positions.length; i += 3) {
      const y = geom.positions[i];
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    this.centerY = Number.isFinite(minY) && Number.isFinite(maxY) ? (minY + maxY) * 0.5 : 0;

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const bindAttr = (loc, data, size) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };

    bindAttr(0, geom.positions, 3);
    bindAttr(1, geom.normals, 3);
    bindAttr(2, geom.colors, 3);
    bindAttr(3, geom.metas, 2);
    bindAttr(4, geom.pivots, 3);

    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geom.indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    this.mesh = {
      vao,
      count: geom.indices.length,
      indexType: geom.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT
    };
    this.resetView();
    this.renderFrame(performance.now());
  }

  focusPart({ yaw = 0.55, pitch = 0.25, zoom = 1.85 } = {}) {
    this.autoSpin = false;
    this.targetRotY = yaw;
    this.targetRotX = pitch;
    this.targetZoom = zoom;
  }

  resetView() {
    this.targetRotY = 0.55;
    this.targetRotX = 0.25;
    this.targetZoom = 2.15;
    this.autoSpin = true;
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.resize();
    const tick = (now) => {
      if (!this.active) return;
      this.rafId = requestAnimationFrame(tick);
      this.renderFrame(now);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop() {
    this.active = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  resize() {
    if (!this.gl || !this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor((rect.width || 620) * dpr));
    const h = Math.max(1, Math.floor((rect.height || 480) * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.gl.viewport(0, 0, w, h);
  }

  renderFrame(now = 0) {
    const gl = this.gl;
    if (!gl || !this.mesh) return;

    this.currentRotY += (this.targetRotY - this.currentRotY) * 0.1;
    this.currentRotX += (this.targetRotX - this.currentRotX) * 0.1;
    this.currentZoom += (this.targetZoom - this.currentZoom) * 0.1;
    if (this.autoSpin && !this.isDragging) {
      this.targetRotY += 0.0045;
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = (this.canvas.width || 1) / (this.canvas.height || 1);
    const proj = mat4Perspective((38 * Math.PI) / 180, aspect, 0.1, 50.0);
    const camPos = [0, 0.12, this.currentZoom];
    const view = mat4LookAt(camPos, [0, 0, 0], [0, 1, 0]);
    const model = mat4FromTranslationRotationScale(
      0,
      -this.centerY * 1.15,
      0,
      this.currentRotX,
      this.currentRotY,
      0,
      1.25
    );
    const normalMat = mat3FromMat4(model);
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.005);

    gl.useProgram(this.prog);
    gl.uniformMatrix4fv(this.locs.uProjection, false, proj);
    gl.uniformMatrix4fv(this.locs.uView, false, view);
    gl.uniformMatrix4fv(this.locs.uModel, false, model);
    gl.uniformMatrix3fv(this.locs.uNormalMatrix, false, normalMat);
    gl.uniform3f(this.locs.uCameraPos, camPos[0], camPos[1], camPos[2]);
    gl.uniform1f(this.locs.uPulse, pulse);

    gl.bindVertexArray(this.mesh.vao);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    gl.uniform1f(this.locs.uOutlinePass, 1.0);
    gl.drawElements(gl.TRIANGLES, this.mesh.count, this.mesh.indexType, 0);

    gl.disable(gl.CULL_FACE);
    gl.uniform1f(this.locs.uOutlinePass, 0.0);
    gl.drawElements(gl.TRIANGLES, this.mesh.count, this.mesh.indexType, 0);

    gl.bindVertexArray(null);
  }
}

export const LunarHorizon3D = Horizon3DEngine;
