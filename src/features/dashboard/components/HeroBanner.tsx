// ─── HeroBanner ─────────────────────────────────────────────────────────────
// Highly animated, premium, user-interactive, 3D platform carousel.
// FIX v3:
//   1. Letter-up animation — proper perspective on parent, staggered chars
//   2. 3D canvas — canvas ref now points to the CANVAS CONTAINER div, not the
//      full section, so Three.js always gets correct dimensions
//   3. Buttons blank — handlePrimaryCta debounced; selectSlide is pure state
//      with no scroll side-effect; setPlatform called separately

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { FolderHeart, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import type { Platform } from "@/types";
import { useSearchActions } from "@/store/useSearchStore";
import { PlatformIcon } from "@/components/ui/PlatformIcon";

interface PlatformSlide {
  id: string;
  platform: Platform;
  badgeEmoji: string;
  badgeLabel: string;
  headlinePrefix: string;
  headlineAccent: string;
  subtext: string;
  ctaText: string;
  accentColor: string;
  accentRgb: string;
  gradientFrom: string;
  gradientTo: string;
}

const CAROUSEL_SLIDES: PlatformSlide[] = [
  {
    id: "instagram",
    platform: "instagram",
    badgeEmoji: "📸",
    badgeLabel: "Instagram Spotlight",
    headlinePrefix: "Find the Perfect",
    headlineAccent: "Instagram Storytellers",
    subtext: "Discover visual creators who build deep brand loyalty through stunning posts, reels, and highly engaged stories.",
    ctaText: "Explore Instagram",
    accentColor: "#fb7185",
    accentRgb: "251, 113, 133",
    gradientFrom: "rgba(251, 113, 133, 0.12)",
    gradientTo: "rgba(12, 11, 10, 0)",
  },
  {
    id: "youtube",
    platform: "youtube",
    badgeEmoji: "🎥",
    badgeLabel: "YouTube Authority",
    headlinePrefix: "Discover Influential",
    headlineAccent: "YouTube Video Stars",
    subtext: "Search deep-dive video reviewers and product educators with highly authoritative, high-intent audiences.",
    ctaText: "Discover YouTube",
    accentColor: "#f87171",
    accentRgb: "248, 113, 113",
    gradientFrom: "rgba(248, 113, 113, 0.12)",
    gradientTo: "rgba(12, 11, 10, 0)",
  },
  {
    id: "tiktok",
    platform: "tiktok",
    badgeEmoji: "🎵",
    badgeLabel: "TikTok Virality",
    headlinePrefix: "Scale Fast with",
    headlineAccent: "TikTok Trendsetters",
    subtext: "Unlock explosive organic growth and capture visual mindshare with creative short-form video stars.",
    ctaText: "Scale on TikTok",
    accentColor: "#22d3ee",
    accentRgb: "34, 211, 238",
    gradientFrom: "rgba(34, 211, 238, 0.12)",
    gradientTo: "rgba(12, 11, 10, 0)",
  },
];

const AUTO_ROTATE_INTERVAL = 6000;

// ─── 3D Helpers ───────────────────────────────────────────────────────────────
function createRoundedRectShape(width: number, height: number, radius: number) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function createHeartShape() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.15);
  shape.bezierCurveTo(0.125, 0.3, 0.25, 0.3, 0.25, 0.15);
  shape.bezierCurveTo(0.25, 0.0, 0.125, -0.15, 0, -0.3);
  shape.bezierCurveTo(-0.125, -0.15, -0.25, 0.0, -0.25, 0.15);
  shape.bezierCurveTo(-0.25, 0.3, -0.125, 0.3, 0, 0.15);
  return shape;
}

function createStarShape(points: number, outerRadius: number, innerRadius: number) {
  const shape = new THREE.Shape();
  const rot = (Math.PI / 2) * 3;
  const step = Math.PI / points;
  shape.moveTo(0, -outerRadius);
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = rot + i * step;
    shape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  shape.closePath();
  return shape;
}

