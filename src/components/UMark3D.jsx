import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import spriteRaw from '../assets/sprite.svg?raw';
import { U_OUTLINE, FLAG_OUTLINE, DUST, NODES } from './umarkData';

// The prototype's SVG symbol uses viewBox "40 110 680 640"; its centre becomes the 3D origin.
const VB = { x: 40, y: 110, w: 680, h: 640 };
const CX = VB.x + VB.w / 2;
const CY = VB.y + VB.h / 2;
const UNIT = 0.01; // SVG units -> world units
// Prototype extrudes the face 40px back from the front (on a ~405px wide logo).
const DEPTH = 60;
const BEVEL = 4;
const FRONT_Z = 0;
const BACK_Z = -(DEPTH + BEVEL * 2);
// .stage has inset:6% inside the square .mark3d, and canvas.dots is 190% x 180% of .mark3d.
const EL_WORLD = (VB.w / 0.88) * UNIT;
const CANVAS_H_WORLD = EL_WORLD * 1.8;
// ~ CSS perspective:1100px on a 460px element
const CAM_Z = EL_WORLD * (1100 / 460);
const FOV = THREE.MathUtils.radToDeg(2 * Math.atan(CANVAS_H_WORLD / 2 / CAM_Z));
const SHELL_S = 0.62 * CANVAS_H_WORLD;
const DEG = Math.PI / 180;

const toShape = (pts) => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x - CX, CY - y)));

// Draws the original SVG face (gradient fill, inner glow, facets, mesh lines, neon outline)
// onto a canvas once, minus the circles, which are rendered as live 3D particles instead.
let facePromise;
function loadFaceCanvas() {
  if (facePromise) return facePromise;
  const start = spriteRaw.indexOf('<symbol id="umark"');
  const inner = spriteRaw
    .slice(spriteRaw.indexOf('>', start) + 1, spriteRaw.indexOf('</symbol>', start))
    .replace(/<circle[^>]*\/>|<circle[^>]*>[\s\S]*?<\/circle>/g, '');
  const W = 2040;
  const H = Math.round((W * VB.h) / VB.w);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" width="${W}" height="${H}">${inner}</svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  facePromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      c.getContext('2d').drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);
      resolve(c);
    };
    img.onerror = reject;
    img.src = url;
  });
  return facePromise;
}

const glowVert = /* glsl */ `
  attribute float size;
  attribute float alpha;
  attribute float dur;
  attribute float begin;
  uniform float uTime;
  uniform float uUnitPx;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = size * uUnitPx / -mv.z;
    float a = alpha;
    // SVG <animate values="1;.25;1"> equivalent
    if (dur > 0.0 && uTime >= begin) a *= 0.25 + 0.75 * abs(2.0 * fract((uTime - begin) / dur) - 1.0);
    vAlpha = a;
  }
`;
const glowFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uCore;
  uniform float uHalo;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float core = 1.0 - smoothstep(uCore * 0.8, uCore, d);
    float halo = exp(-d * d * 7.0) * uHalo;
    gl_FragColor = vec4(uColor, (core + halo) * vAlpha);
  }
`;

function makePoints(items, { color, core, halo, pad, zFor }) {
  const n = items.length;
  const pos = new Float32Array(n * 3);
  const size = new Float32Array(n);
  const alpha = new Float32Array(n);
  const dur = new Float32Array(n);
  const begin = new Float32Array(n);
  items.forEach((it, i) => {
    pos.set([it.x - CX, CY - it.y, zFor(i)], i * 3);
    size[i] = (it.r + pad) * 2 * UNIT;
    alpha[i] = it.a;
    dur[i] = it.dur;
    begin[i] = it.begin;
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('size', new THREE.BufferAttribute(size, 1));
  g.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
  g.setAttribute('dur', new THREE.BufferAttribute(dur, 1));
  g.setAttribute('begin', new THREE.BufferAttribute(begin, 1));
  const m = new THREE.ShaderMaterial({
    vertexShader: glowVert,
    fragmentShader: glowFrag,
    uniforms: {
      uTime: { value: 0 },
      uUnitPx: { value: 1 },
      uColor: { value: new THREE.Color(color) },
      uCore: { value: core },
      uHalo: { value: halo },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(g, m);
}

// Deterministic pseudo-random so both marks look identical.
const rand = (i) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const shellVert = /* glsl */ `
  attribute float size;
  attribute float tw;
  attribute float sp;
  attribute float idx;
  uniform float uTime;
  uniform float uUnitPx;
  uniform float uS;
  uniform float uMy;
  uniform float uMotion;
  varying float vAlpha;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    float z = wp.z / uS; // -1 (far) .. 1 (near)
    wp.y += uMotion * sin(uTime * 0.4 + idx) * 0.01 * uS + uMy * 0.04 * wp.z;
    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = size * uUnitPx / -mv.z;
    float tw = mix(1.0, 0.65 + 0.35 * sin(uTime * sp + tw), uMotion);
    vAlpha = clamp((0.35 + 0.65 * ((z + 1.0) / 2.0)) * tw, 0.0, 1.0);
  }
