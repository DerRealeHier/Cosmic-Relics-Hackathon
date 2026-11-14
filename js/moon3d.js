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
async function parseGlbBuffer(arrayBuffer) {
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

  const mesh = jsonChunk.meshes[0];
  const prim = mesh.primitives[0];

  function getAccessorTypedArray(accessorIndex) {
    const acc = jsonChunk.accessors[accessorIndex];
    const bv = jsonChunk.bufferViews[acc.bufferView];
    const byteOffset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    const numComponents =
      acc.type === 'SCALAR' ? 1 :
      acc.type === 'VEC2' ? 2 :
      acc.type === 'VEC3' ? 3 : 4;
    const length = acc.count * numComponents;

    if (acc.componentType === 5126) {
      return new Float32Array(binChunk, byteOffset, length);
    } else if (acc.componentType === 5123) {
      return new Uint16Array(binChunk, byteOffset, length);
    } else if (acc.componentType === 5125) {
      return new Uint32Array(binChunk, byteOffset, length);
    }
    throw new Error('Unsupported glTF accessor componentType: ' + acc.componentType);
  }

  const positions = new Float32Array(getAccessorTypedArray(prim.attributes.POSITION));
  const normals = prim.attributes.NORMAL !== undefined
    ? new Float32Array(getAccessorTypedArray(prim.attributes.NORMAL))
    : new Float32Array(positions.length);
  const indices = getAccessorTypedArray(prim.indices);

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }
  const cx = (minX + maxX) * 0.5;
  const cy = minY;
  const cz = (minZ + maxZ) * 0.5;
  const diag = Math.hypot(maxX - minX, maxY - minY, maxZ - minZ) || 1;
  const scale = 0.85 / diag;

  const colors = new Float32Array(positions.length);
  const metas = new Float32Array((positions.length / 3) * 2);
  const pivots = new Float32Array(positions.length);

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (positions[i] - cx) * scale;
    positions[i + 1] = (positions[i + 1] - cy) * scale + 0.05;
    positions[i + 2] = (positions[i + 2] - cz) * scale;

    colors[i] = 0.98;
    colors[i + 1] = 0.75;
    colors[i + 2] = 0.14;

    const vIdx = i / 3;
    metas[vIdx * 2] = 0.012;
    metas[vIdx * 2 + 1] = 0.15;

    pivots[i] = 0;
    pivots[i + 1] = 0.25;
    pivots[i + 2] = 0;
  }

  return {
    positions,
    normals,
    colors,
    metas,
    pivots,
    indices: indices instanceof Uint16Array ? indices : new Uint16Array(indices)
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
    // 2. SURVEYOR 3: Detailed Robotic Tripod Lander + Mast + Solar Sail + Digging Scoop Arm
    mb.addPart(makeCylinderGeometry(0.11, 0.14, 0.16, 6), {
      translate: [0, 0.19, 0],
      color: PALETTE.whiteHull
    });
    // Central Telemetry Mast
    mb.addPart(makeCylinderGeometry(0.018, 0.025, 0.56, 10), {
      translate: [0, 0.32, 0],
      color: PALETTE.whiteHull
    });
    // Angled Blue Solar Panel & High-Gain Planar Antenna on Top
    mb.addPart(makeBoxGeometry(0.38, 0.022, 0.20), {
      translate: [0, 0.61, 0],
      rotate: [0.22, 0.2, 0.32],
      color: PALETTE.skySolar,
      mode: 0.35
    });
    mb.addPart(makeBoxGeometry(0.22, 0.16, 0.02), {
      translate: [-0.14, 0.46, 0.05],
      rotate: [0, 0.4, -0.25],
      color: PALETTE.whiteHull
    });
    // TV Camera Turret with blue lens
    mb.addPart(makeCylinderGeometry(0.045, 0.045, 0.12, 12), {
      translate: [0.09, 0.36, 0.08],
      color: PALETTE.whiteHull
    });
    mb.addPart(makeSphereGeometry(0.036, 12, 12), {
      translate: [0.11, 0.39, 0.11],
      color: PALETTE.laserCyan,
      mode: 0.80
    });

    // 3 Tripod Legs with Crushable Footpads
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 + 0.3;
      const leg = new MeshBuilder();
      leg.addPart(makeCylinderGeometry(0.014, 0.014, 0.34, 8), {
        translate: [0.19, 0.13, 0],
        rotate: [0, 0, -0.62],
        color: PALETTE.whiteHull
      });
      leg.addPart(makeCylinderGeometry(0.06, 0.07, 0.025, 12), {
        translate: [0.31, 0.012, 0],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      mb.addGroup(leg, { rotate: [0, angle, 0] });
    }

    // Extended Pantograph Soil-Sampler Scoop Arm digging into lunar dust!
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
    armGroup.addPart(makeBoxGeometry(0.06, 0.04, 0.045), {
      translate: [0.38, -0.19, 0.19],
      rotate: [0, -0.45, 0.2],
      color: PALETTE.deepOrange,
      mode: 0.20
    });
    mb.addGroup(armGroup, { translate: [0.11, 0.21, 0.08] });

    addComicBeaconAura(mb);

  } else if (key === 'apollo15') {
    // 3. APOLLO 15: Detailed Lunar Roving Vehicle (LRV-1) + Dish Antenna + TV Camera + Hammer & Feather!
    const rover = new MeshBuilder();

    // Aluminum Space-Frame Chassis & Gold Foil Forward Avionics
    rover.addPart(makeBoxGeometry(0.56, 0.045, 0.32), {
      translate: [0, 0.13, 0],
      color: PALETTE.slateMetal
    });
    rover.addPart(makeBoxGeometry(0.16, 0.09, 0.28), {
      translate: [0.20, 0.17, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    // Two Astronaut Mesh Seats with Orange/White Backrests
    rover.addPart(makeBoxGeometry(0.14, 0.03, 0.11), {
      translate: [-0.02, 0.17, 0.08],
      color: PALETTE.whiteHull
    });
    rover.addPart(makeBoxGeometry(0.03, 0.13, 0.11), {
      translate: [-0.08, 0.23, 0.08],
      rotate: [0, 0, 0.2],
      color: PALETTE.deepOrange,
      mode: 0.20
    });
    rover.addPart(makeBoxGeometry(0.14, 0.03, 0.11), {
      translate: [-0.02, 0.17, -0.08],
      color: PALETTE.whiteHull
    });
    rover.addPart(makeBoxGeometry(0.03, 0.13, 0.11), {
      translate: [-0.08, 0.23, -0.08],
      rotate: [0, 0, 0.2],
      color: PALETTE.deepOrange,
      mode: 0.20
    });
    // T-Bar Steering Controller
    rover.addPart(makeCylinderGeometry(0.008, 0.008, 0.14, 8), {
      translate: [0.09, 0.21, 0],
      rotate: [0, 0, -0.3],
      color: PALETTE.whiteHull
    });

    // Umbrella High-Gain Dish Antenna & Color TV Camera
    rover.addPart(makeCylinderGeometry(0.008, 0.008, 0.22, 8), {
      translate: [0.22, 0.30, -0.09],
      color: PALETTE.whiteHull
    });
    rover.addPart(makeConeGeometry(0.13, 0.07, 16, true), {
      translate: [0.22, 0.42, -0.09],
      rotate: [0, 0, -0.45],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    rover.addPart(makeBoxGeometry(0.07, 0.055, 0.055), {
      translate: [0.22, 0.28, 0.09],
      color: PALETTE.whiteHull
    });
    rover.addPart(makeCylinderGeometry(0.018, 0.018, 0.04, 10), {
      translate: [0.26, 0.28, 0.09],
      rotate: [0, 0, Math.PI / 2],
      color: PALETTE.laserCyan,
      mode: 0.80
    });

    // 4 Wire-Mesh Wheels with Orange Fenders
    [
      [0.19, 0.19],
      [0.19, -0.19],
      [-0.19, 0.19],
      [-0.19, -0.19]
    ].forEach(([wx, wz]) => {
      rover.addPart(makeCylinderGeometry(0.085, 0.085, 0.055, 16), {
        translate: [wx, 0.085, wz],
        rotate: [Math.PI / 2, 0, 0],
        color: PALETTE.darkSteel
      });
      rover.addPart(makeCylinderGeometry(0.045, 0.045, 0.06, 12), {
        translate: [wx, 0.085, wz],
        rotate: [Math.PI / 2, 0, 0],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      rover.addPart(makeBoxGeometry(0.15, 0.02, 0.07), {
        translate: [wx, 0.175, wz],
        color: PALETTE.deepOrange,
        mode: 0.20
      });
    });

    mb.addGroup(rover, {
      translate: [-0.08, 0.02, 0.05],
      rotate: [0, -0.35, 0]
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
    // 4. APOLLO 16: "Orion" Descent Stage + Gold Far-UV Cosmic Telescope on Tripod + Highlands Boulder
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
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const leg = new MeshBuilder();
      leg.addPart(makeCylinderGeometry(0.012, 0.012, 0.30, 8), {
        translate: [0.23, 0.13, 0],
        rotate: [0, 0, -0.58],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      leg.addPart(makeCylinderGeometry(0.055, 0.065, 0.02, 12), {
        translate: [0.31, 0.01, 0],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      mb.addGroup(leg, { translate: [-0.14, 0, -0.06], rotate: [0, angle, 0] });
    }

    // Gold-Plated S-201 Far-UV Telescope on Tripod in Foreground Right
    const uvScope = new MeshBuilder();
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const leg = new MeshBuilder();
      leg.addPart(makeCylinderGeometry(0.01, 0.01, 0.20, 8), {
        translate: [0.06, 0.08, 0],
        rotate: [0, 0, -0.45],
        color: PALETTE.whiteHull
      });
      uvScope.addGroup(leg, { rotate: [0, a, 0] });
    }
    uvScope.addPart(makeCylinderGeometry(0.052, 0.06, 0.17, 12), {
      translate: [0, 0.21, 0],
      rotate: [-0.45, 0.3, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    uvScope.addPart(makeCylinderGeometry(0.04, 0.04, 0.04, 12), {
      translate: [0.02, 0.28, 0.05],
      rotate: [-0.45, 0.3, 0],
      color: PALETTE.laserCyan,
      mode: 0.80
    });
    mb.addGroup(uvScope, { translate: [0.30, 0.01, 0.20] });

    // Descartes Highlands White Anorthosite Boulder ("Big Muley")
    mb.addPart(makeSphereGeometry(0.075, 10, 10), {
      translate: [-0.38, 0.05, 0.26],
      scale: [1.2, 0.8, 1.0],
      color: PALETTE.whiteHull
    });

    addComicBeaconAura(mb);

  } else if (key === 'apollo17') {
    // 5. APOLLO 17: "Challenger" Lander + LRV-3 + Orange Volcanic Soil Crater + ALSEP Station
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
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const leg = new MeshBuilder();
      leg.addPart(makeCylinderGeometry(0.012, 0.012, 0.30, 8), {
        translate: [0.23, 0.13, 0],
        rotate: [0, 0, -0.58],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      leg.addPart(makeCylinderGeometry(0.055, 0.065, 0.02, 12), {
        translate: [0.31, 0.01, 0],
        color: PALETTE.goldFoil,
        mode: 0.25
      });
      mb.addGroup(leg, { translate: [-0.16, 0, -0.06], rotate: [0, angle, 0] });
    }

    // LRV-3 Parked in Foreground Right
    const lrv3 = new MeshBuilder();
    lrv3.addPart(makeBoxGeometry(0.36, 0.035, 0.22), {
      translate: [0, 0.09, 0],
      color: PALETTE.slateMetal
    });
    lrv3.addPart(makeConeGeometry(0.09, 0.05, 14, true), {
      translate: [0.13, 0.26, -0.05],
      rotate: [0, 0, -0.4],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    [
      [0.12, 0.13],
      [0.12, -0.13],
      [-0.12, 0.13],
      [-0.12, -0.13]
    ].forEach(([wx, wz]) => {
      lrv3.addPart(makeCylinderGeometry(0.058, 0.058, 0.04, 14), {
        translate: [wx, 0.058, wz],
        rotate: [Math.PI / 2, 0, 0],
        color: PALETTE.darkSteel
      });
    });
    mb.addGroup(lrv3, {
      translate: [0.32, 0.01, 0.18],
      rotate: [0, 0.55, 0]
    });

    // Shorty Crater Glowing Orange Volcanic Glass Patch + ALSEP Central Station
    mb.addPart(makeCylinderGeometry(0.18, 0.22, 0.025, 18), {
      translate: [0.06, 0.012, 0.34],
      color: PALETTE.deepOrange,
      mode: 0.35
    });
    mb.addPart(makeBoxGeometry(0.11, 0.09, 0.11), {
      translate: [-0.46, 0.05, 0.24],
      color: PALETTE.whiteHull
    });
    mb.addPart(makeCylinderGeometry(0.01, 0.01, 0.26, 8), {
      translate: [-0.46, 0.18, 0.24],
      color: PALETTE.goldFoil,
      mode: 0.25
    });

    addComicBeaconAura(mb);

  } else if (key === 'lcross_blueghost' || key === 'lcross') {
    // 6. LCROSS & CENTAUR: Dramatic Polar Crater Impact Monument + Shepherding Spacecraft + Ice Plume!
    mb.addPart(makeTorusGeometry(0.34, 0.065, 12, 24), {
      translate: [0, 0.03, 0],
      rotate: [Math.PI / 2, 0, 0],
      color: PALETTE.slateMetal
    });

    // Centaur Upper-Stage Rocket Cylinder embedded at dramatic angle inside Cabeus Crater
    const centaurGroup = new MeshBuilder();
    centaurGroup.addPart(makeCylinderGeometry(0.11, 0.11, 0.44, 16), {
      color: PALETTE.whiteHull
    });
    centaurGroup.addPart(makeCylinderGeometry(0.114, 0.114, 0.09, 16), {
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

    // LCROSS Shepherding Spacecraft Octagonal Ring & Solar Wings hovering in the plume
    const lcrossSat = new MeshBuilder();
    lcrossSat.addPart(makeCylinderGeometry(0.12, 0.12, 0.09, 8), {
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    lcrossSat.addPart(makeBoxGeometry(0.46, 0.016, 0.11), {
      color: PALETTE.skySolar,
      mode: 0.35
    });
    lcrossSat.addPart(makeSphereGeometry(0.04, 12, 12), {
      translate: [0, -0.06, 0],
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
    // SOJOURNER & PATHFINDER: 3 Unfolded Solar Petals + 6-Wheeled Micro-Rover + "Barnacle Bill" Rock
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3 + 0.3;
      const petal = new MeshBuilder();
      petal.addPart(makeCylinderGeometry(0.20, 0.22, 0.02, 3), {
        translate: [0.24, 0.015, 0],
        color: PALETTE.skySolar,
        mode: 0.35
      });
      mb.addGroup(petal, { translate: [-0.14, 0, -0.08], rotate: [0, a, 0] });
    }
    mb.addPart(makeCylinderGeometry(0.02, 0.022, 0.34, 10), {
      translate: [-0.14, 0.18, -0.08],
      color: PALETTE.whiteHull
    });
    mb.addPart(makeBoxGeometry(0.08, 0.05, 0.055), {
      translate: [-0.14, 0.36, -0.08],
      color: PALETTE.goldFoil,
      mode: 0.25
    });

    // 6-Wheeled Sojourner Rover in Foreground Right
    const soj = new MeshBuilder();
    soj.addPart(makeBoxGeometry(0.26, 0.07, 0.18), {
      translate: [0, 0.085, 0],
      color: PALETTE.goldFoil,
      mode: 0.25
    });
    soj.addPart(makeBoxGeometry(0.28, 0.018, 0.20), {
      translate: [0, 0.13, 0],
      color: PALETTE.skySolar,
      mode: 0.35
    });
    for (const wx of [-0.10, 0, 0.10]) {
      for (const wz of [-0.105, 0.105]) {
        soj.addPart(makeCylinderGeometry(0.04, 0.04, 0.03, 12), {
          translate: [wx, 0.04, wz],
          rotate: [Math.PI / 2, 0, 0],
          color: PALETTE.darkSteel
        });
      }
    }
    soj.addPart(makeCylinderGeometry(0.02, 0.02, 0.07, 10), {
      translate: [0.16, 0.07, 0],
      rotate: [0, 0, Math.PI / 2],
      color: PALETTE.laserCyan,
      mode: 0.80
    });
    mb.addGroup(soj, { translate: [0.16, 0.01, 0.16], rotate: [0, -0.25, 0] });

    mb.addPart(makeSphereGeometry(0.085, 10, 10), {
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
    return { vao, count: geom.indices.length };
  }

  async init() {
    // Keep the crisp comic 3D horizon active by default (matching (1).html)!
    this.onStatusChange('Comic 3D Horizon Active');
    this.renderFrame(performance.now());
    return true;
  }

  async loadCustomGlbFile(file) {
    if (!this.gl || !file) return false;
    try {
      this.onStatusChange(`Loading ${file.name}…`);
      const buf = await file.arrayBuffer();
      const parsed = await parseGlbBuffer(buf);
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
      // When the mouse moves down to the bottom Moon/Mars (y >= 72% of viewport), raise & center the full Moon!
      // When the mouse moves back up (y <= 46% of viewport), smoothly lower the Moon back down to the bottom horizon!
      if (this.realm !== 'universe' && !this.isDragging) {
        const overHudCard = e.target && typeof e.target.closest === 'function' && e.target.closest('.hud-panel');
        if (!this.manualGlobeLock) {
          if (e.clientY >= window.innerHeight * 0.72 && !overHudCard) {
            this.setFullGlobeMode(true, false);
          } else if (e.clientY <= window.innerHeight * 0.46) {
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

    // Interpolate camera between Bottom Horizon (g=0) and Centered Full Globe (g=1)
    const proj = mat4Perspective((40 * Math.PI) / 180, aspect, 0.1, 100.0);
    const camX = 0.28 * (1.0 - g);
    const camY = 1.25 * (1.0 - g);
    const camPos = [camX, camY, this.currentZoomZ];
    const lookX = 0.28 * (1.0 - g);
    const lookY = -0.35 * (1.0 - g);
    const view = mat4LookAt(camPos, [lookX, lookY, 0.0], [0, 1, 0]);

    // Interpolate Planet center & scale so at g=0 it forms a clean, less-zoomed bottom horizon,
    // and at g=1 the entire 3D Moon/Mars globe sits compact & completely visible in the center of the screen!
    const planetScale = 0.56 * (1.0 - g) + 0.21 * g; // 0.56 (horizon) -> 0.21 (centered full globe, radius ~1.09)
    const planetCenterY = -3.72 * (1.0 - g) - 0.05 * g;

    // Monument coordinates sitting on top of the planet ridge [0.85, 5.14, 0.55] from sphere center
    const ridgeX = 0.85 * planetScale;
    const ridgeY = planetCenterY + 5.14 * planetScale;
    const ridgeZ = 0.55 * planetScale;

    // 1. Draw Comic Horizon / Centered Full Sphere ONLY in Moon & Mars modes!
    // In Universe mode, there is NO planet below — the 3D spacecraft flies freely through space!
    if (this.realm !== 'universe') {
      const planetModel = mat4FromTranslationRotationScale(
        0.0,
        planetCenterY,
        0.0,
        this.currentRotX * 0.45 * g,
        this.currentRotY,
        0.0,
        planetScale
      );
      const planetNormalMat = mat3FromMat4(planetModel);

      gl.useProgram(this.planetProg);
      gl.uniformMatrix4fv(this.planetLocs.uProjection, false, proj);
      gl.uniformMatrix4fv(this.planetLocs.uView, false, view);
      gl.uniformMatrix4fv(this.planetLocs.uModel, false, planetModel);
      gl.uniformMatrix3fv(this.planetLocs.uNormalMatrix, false, planetNormalMat);
      gl.uniform3f(this.planetLocs.uBeaconPos, ridgeX, ridgeY + 0.35 * planetScale, ridgeZ);

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
      let rx = 0.0;
      let ry = this.reducedMotion ? 0.25 : Math.sin(now * 0.0008) * 0.55;
      let rz = -0.14;
      let renderScale = this.monumentScale * planetScale * (0.98 - 0.16 * g);

      if (this.realm === 'universe') {
        const t = this.reducedMotion ? 0.5 : now * 0.00065;
        mx = 0.0 + Math.sin(t) * 1.15;
        my = 0.10 + Math.sin(t * 2.0) * 0.36;
        mz = 0.65 + Math.cos(t * 1.3) * 0.45;
        rx = 0.18 + Math.sin(t * 1.5) * 0.18 + this.currentRotX;
        ry = this.currentRotY + Math.cos(t * 0.85) * 0.65;
        rz = -0.16 * Math.cos(t); // Dynamic banking into turns!
        renderScale = this.monumentScale * 0.92;
      }

      const monModel = mat4FromTranslationRotationScale(
        mx,
        my,
        mz,
        rx,
        ry,
        rz,
        renderScale
      );
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
      gl.drawElements(gl.TRIANGLES, monMesh.count, gl.UNSIGNED_SHORT, 0);

      // Pass 2b: Comic cel-shaded fill pass
      gl.disable(gl.CULL_FACE);
      gl.uniform1f(this.monumentLocs.uOutlinePass, 0.0);
      gl.drawElements(gl.TRIANGLES, monMesh.count, gl.UNSIGNED_SHORT, 0);

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

export const LunarHorizon3D = Horizon3DEngine;