// ─── 3D Models ────────────────────────────────────────────────────────────────
function createInstagramCamera() {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0xe11d48, roughness: 0.08, metalness: 0.05, transmission: 0.65, thickness: 0.6, ior: 1.52, clearcoat: 1.0, clearcoatRoughness: 0.05 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.1 });
  const lensGlassMat = new THREE.MeshPhysicalMaterial({ color: 0x111111, roughness: 0.05, metalness: 0.9, clearcoat: 1.0 });
  const lensGoldRingMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
  const flashMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5, roughness: 0.1 });
  const accentRingMat = new THREE.MeshStandardMaterial({ color: 0xfe0979, metalness: 0.5, roughness: 0.2 });
  const bodyShape = createRoundedRectShape(1.6, 1.6, 0.4);
  const extrudeSettings = { depth: 0.45, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
  const bodyMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(bodyShape, extrudeSettings), bodyMat);
  bodyMesh.position.z = -0.225;
  group.add(bodyMesh);
  const lensOuterRing = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.15, 32), lensGoldRingMat);
  lensOuterRing.rotation.x = Math.PI / 2;
  lensOuterRing.position.z = 0.225 + 0.075;
  group.add(lensOuterRing);
  const lensInnerRing = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.17, 32), chromeMat);
  lensInnerRing.rotation.x = Math.PI / 2;
  lensInnerRing.position.z = 0.225 + 0.085;
  group.add(lensInnerRing);
  const lensGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.18, 32), lensGlassMat);
  lensGlass.rotation.x = Math.PI / 2;
  lensGlass.position.z = 0.225 + 0.09;
  group.add(lensGlass);
  const reflection = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
  reflection.position.set(0.16, 0.16, 0.225 + 0.17);
  group.add(reflection);
  const flashRing = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16), chromeMat);
  flashRing.rotation.x = Math.PI / 2;
  flashRing.position.set(0.45, 0.45, 0.225 + 0.05);
  group.add(flashRing);
  const flashLens = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 16), flashMat);
  flashLens.rotation.x = Math.PI / 2;
  flashLens.position.set(0.45, 0.45, 0.225 + 0.06);
  group.add(flashLens);
  const redDot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 16), accentRingMat);
  redDot.rotation.x = Math.PI / 2;
  redDot.position.set(-0.45, 0.45, 0.225 + 0.05);
  group.add(redDot);
  const heartShape = createHeartShape();
  const heartExtrude = { depth: 0.06, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.015, bevelThickness: 0.015 };
  const heartMat = new THREE.MeshPhysicalMaterial({ color: 0xff4d6d, roughness: 0.15, clearcoat: 1.0 });
  for (let i = 0; i < 3; i++) {
    const heartMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(heartShape, heartExtrude), heartMat);
    const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const dist = 1.3 + Math.random() * 0.2;
    heartMesh.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist + 0.15, (Math.random() - 0.5) * 0.3);
    heartMesh.scale.setScalar(0.6 + Math.random() * 0.3);
    heartMesh.userData = { isFloating: true, floatSpeed: 0.006 + Math.random() * 0.008, wobbleSpeed: 1.5 + Math.random() * 1.5, rotSpeed: 0.008 + Math.random() * 0.012, initialY: heartMesh.position.y, initialX: heartMesh.position.x };
    group.add(heartMesh);
  }
  group.position.y = 0.1;
  return group;
}