`;
// Same radial gradient as the prototype's 64px dot sprite.
const shellFrag = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    vec4 c0 = vec4(210.0, 255.0, 210.0, 255.0) / 255.0;
    vec4 c1 = vec4(80.0, 255.0, 95.0, 242.0) / 255.0;
    vec4 c2 = vec4(40.0, 220.0, 60.0, 89.0) / 255.0;
    vec4 c3 = vec4(40.0, 220.0, 60.0, 0.0) / 255.0;
    vec4 c = d < 0.18 ? mix(c0, c1, d / 0.18) : d < 0.45 ? mix(c1, c2, (d - 0.18) / 0.27) : mix(c2, c3, (d - 0.45) / 0.55);
    gl_FragColor = vec4(c.rgb, c.a * vAlpha);
  }
`;

// Glowing particle shell orbiting the logo, denser near it.
function makeShell(count, seed) {
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const tw = new Float32Array(count);
  const sp = new Float32Array(count);
  const idx = new Float32Array(count);
  let k = seed;
  const r01 = () => rand(k++);
  for (let i = 0; i < count; i++) {
    const r = 0.32 + Math.pow(r01(), 1.6) * 0.75;
    const t = r01() * Math.PI * 2;
    const ph = Math.acos(2 * r01() - 1);
    pos.set(
      [r * Math.sin(ph) * Math.cos(t) * SHELL_S, r * Math.sin(ph) * Math.sin(t) * 0.9 * SHELL_S, r * Math.cos(ph) * SHELL_S],
      i * 3
    );
    // prototype sprite is drawn 4x its dot size, which is ~0.029 world units per size step
    size[i] = (r01() < 0.07 ? r01() * 1.6 + 1.8 : r01() * 1.1 + 0.5) * 0.115;
    tw[i] = r01() * 6.28;
    sp[i] = 0.5 + r01() * 1.5;
    idx[i] = i;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('size', new THREE.BufferAttribute(size, 1));
  g.setAttribute('tw', new THREE.BufferAttribute(tw, 1));
  g.setAttribute('sp', new THREE.BufferAttribute(sp, 1));
  g.setAttribute('idx', new THREE.BufferAttribute(idx, 1));
  const m = new THREE.ShaderMaterial({
    vertexShader: shellVert,
    fragmentShader: shellFrag,
    uniforms: {
      uTime: { value: 0 },
      uUnitPx: { value: 1 },
      uS: { value: SHELL_S },
      uMy: { value: 0 },
      uMotion: { value: 1 },
    },
    transparent: true,
    depthTest: false, // the prototype paints the dots behind the logo
    depthWrite: false,
  });
  const points = new THREE.Points(g, m);
  points.renderOrder = -1;
  return points;
}

function buildScene(faceCanvas, small) {
  const scene = new THREE.Scene();
  const mark = new THREE.Group();
  mark.scale.setScalar(UNIT);
  mark.rotation.order = 'YXZ'; // CSS "rotateY() rotateX()"
  scene.add(mark);

  const shell = makeShell(small ? 140 : 220, small ? 5000 : 7000);
  scene.add(shell);

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xeaffea, 1.4);
  key.position.set(-4, 6, 8);
  scene.add(key);
  const rim = new THREE.PointLight(0x39e04a, 60, 30, 1.6);
  rim.position.set(5, -3, 4);
  scene.add(rim);
  const back = new THREE.PointLight(0x3dff4d, 40, 30, 1.6);
  back.position.set(-5, 2, -5);
  scene.add(back);

  const capMat = new THREE.MeshPhysicalMaterial({
    color: 0x04160a,
    emissive: 0x06280b,
    roughness: 0.25,
    metalness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.2,
    transparent: true,
    opacity: 0.92,
  });
  // colours of the prototype's #uedge extrusion layers
  const sideMat = new THREE.MeshStandardMaterial({
    color: 0x06270b,
    emissive: 0x2fbf3c,
    emissiveIntensity: 0.3,
    roughness: 0.35,
    metalness: 0.4,
  });
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x2fbf3c,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  for (const outline of [U_OUTLINE, FLAG_OUTLINE]) {
    const geo = new THREE.ExtrudeGeometry(toShape(outline), {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelOffset: -BEVEL,
      bevelSegments: 3,
      curveSegments: 1,
    });
    // front face at z=0 so it pivots like the CSS stage
    geo.translate(0, 0, -(DEPTH + BEVEL));
    mark.add(new THREE.Mesh(geo, [capMat, sideMat]));

    // Neon rim on the back face (the front one comes from the SVG face texture).
    const pts = outline.map(([x, y]) => new THREE.Vector3(x - CX, CY - y, BACK_Z));
    mark.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), edgeMat));
  }

  // Original SVG artwork as the front face.
  const tex = new THREE.CanvasTexture(faceCanvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(VB.w, VB.h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  face.position.z = FRONT_Z + 0.4;
  face.renderOrder = 2;
  mark.add(face);

  // Dust suspended through the glass body, nodes glowing on the surface.
  const dust = makePoints(
    DUST.map(([x, y, r, a]) => ({ x, y, r, a, dur: 0, begin: 0 })),
    { color: 0xb6ffbb, core: 0.45, halo: 0.35, pad: 1.2, zFor: (i) => BACK_Z + rand(i) * -BACK_Z }
  );
  const nodes = makePoints(
    NODES.map(([x, y, r, dur, begin]) => ({ x, y, r, a: 1, dur, begin })),
    { color: 0xeaffea, core: 0.28, halo: 0.9, pad: 5, zFor: (i) => FRONT_Z + 1 + rand(i + 999) * 6 }
  );
  dust.material.depthTest = false; // seen through the translucent body
  dust.renderOrder = 3;
  nodes.renderOrder = 4;
  mark.add(dust, nodes);

  const dispose = () => {
    scene.traverse((o) => {
      o.geometry?.dispose();
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m?.dispose());
    });
    tex.dispose();
  };
  return { scene, mark, shell, glow: [dust.material, nodes.material, shell.material], dispose };
}