function createYouTubePlay() {
  const group = new THREE.Group();
  const playRedMat = new THREE.MeshPhysicalMaterial({ color: 0xff0000, roughness: 0.06, metalness: 0.05, transmission: 0.55, thickness: 0.5, ior: 1.52, clearcoat: 1.0, clearcoatRoughness: 0.05 });
  const playWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0.85 });
  const goldClapperMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.15 });
  const playShape = createRoundedRectShape(2.1, 1.45, 0.45);
  const playMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(playShape, { depth: 0.4, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 }), playRedMat);
  playMesh.position.z = -0.2;
  group.add(playMesh);
  const triShape = new THREE.Shape();
  triShape.moveTo(-0.25, -0.3); triShape.lineTo(0.35, 0); triShape.lineTo(-0.25, 0.3); triShape.closePath();
  const triMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(triShape, { depth: 0.15, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 }), playWhiteMat);
  triMesh.position.set(-0.03, 0, 0.2);
  group.add(triMesh);
  for (let i = 0; i < 3; i++) {
    const bellGroup = new THREE.Group();
    const pts = [new THREE.Vector2(0,-0.18),new THREE.Vector2(0.16,-0.18),new THREE.Vector2(0.14,-0.05),new THREE.Vector2(0.11,0.08),new THREE.Vector2(0.06,0.18),new THREE.Vector2(0,0.2)];
    const bellDome = new THREE.Mesh(new THREE.LatheGeometry(pts, 16), goldClapperMat);
    bellGroup.add(bellDome);
    const clapper = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), goldClapperMat);
    clapper.position.y = -0.2;
    bellGroup.add(clapper);
    const handleRing = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.015, 8, 16), goldClapperMat);
    handleRing.position.y = 0.21;
    bellGroup.add(handleRing);
    const angle = (i / 3) * Math.PI * 2 + Math.PI / 4;
    const dist = 1.35 + Math.random() * 0.25;
    bellGroup.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist + 0.1, (Math.random() - 0.5) * 0.3);
    bellGroup.scale.setScalar(0.7 + Math.random() * 0.3);
    bellGroup.userData = { isFloating: true, floatSpeed: 0.005 + Math.random() * 0.008, wobbleSpeed: 1.2 + Math.random() * 1.2, rotSpeed: 0.005 + Math.random() * 0.01, initialY: bellGroup.position.y, initialX: bellGroup.position.x };
    group.add(bellGroup);
  }
  group.position.y = 0.1;
  return group;
}

function createTikTokNote() {
  const group = new THREE.Group();
  const buildNoteMesh = (material: THREE.Material) => {
    const noteGroup = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.45, 16), material);
    stem.position.set(0.12, 0.125, 0);
    noteGroup.add(stem);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.24, 32), material);
    head.position.set(-0.16, -0.6, 0);
    head.rotation.x = Math.PI / 5;
    head.rotation.z = Math.PI / 5;
    noteGroup.add(head);
    const flag = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.09, 12, 24, Math.PI), material);
    flag.position.set(-0.3, 0.43, 0);
    flag.rotation.z = 0;
    noteGroup.add(flag);
    return noteGroup;
  };
  const cyanMat = new THREE.MeshPhysicalMaterial({ color: 0x00f2fe, roughness: 0.1, metalness: 0.1, emissive: 0x00f2fe, emissiveIntensity: 0.5, transparent: true, opacity: 0.75, transmission: 0.5 });
  const magentaMat = new THREE.MeshPhysicalMaterial({ color: 0xfe0979, roughness: 0.1, metalness: 0.1, emissive: 0xfe0979, emissiveIntensity: 0.5, transparent: true, opacity: 0.75, transmission: 0.5 });
  const whiteMat = new THREE.MeshPhysicalMaterial({ color: 0xf5f3ee, roughness: 0.05, metalness: 0.1, transmission: 0.45, thickness: 0.4, ior: 1.5, clearcoat: 1.0, clearcoatRoughness: 0.05 });
  const cyanNote = buildNoteMesh(cyanMat); cyanNote.position.set(-0.05, 0.02, -0.04); group.add(cyanNote);
  const magentaNote = buildNoteMesh(magentaMat); magentaNote.position.set(0.05, -0.02, -0.04); group.add(magentaNote);
  const whiteNote = buildNoteMesh(whiteMat); whiteNote.position.set(0, 0, 0); group.add(whiteNote);
  const starShape = createStarShape(4, 0.24, 0.07);
  const starColors = [0x00f2fe, 0xfe0979, 0xffffff];
  for (let i = 0; i < 3; i++) {
    const starMat = new THREE.MeshPhysicalMaterial({ color: starColors[i % 3], emissive: starColors[i % 3], emissiveIntensity: 0.35, roughness: 0.15, clearcoat: 0.8 });
    const starMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.05, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.01, bevelThickness: 0.01 }), starMat);
    const angle = (i / 3) * Math.PI * 2 + Math.PI / 3;
    const dist = 1.25 + Math.random() * 0.25;
    starMesh.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist + 0.15, (Math.random() - 0.5) * 0.3);
    starMesh.scale.setScalar(0.75 + Math.random() * 0.3);
    starMesh.userData = { isFloating: true, floatSpeed: 0.007 + Math.random() * 0.007, wobbleSpeed: 1.4 + Math.random() * 1.4, rotSpeed: 0.01 + Math.random() * 0.015, initialY: starMesh.position.y, initialX: starMesh.position.x };
    group.add(starMesh);
  }
  group.position.y = 0.1;
  return group;
}

// ─── Letter-Up Word Component ─────────────────────────────────────────────────
const wordVariants = {
  hidden: { opacity: 0, y: 30, rotateX: -45 },
  visible: (delay: number) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const charVariants = {
  hidden: { opacity: 0, y: 36, rotateX: -55 },
  visible: (delay: number) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  }),
  exit: { opacity: 0, y: -16, transition: { duration: 0.15 } },
};

// ─── HeroBanner Component ─────────────────────────────────────────────────────
export const HeroBanner = memo(function HeroBanner() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  // Separate refs: section for mouse/resize, canvas-wrapper for Three.js sizing
  const sectionRef    = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const activeIdxRef  = useRef(activeIdx);

  const { setPlatform } = useSearchActions();

  useEffect(() => { activeIdxRef.current = activeIdx; }, [activeIdx]);

  // ── Auto-rotate timer ─────────────────────────────────────────────────────
  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / AUTO_ROTATE_INTERVAL) * 100);
      setProgressPct(pct);
      if (pct >= 100) {
        setActiveIdx((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
        setProgressPct(0);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [activeIdx]);

  // Pure slide switch — no side effects, never triggers blank
  const selectSlide = useCallback((index: number) => {
    setActiveIdx(index);
    setProgressPct(0);
  }, []);

  // ── Three.js Scene ─────────────────────────────────────────────────────────
  useEffect(() => {
    const wrapper = canvasWrapRef.current;
    const canvas  = canvasRef.current;
    const section = sectionRef.current;
    if (!wrapper || !canvas || !section) return;

    // Wait one frame so the DOM has painted and clientWidth is real
    const initGL = () => {
     try {
      const W = wrapper.clientWidth  || 460;
      const H = wrapper.clientHeight || 420;

      // Set canvas intrinsic size
      canvas.width  = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      canvas.style.width  = W + "px";
      canvas.style.height = H + "px";

      const getR3D = (w: number) => {
        if (w <= 480)  return { fov: 44, cameraZ: 5.8, cameraY: 0.15, scale: 0.70 };
        if (w <= 768)  return { fov: 40, cameraZ: 5.0, cameraY: 0.10, scale: 0.88 };
        if (w <= 1024) return { fov: 36, cameraZ: 4.5, cameraY: 0.08, scale: 1.05 };
        return              { fov: 32, cameraZ: 4.0, cameraY: 0.05, scale: 1.22 };
      };

      const scene = new THREE.Scene();
      const r3d   = getR3D(W);
      const camera = new THREE.PerspectiveCamera(r3d.fov, W / H, 0.1, 100);
      camera.position.set(0, r3d.cameraY, r3d.cameraZ);
      camera.lookAt(0, 0.1, 0);

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.5;

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const key = new THREE.DirectionalLight(0xffeedd, 3.2);
      key.position.set(5, 8, 5); key.castShadow = true;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xccddff, 1.4);
      fill.position.set(-6, 3, -2);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffffff, 1.8);
      rim.position.set(0, -3, -6);
      scene.add(rim);
      const spot = new THREE.SpotLight(0xffffff, 7);
      spot.position.set(0, 5, 4); spot.angle = Math.PI / 4; spot.penumbra = 0.6;
      spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024);
      scene.add(spot);

      const accentLight = new THREE.PointLight(CAROUSEL_SLIDES[activeIdxRef.current].accentColor, 7, 18);
      accentLight.position.set(-3, 3, 3);
      scene.add(accentLight);
      const bounceLight = new THREE.PointLight(CAROUSEL_SLIDES[activeIdxRef.current].accentColor, 3, 14);
      bounceLight.position.set(2, -3, 2);
      scene.add(bounceLight);

      // Shadow plane
      const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.15, transparent: true }));
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -1.15;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      // Build models
      const models: Record<string, THREE.Group> = {
        instagram: createInstagramCamera(),
        youtube:   createYouTubePlay(),
        tiktok:    createTikTokNote(),
      };

      Object.keys(models).forEach((key) => {
        const m = models[key];
        m.visible = false;
        m.scale.set(0, 0, 0);
        m.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        scene.add(m);
      });

      // Show initial model immediately at full scale
      const initPlatform = CAROUSEL_SLIDES[activeIdxRef.current].platform;
      const initModel = models[initPlatform];
      if (initModel) {
        initModel.visible = true;
        const s = getR3D(W).scale;
        initModel.scale.set(s, s, s);
        initModel.position.y = 0.1;
      }

      // Resize handler
      const onResize = () => {
        const nW = wrapper.clientWidth  || 460;
        const nH = wrapper.clientHeight || 420;
        const nr  = getR3D(nW);
        camera.aspect = nW / nH;
        camera.fov    = nr.fov;
        camera.position.set(0, nr.cameraY, nr.cameraZ);
        camera.lookAt(0, 0.1, 0);
        camera.updateProjectionMatrix();
        renderer.setSize(nW, nH);
        canvas.style.width  = nW + "px";
        canvas.style.height = nH + "px";
        const cur = CAROUSEL_SLIDES[activeIdxRef.current].platform;
        if (models[cur]?.visible) models[cur].scale.setScalar(nr.scale);
      };
      window.addEventListener("resize", onResize);

      // Mouse parallax (on the section, not the canvas wrapper)
      let tRotX = 0, tRotY = 0;
      const onMouse = (e: MouseEvent) => {
        const rect = section.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
        const ny = ((e.clientY - rect.top)  / rect.height) * 2 - 1;
        tRotX = -ny * 0.18;
        tRotY =  nx * 0.22;
      };
      section.addEventListener("mousemove", onMouse);

      // Animation loop
      let lastIdx = activeIdxRef.current;
      const startTime = performance.now();
      let rafId: number;

      const animate = () => {
        rafId = requestAnimationFrame(animate);
        const t   = (performance.now() - startTime) / 1000;
        const cur = activeIdxRef.current;
        const curPlatform = CAROUSEL_SLIDES[cur].platform;
        const nW2 = wrapper.clientWidth || 460;
        const nr2 = getR3D(nW2);

        // Model swap
        if (cur !== lastIdx) {
          const oldM = models[CAROUSEL_SLIDES[lastIdx].platform];
          const newM = models[curPlatform];
          if (oldM) { oldM.userData.targetScale = 0; }
          if (newM) { newM.visible = true; newM.position.y = -1.5; newM.rotation.y = -Math.PI; newM.userData.targetScale = nr2.scale; }
          lastIdx = cur;
        }

        // Accent lights cross-fade
        const acCol = new THREE.Color(CAROUSEL_SLIDES[cur].accentColor);
        accentLight.color.lerp(acCol, 0.05);
        bounceLight.color.lerp(acCol, 0.05);

        Object.keys(models).forEach((key) => {
          const m = models[key];
          if (!m) return;
          const isCur = key === curPlatform;
          const ts    = isCur ? nr2.scale : 0;
          m.scale.x   = THREE.MathUtils.lerp(m.scale.x, ts, 0.08);
          m.scale.y   = THREE.MathUtils.lerp(m.scale.y, ts, 0.08);
          m.scale.z   = THREE.MathUtils.lerp(m.scale.z, ts, 0.08);
          if (!isCur && m.scale.x < 0.005) { m.visible = false; return; }
          if (m.visible) {
            const bob = Math.sin(t * 1.4) * 0.08;
            if (isCur) {
              m.position.y   = THREE.MathUtils.lerp(m.position.y, 0.1 + bob, 0.06);
              m.rotation.y   = THREE.MathUtils.lerp(m.rotation.y, t * 0.18 + tRotY, 0.05);
              m.rotation.x   = THREE.MathUtils.lerp(m.rotation.x, tRotX, 0.05);
              m.rotation.z   = THREE.MathUtils.lerp(m.rotation.z, -tRotY * 0.5, 0.05);
            } else {
              m.position.y = THREE.MathUtils.lerp(m.position.y, -1.8, 0.08);
              m.rotation.y += 0.02;
            }
            m.children.forEach((child) => {
              if (!child.userData.isFloating) return;
              child.position.y += child.userData.floatSpeed;
              child.rotation.y += child.userData.rotSpeed;
              child.rotation.x += child.userData.rotSpeed * 0.5;
              child.position.x = child.userData.initialX + Math.sin(t * child.userData.wobbleSpeed) * 0.08;
              if (child.position.y - child.userData.initialY > 1.2) {
                child.position.y = child.userData.initialY - 0.4;
                child.position.x = child.userData.initialX;
              }
            });
          }
        });

        renderer.render(scene, camera);
      };
      animate();

      return () => {
        window.removeEventListener("resize",     onResize);
        section.removeEventListener("mousemove", onMouse);
        cancelAnimationFrame(rafId);
        const dispose = (obj: THREE.Object3D | null) => {
          if (!obj) return;
          const m = obj as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          if (m.material) {
            if (Array.isArray(m.material)) m.material.forEach((x) => x?.dispose());
            else m.material.dispose();
          }
          obj.children.forEach(dispose);
        };
        Object.values(models).forEach(dispose);
        dispose(shadowPlane);
        renderer.dispose();
      };
     } catch (e) {
       console.warn('[HeroBanner] Three.js init failed:', e);
     }
    };

    // Use rAF to ensure layout is done before reading clientWidth
    const rafHandle = requestAnimationFrame(initGL);
    return () => { cancelAnimationFrame(rafHandle); };
  }, []);

  // ── CTA handlers ──────────────────────────────────────────────────────────
  const handlePrimaryCta = useCallback((slide: PlatformSlide) => {
    setPlatform(slide.platform);
    setTimeout(() => {
      document.getElementById("discovery-section")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, [setPlatform]);

  const handleSecondaryCta = useCallback(() => {
    window.dispatchEvent(new CustomEvent("open-campaign-sidebar"));
  }, []);

  const activeSlide = CAROUSEL_SLIDES[activeIdx];

  return (
    <section
      ref={sectionRef}
      className="w-full grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] items-center gap-6 sm:gap-10 relative overflow-visible py-4 sm:py-6"
    >
      {/* Background accent glow */}
      <div
        className="absolute w-[60%] h-[60%] rounded-full opacity-[0.08] dark:opacity-[0.14] blur-[80px] pointer-events-none z-0 transition-all duration-1000"
        style={{ background: `radial-gradient(circle, ${activeSlide.accentColor} 0%, transparent 70%)`, top: "-10%", left: "-10%" }}
      />

      {/* ── Column 1: Text content ── */}
      <div className="flex flex-col items-start text-left z-10 w-full select-none order-2 md:order-1">

        {/* Badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`badge-${activeIdx}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border-custom bg-card shadow-hard-sm mb-6"
          >
            <span className="text-xs" role="img">{activeSlide.badgeEmoji}</span>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider" style={{ color: activeSlide.accentColor }}>
              {activeSlide.badgeLabel}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* ── Letter-up headline ── */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={`h1-${activeIdx}`}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="font-serif text-3.5xl sm:text-5xl lg:text-5.5xl text-txt-primary leading-[1.1] tracking-tight mb-5"
            style={{ perspective: "800px" }}
          >
            {/* Prefix — word by word */}
            <span className="block" style={{ perspective: "600px" }}>
              {activeSlide.headlinePrefix.split(" ").map((word, wi) => (
                <motion.span
                  key={`w-${activeIdx}-${wi}`}
                  custom={wi * 0.09}
                  variants={wordVariants}
                  className="inline-block mr-[0.26em]"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {word}
                </motion.span>
              ))}
            </span>

            {/* Accent — char by char */}
            <span className="block" style={{ perspective: "600px" }}>
              {activeSlide.headlineAccent.split("").map((char, ci) => {
                const prefixWords = activeSlide.headlinePrefix.split(" ").length;
                const delay = prefixWords * 0.09 + ci * 0.033;
                return (
                  <motion.span
                    key={`c-${activeIdx}-${ci}`}
                    custom={delay}
                    variants={charVariants}
                    className="inline-block font-serif italic font-normal"
                    style={{
                      color: activeSlide.accentColor,
                      textShadow: `0 0 40px ${activeSlide.accentColor}30`,
                      marginRight: char === " " ? "0.26em" : "0",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                );
              })}
            </span>
          </motion.h1>
        </AnimatePresence>

        {/* Subtext */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`p-${activeIdx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="text-txt-secondary text-sm sm:text-base max-w-[500px] leading-relaxed mb-8 font-medium"
          >
            {activeSlide.subtext}
          </motion.p>
        </AnimatePresence>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 sm:mb-10 w-full sm:w-auto">
          <motion.button
            onClick={() => handlePrimaryCta(activeSlide)}
            whileHover={{ y: -3, boxShadow: `0 12px 30px ${activeSlide.accentColor}45` }}
            whileTap={{ y: 1 }}
            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2 cursor-pointer relative overflow-hidden group w-full sm:w-auto justify-center"
            style={{ background: `linear-gradient(135deg, ${activeSlide.accentColor}, ${activeSlide.accentColor}cc)`, boxShadow: `0 8px 25px ${activeSlide.accentColor}35` }}
          >
            {activeSlide.ctaText}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            onClick={handleSecondaryCta}
            whileHover={{ y: -2 }}
            whileTap={{ y: 1 }}
            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider border border-border-custom bg-card hover:bg-card-hover text-txt-primary cursor-pointer shadow-hard-sm w-full sm:w-auto justify-center flex items-center gap-2"
          >
            <FolderHeart className="w-4 h-4 text-brand-primary" />
            View Saved List
          </motion.button>
        </div>

        {/* Platform selector dots */}
        <div className="flex gap-3 items-center">
          {CAROUSEL_SLIDES.map((slide, idx) => {
            const isActive = idx === activeIdx;
            return (
              <motion.button
                key={slide.id}
                onClick={() => selectSlide(idx)}
                aria-label={`View ${slide.badgeLabel}`}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer"
                style={{
                  background: "var(--bg-card)",
                  border: `1.5px solid ${isActive ? slide.accentColor : "var(--border-color)"}`,
                  boxShadow: isActive
                    ? `0 4px 0 0 ${slide.accentColor}, 0 8px 20px ${slide.accentColor}25`
                    : "0 2px 0 0 var(--border-color)",
                  transform: isActive ? "translateY(-2px)" : "none",
                }}
              >
                <PlatformIcon
                  platform={slide.platform}
                  className={`w-5 h-5 transition-all duration-300 ${isActive ? "" : "opacity-45"}`}
                  colored={true}
                />
                {/* Progress bar */}
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full overflow-hidden"
                  style={{ background: "var(--border-color)", opacity: 0.35 }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-75 ease-linear"
                    style={{ width: `${isActive ? progressPct : 0}%`, background: slide.accentColor }}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>

      </div>

      {/* ── Column 2: 3D Canvas ── */}
      <div
        ref={canvasWrapRef}
        className="relative w-full h-[300px] sm:h-[380px] md:h-[440px] flex items-center justify-center order-1 md:order-2"
        style={{ overflow: "visible" }}
      >
        {/* Glow orb behind model */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${activeSlide.accentColor}18 0%, transparent 68%)`,
            filter: "blur(30px)",
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          style={{ borderRadius: "16px" }}
        />
      </div>
    </section>
  );
});