export default function UMark3D({ small = false, label }) {
  const hostRef = useRef(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setFallback(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.className = 'dots'; // oversized like the prototype's dot canvas, so particles can spill out
    host.appendChild(canvas);

    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, CAM_Z);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let built;
    let raf = 0;
    let visible = true;
    let disposed = false;
    // pointer position relative to the viewport, -0.5..0.5
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    const clock = new THREE.Clock();

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (built) {
        // pixels per world unit at distance 1, so point sprites match the SVG circle sizes
        const unitPx = canvas.height / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
        built.glow.forEach((m) => (m.uniforms.uUnitPx.value = unitPx));
      }
    };

    const frame = () => {
      raf = 0;
      if (!built || disposed) return;
      const t = clock.getElapsedTime();
      const { mark, shell, glow } = built;
      const motion = reduced ? 0 : 1;
      // same easing and angles as the prototype's CSS stage transform
      ry += (-18 + mx * 26 + motion * Math.sin(t * 0.45) * 7 - ry) * 0.06;
      rx += (8 - my * 16 - rx) * 0.06;
      mark.rotation.set(-rx * DEG, ry * DEG, 0);
      mark.position.y = -motion * Math.sin(t * 0.9) * 6 * (EL_WORLD / 460);
      shell.rotation.y = -(motion * t * 0.06 + mx * 0.5);
      shell.material.uniforms.uMy.value = my;
      shell.material.uniforms.uMotion.value = motion;
      glow.forEach((m) => (m.uniforms.uTime.value = t));
      renderer.render(built.scene, camera);
      if (visible && (!reduced || Math.abs(-18 + mx * 26 - ry) > 0.01)) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onPointer = (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };

    const ro = new ResizeObserver(() => {
      resize();
      kick();
    });
    ro.observe(host);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    io.observe(host);
    if (!reduced) window.addEventListener('pointermove', onPointer, { passive: true });

    loadFaceCanvas()
      .then((faceCanvas) => {
        if (disposed) return;
        built = buildScene(faceCanvas, small);
        if (reduced) {
          ry = -18;
          rx = 8;
        }
        renderer.compile(built.scene, camera);
        resize();
        kick();
      })
      .catch(() => !disposed && setFallback(true));

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      built?.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [small]);

  return (
    <div
      ref={hostRef}
      className={small ? 'mark3d sm' : 'mark3d'}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      {fallback && (
        <svg className="umark" viewBox="0 0 680 640">
          <use href="#umark" width="680" height="640" />
        </svg>
      )}
    </div>
  );
}
