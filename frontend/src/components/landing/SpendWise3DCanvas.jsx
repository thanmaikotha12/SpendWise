import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * SpendWise Cinematic 3D Canvas
 * Faithful to Reference Image 2:
 * - Radiant, polished 24k gold with brilliant specular highlights and reflective bevels
 * - Real Studio Environment Map (PMREM) with 2.8x HDR-intensity reflections
 * - High-relief bump-mapped coin face with concentric precision minting & embossed serif monogram
 * - Glowing specular edge ring producing razor-sharp golden rim gleams
 * - Crystal-clear refractive glass savings jar with warm internal golden light transmission
 * - Glossy reflective obsidian pedestal top mirroring the coin above
 * - Stepped emerald-marble and mirror-gold budget podiums with gleaming coin stacks
 * - Subtle, calm, delicate golden motes and twinkling star sparkles (supporting ambiance)
 * - Cinematic studio lighting with warm golden key and subtle emerald-green rim reflections
 */
export default function SpendWise3DCanvas({ scrollProgress = 0, mousePos = { x: 0, y: 0 } }) {
  const mountRef = useRef(null);
  const targetRef = useRef(scrollProgress);
  const mouseRef = useRef(mousePos);

  useEffect(() => {
    targetRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    mouseRef.current = mousePos;
  }, [mousePos]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to CSS', e);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.38;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 11);

    // ==========================================
    // 1. PROCEDURAL STUDIO ENVIRONMENT MAP (PMREM)
    // High-contrast luxury studio lighting creates brilliant specular bevel reflections
    // ==========================================
    function createStudioEnvMap(glRenderer) {
      const pmrem = new THREE.PMREMGenerator(glRenderer);
      pmrem.compileEquirectangularShader();

      const envCanvas = document.createElement('canvas');
      envCanvas.width = 1024;
      envCanvas.height = 512;
      const ctx = envCanvas.getContext('2d');

      // Deep dark forest-green & obsidian gradient
      const bg = ctx.createLinearGradient(0, 0, 0, 512);
      bg.addColorStop(0, '#020704');
      bg.addColorStop(0.3, '#010402');
      bg.addColorStop(0.5, '#030d07');
      bg.addColorStop(0.7, '#010302');
      bg.addColorStop(1, '#041208');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1024, 512);

      // Studio Light 1: Overhead Intense Warm Golden Softbox (Zenith)
      const g1 = ctx.createRadialGradient(512, 60, 5, 512, 60, 240);
      g1.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      g1.addColorStop(0.2, 'rgba(255, 248, 220, 0.98)');
      g1.addColorStop(0.5, 'rgba(255, 218, 120, 0.85)');
      g1.addColorStop(0.8, 'rgba(200, 145, 30, 0.35)');
      g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.arc(512, 60, 240, 0, Math.PI * 2);
      ctx.fill();

      // Studio Light 2: Equatorial Continuous Specular Rim Light (Horizon Bevels)
      // This produces razor-sharp metallic gleam lines on all circular rims and bevels
      const hGrad = ctx.createLinearGradient(0, 244, 0, 268);
      hGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      hGrad.addColorStop(0.5, 'rgba(255, 250, 235, 0.95)');
      hGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, 244, 1024, 24);

      // Studio Light 3: Key Vertical Champagne-Gold Softbox (Right rim reflection)
      const g2 = ctx.createRadialGradient(780, 210, 15, 780, 210, 220);
      g2.addColorStop(0, 'rgba(255, 245, 205, 0.98)');
      g2.addColorStop(0.35, 'rgba(255, 210, 95, 0.85)');
      g2.addColorStop(0.7, 'rgba(180, 120, 25, 0.3)');
      g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.ellipse(780, 210, 120, 200, 0, 0, Math.PI * 2);
      ctx.fill();

      // Studio Light 4: Emerald-Green Rim Glow Softbox (Left rim reflection)
      const g3 = ctx.createRadialGradient(240, 220, 15, 240, 220, 240);
      g3.addColorStop(0, 'rgba(52, 211, 153, 0.95)');
      g3.addColorStop(0.4, 'rgba(16, 185, 129, 0.65)');
      g3.addColorStop(0.75, 'rgba(5, 100, 70, 0.25)');
      g3.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g3;
      ctx.beginPath();
      ctx.ellipse(240, 220, 110, 210, 0, 0, Math.PI * 2);
      ctx.fill();

      // Studio Light 5: Direct Front Specular Catch Light
      const g4 = ctx.createRadialGradient(512, 210, 10, 512, 210, 100);
      g4.addColorStop(0, 'rgba(255, 255, 250, 0.95)');
      g4.addColorStop(0.4, 'rgba(255, 235, 170, 0.5)');
      g4.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g4;
      ctx.beginPath();
      ctx.arc(512, 210, 100, 0, Math.PI * 2);
      ctx.fill();

      const envTexture = new THREE.CanvasTexture(envCanvas);
      envTexture.mapping = THREE.EquirectangularReflectionMapping;
      const envRenderTarget = pmrem.fromEquirectangular(envTexture);
      pmrem.dispose();
      envTexture.dispose();

      return envRenderTarget.texture;
    }

    const studioEnv = createStudioEnvMap(renderer);
    scene.environment = studioEnv;

    // ==========================================
    // 2. HIGH-RELIEF COIN DIFFUSE, BUMP & ROUGHNESS TEXTURES
    // Reeded milled edge, concentric precision minting & embossed currency monogram
    // ==========================================
    function createCoinTextures() {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const cx = size / 2;
      const cy = size / 2;

      // 1. Outer Reeded Milled Edge Notches (120 precision serrations around perimeter)
      ctx.save();
      ctx.translate(cx, cy);
      const numTeeth = 120;
      for (let i = 0; i < numTeeth; i++) {
        ctx.rotate((Math.PI * 2) / numTeeth);
        ctx.fillStyle = i % 2 === 0 ? '#ffea9e' : '#8c580c';
        ctx.fillRect(-2, 482, 4, 28);
      }
      ctx.restore();

      // 2. Smooth, Rich Gold Metallic Face (Rich 24k amber-gold field matching Reference Image 2)
      const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 470);
      radGrad.addColorStop(0, '#f5be42');    // Luminous warm amber gold (eliminates pale/white washout)
      radGrad.addColorStop(0.25, '#e5a425'); // Deep warm gold body
      radGrad.addColorStop(0.55, '#c88212'); // Rich amber gold field
      radGrad.addColorStop(0.78, '#df9e26'); // Subtle reflective sheen
      radGrad.addColorStop(0.92, '#884c04'); // Recessed chamfer shadow
      radGrad.addColorStop(1, '#cb8a1e');    // Rim inner edge
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 482, 0, Math.PI * 2);
      ctx.fill();

      // 3. Outer Double Beveled Lip & Mirror Rings
      // Ring 1: Polished warm gold outer specular lip
      ctx.strokeStyle = '#ffeaa6';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(cx, cy, 470, 0, Math.PI * 2);
      ctx.stroke();

      // Ring 2: Recessed dark chamfer
      ctx.strokeStyle = '#4a2600';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, 456, 0, Math.PI * 2);
      ctx.stroke();

      // Ring 3: Inner metallic highlight bevel
      ctx.strokeStyle = '#f8d270';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(cx, cy, 446, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Embossed Currency Symbol '$' with Crisp 3D Bevel Relief
      ctx.save();
      // Drop shadow for 3D physical elevation
      ctx.shadowColor = 'rgba(28, 12, 0, 0.95)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 14;

      ctx.font = 'bold 430px "Cinzel", "Playfair Display", Georgia, "Times New Roman", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Deep recessed bevel shadow outline
      ctx.strokeStyle = '#4e2402';
      ctx.lineWidth = 14;
      ctx.strokeText('$', cx, cy + 6);

      // Vertical continuous currency spine integrated into $
      ctx.fillStyle = '#4e2402';
      ctx.fillRect(cx - 11, cy - 235, 22, 470);

      // Bevel highlight edge (upper-left light reflection)
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#fff2be';
      ctx.lineWidth = 5;
      ctx.strokeText('$', cx - 3, cy + 2);

      // Rich 24k Gold Surface Fill Gradient (warm amber tones matching Reference Image 2)
      const goldSymGrad = ctx.createLinearGradient(0, cy - 240, 0, cy + 240);
      goldSymGrad.addColorStop(0, '#fff4cc');    // Subtle specular highlight on top crown
      goldSymGrad.addColorStop(0.18, '#f7cd5e'); // Upper loop rich warm gold
      goldSymGrad.addColorStop(0.5, '#e49f24');  // Central waist deep gold
      goldSymGrad.addColorStop(0.8, '#c88012');  // Lower loop rich amber gold
      goldSymGrad.addColorStop(1, '#9b5806');    // Bottom bevel shadow
      ctx.fillStyle = goldSymGrad;
      ctx.fillText('$', cx, cy + 6);
      ctx.fillRect(cx - 11, cy - 235, 22, 470);
      ctx.restore();

      const diffuseTex = new THREE.CanvasTexture(canvas);
      diffuseTex.needsUpdate = true;

      // 5. Bump Heightmap (Smooth face with raised $ symbol and outer bevels)
      const bumpCanvas = document.createElement('canvas');
      bumpCanvas.width = size;
      bumpCanvas.height = size;
      const bCtx = bumpCanvas.getContext('2d');

      // Base smooth height level
      bCtx.fillStyle = '#808080';
      bCtx.fillRect(0, 0, size, size);

      // Reeded edge notches in bump map
      bCtx.save();
      bCtx.translate(cx, cy);
      for (let i = 0; i < numTeeth; i++) {
        bCtx.rotate((Math.PI * 2) / numTeeth);
        bCtx.fillStyle = i % 2 === 0 ? '#b8b8b8' : '#505050';
        bCtx.fillRect(-2, 482, 4, 28);
      }
      bCtx.restore();

      // Beveled outer rings in bump map
      bCtx.strokeStyle = '#f0f0f0';
      bCtx.lineWidth = 18;
      bCtx.beginPath();
      bCtx.arc(cx, cy, 470, 0, Math.PI * 2);
      bCtx.stroke();

      bCtx.strokeStyle = '#181818';
      bCtx.lineWidth = 12;
      bCtx.beginPath();
      bCtx.arc(cx, cy, 456, 0, Math.PI * 2);
      bCtx.stroke();

      // Raised Dollar Sign '$' in Bump with drop-shadow ledge for genuine 3D relief
      bCtx.font = 'bold 430px "Cinzel", "Playfair Display", Georgia, "Times New Roman", serif';
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';

      // Drop-shadow recessed ledge in bump map
      bCtx.fillStyle = '#101010';
      bCtx.fillText('$', cx + 8, cy + 18);
      bCtx.fillRect(cx - 3, cy - 223, 22, 470);

      // Raised crest for $ and continuous vertical spine
      bCtx.fillStyle = '#ffffff';
      bCtx.fillText('$', cx, cy + 6);
      bCtx.fillRect(cx - 11, cy - 235, 22, 470);

      const bumpTex = new THREE.CanvasTexture(bumpCanvas);
      bumpTex.needsUpdate = true;

      // 6. Roughness Map (Smooth metallic field with mirror-smooth crests)
      const roughCanvas = document.createElement('canvas');
      roughCanvas.width = size;
      roughCanvas.height = size;
      const rCtx = roughCanvas.getContext('2d');

      // Base smooth gold metallic roughness (~0.08)
      rCtx.fillStyle = '#141414';
      rCtx.fillRect(0, 0, size, size);

      // Mirror-smooth outer bevel (~0.02)
      rCtx.strokeStyle = '#040404';
      rCtx.lineWidth = 20;
      rCtx.beginPath();
      rCtx.arc(cx, cy, 470, 0, Math.PI * 2);
      rCtx.stroke();

      // Mirror-smooth crest (~0.02) for $
      rCtx.font = 'bold 430px "Cinzel", "Playfair Display", Georgia, "Times New Roman", serif';
      rCtx.textAlign = 'center';
      rCtx.textBaseline = 'middle';
      rCtx.fillStyle = '#040404';
      rCtx.fillText('$', cx, cy + 6);
      rCtx.fillRect(cx - 11, cy - 235, 22, 470);

      const roughTex = new THREE.CanvasTexture(roughCanvas);
      roughTex.needsUpdate = true;

      return { diffuseTex, bumpTex, roughTex };
    }

    const { diffuseTex: coinDiffuse, bumpTex: coinBump, roughTex: coinRoughness } = createCoinTextures();

    // 4-Point Golden Star Sparkle Glint Sprite (Jewelry-grade gleam on coin rim)
    function createStarSparkleTexture() {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const x = c.getContext('2d');
      const cx = 64;
      const cy = 64;

      // Center glowing core
      const rad = x.createRadialGradient(cx, cy, 2, cx, cy, 60);
      rad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      rad.addColorStop(0.18, 'rgba(255, 238, 170, 0.9)');
      rad.addColorStop(0.45, 'rgba(255, 195, 60, 0.4)');
      rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      x.fillStyle = rad;
      x.beginPath();
      x.arc(cx, cy, 60, 0, Math.PI * 2);
      x.fill();

      // Horizontal ray
      const hGrad = x.createLinearGradient(0, cy, 128, cy);
      hGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      hGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
      hGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      x.fillStyle = hGrad;
      x.fillRect(0, cy - 3, 128, 6);

      // Vertical ray
      const vGrad = x.createLinearGradient(cx, 0, cx, 128);
      vGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      vGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
      vGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      x.fillStyle = vGrad;
      x.fillRect(cx - 3, 0, 6, 128);

      const t = new THREE.CanvasTexture(c);
      t.needsUpdate = true;
      return t;
    }

    const sparkleTexture = createStarSparkleTexture();

    // ==========================================
    // 3. CINEMATIC LIGHTING & SPECULAR GLEAMS
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0x0a1c12, 1.4);
    scene.add(ambientLight);

    // Main warm golden key light
    const keyLight = new THREE.DirectionalLight(0xfff5e0, 5.2);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    // Deep emerald-green rim light (Left side)
    const emeraldRim = new THREE.DirectionalLight(0x10b981, 3.4);
    emeraldRim.position.set(-6, 2, -3);
    scene.add(emeraldRim);

    // Specular golden rim light (sharp edge reflections)
    const goldRim = new THREE.DirectionalLight(0xffe088, 4.4);
    goldRim.position.set(0, 8, -2);
    scene.add(goldRim);

    // Front Specular Fill
    const frontFill = new THREE.DirectionalLight(0xfffae6, 2.6);
    frontFill.position.set(0, 1, 8);
    scene.add(frontFill);

    // Dynamic Specular Light Sweep Spotlight
    const sweepSpot = new THREE.SpotLight(0xffffff, 7.0, 22, Math.PI / 4, 0.45, 1.2);
    sweepSpot.position.set(3, 5, 5);
    sweepSpot.target.position.set(0, 0, 0);
    scene.add(sweepSpot);
    scene.add(sweepSpot.target);

    // Local emerald glow point light
    const emeraldPoint = new THREE.PointLight(0x10b981, 1.5, 14);
    emeraldPoint.position.set(0, -1, 3);
    scene.add(emeraldPoint);

    // ==========================================
    // 4. PHOTOREALISTIC SHINY MATERIALS (MeshPhysicalMaterial)
    // envMapIntensity: 3.2 - 3.5 makes gold mirror-polished and radiant
    // ==========================================
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: 0xf6d579,
      metalness: 0.99,
      roughness: 0.07,
      clearcoat: 0.95,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
      envMapIntensity: 3.2,
    });

    const polishedGoldMat = new THREE.MeshPhysicalMaterial({
      color: 0xffe9a4,
      metalness: 1.0,
      roughness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 1.0,
      envMapIntensity: 3.5,
    });

    const coinFaceMat = new THREE.MeshPhysicalMaterial({
      map: coinDiffuse,
      bumpMap: coinBump,
      bumpScale: 0.06,
      roughnessMap: coinRoughness,
      metalness: 0.98,
      roughness: 0.08,
      clearcoat: 0.95,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
      envMapIntensity: 3.2,
    });

    const coinMaterials = [
      goldMat,     // side
      coinFaceMat, // top face
      coinFaceMat, // bottom face
    ];

    // Pedestal Base: Dark emerald marble
    const emeraldMarbleMat = new THREE.MeshPhysicalMaterial({
      color: 0x03140c,
      metalness: 0.35,
      roughness: 0.14,
      clearcoat: 0.9,
      clearcoatRoughness: 0.04,
      envMapIntensity: 2.6,
    });

    // Pedestal Top Platform: Glossy Obsidian Mirror reflecting coin
    const obsidianMirrorMat = new THREE.MeshPhysicalMaterial({
      color: 0x050c07,
      metalness: 0.95,
      roughness: 0.025,
      clearcoat: 1.0,
      clearcoatRoughness: 0.015,
      reflectivity: 1.0,
      envMapIntensity: 3.2,
    });

    const titaniumPedestalMat = new THREE.MeshPhysicalMaterial({
      color: 0x0e1711,
      metalness: 0.9,
      roughness: 0.12,
      clearcoat: 0.8,
      envMapIntensity: 2.6,
    });

    // Crystal Clear Photorealistic Glass Material for Jar
    const jarGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.03,
      roughness: 0.015,
      transmission: 0.98,
      ior: 1.54,
      transparent: true,
      opacity: 1.0,
      thickness: 1.1,
      attenuationColor: new THREE.Color(0xffeed0),
      attenuationDistance: 1.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 1.0,
      envMapIntensity: 3.2,
    });

    const cardGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x06110a,
      metalness: 0.4,
      roughness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.92,
      clearcoat: 0.7,
      envMapIntensity: 2.2,
    });

    const glowingEmeraldMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.75,
      roughness: 0.1,
      metalness: 0.3,
      clearcoat: 0.85,
      envMapIntensity: 2.2,
    });

    // Soft Volumetric Overhead Light Cone Texture
    function createBeamTexture() {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 256;
      const x = c.getContext('2d');
      const g = x.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, 'rgba(255, 240, 180, 0)');
      g.addColorStop(0.25, 'rgba(255, 235, 160, 0.45)');
      g.addColorStop(0.7, 'rgba(255, 215, 110, 0.55)');
      g.addColorStop(1, 'rgba(255, 215, 110, 0)');
      x.fillStyle = g;
      x.fillRect(0, 0, 128, 256);
      const t = new THREE.CanvasTexture(c);
      t.needsUpdate = true;
      return t;
    }
    const beamTexture = createBeamTexture();

    // ==========================================
    // 5. STAGES AND SCENE GROUPS
    // ==========================================

    // --- STAGE 1: HERO COIN & TIERED PEDESTAL ---
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    // Soft Atmospheric Volumetric Overhead Light Beam
    const beamGeo = new THREE.CylinderGeometry(1.2, 3.4, 9.5, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      map: beamTexture,
      color: 0xffe28a,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.set(0, 1.8, 0);
    heroGroup.add(beamMesh);

    // Multi-tiered Pedestal (Slightly reduced for balanced composition)
    // Tier 1: Dark emerald marble base
    const pedTier1Geo = new THREE.CylinderGeometry(2.35, 2.65, 0.40, 64);
    const pedTier1 = new THREE.Mesh(pedTier1Geo, emeraldMarbleMat);
    pedTier1.position.set(0, -2.52, 0);
    heroGroup.add(pedTier1);

    // Tier 1 Polished Gold Rim
    const pedRim1Geo = new THREE.TorusGeometry(2.37, 0.045, 16, 64);
    const pedRim1 = new THREE.Mesh(pedRim1Geo, polishedGoldMat);
    pedRim1.rotation.x = Math.PI / 2;
    pedRim1.position.set(0, -2.32, 0);
    heroGroup.add(pedRim1);

    // Tier 2: Titanium step
    const pedTier2Geo = new THREE.CylinderGeometry(1.88, 2.02, 0.32, 64);
    const pedTier2 = new THREE.Mesh(pedTier2Geo, titaniumPedestalMat);
    pedTier2.position.set(0, -2.16, 0);
    heroGroup.add(pedTier2);

    // Tier 2 Polished Gold Top Ring
    const pedRim2Geo = new THREE.TorusGeometry(1.90, 0.04, 16, 64);
    const pedRim2 = new THREE.Mesh(pedRim2Geo, polishedGoldMat);
    pedRim2.rotation.x = Math.PI / 2;
    pedRim2.position.set(0, -2.00, 0);
    heroGroup.add(pedRim2);

    // Tier 3: Glossy Obsidian Mirror Platform (Reflects gold coin)
    const pedDiscGeo = new THREE.CylinderGeometry(1.62, 1.62, 0.08, 64);
    const pedDisc = new THREE.Mesh(pedDiscGeo, obsidianMirrorMat);
    pedDisc.position.set(0, -1.94, 0);
    heroGroup.add(pedDisc);

    // Golden Reflection Disc on top of Obsidian Mirror
    const pedReflectGeo = new THREE.CircleGeometry(1.22, 32);
    const pedReflectMat = new THREE.MeshBasicMaterial({
      color: 0xffd266,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const pedReflectionDisc = new THREE.Mesh(pedReflectGeo, pedReflectMat);
    pedReflectionDisc.rotation.x = -Math.PI / 2;
    pedReflectionDisc.position.set(0, -1.895, 0);
    heroGroup.add(pedReflectionDisc);

    // Main Hero Golden Coin (Radiant 24k Gold)
    const coinGeo = new THREE.CylinderGeometry(1.65, 1.65, 0.28, 64);
    const mainCoinMesh = new THREE.Mesh(coinGeo, coinMaterials);
    mainCoinMesh.rotation.x = Math.PI / 2;
    mainCoinMesh.position.set(0, 0.1, 0);
    heroGroup.add(mainCoinMesh);

    // Mirror-polished beveled outer rim
    const coinBevelGeo = new THREE.TorusGeometry(1.64, 0.06, 24, 64);
    const coinBevel = new THREE.Mesh(coinBevelGeo, polishedGoldMat);
    coinBevel.rotation.x = Math.PI / 2;
    mainCoinMesh.add(coinBevel);

    // Razor-Sharp Specular Edge Gleam Halo Ring
    const auraRingGeo = new THREE.TorusGeometry(1.68, 0.015, 16, 64);
    const auraRingMat = new THREE.MeshBasicMaterial({
      color: 0xfff0b8,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const auraRing = new THREE.Mesh(auraRingGeo, auraRingMat);
    auraRing.rotation.x = Math.PI / 2;
    mainCoinMesh.add(auraRing);

    // 4-Point Star Sparkle Glint on Coin Rim
    const coinSparkleMat = new THREE.SpriteMaterial({
      map: sparkleTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const coinSparkle = new THREE.Sprite(coinSparkleMat);
    coinSparkle.position.set(1.24, 1.12, 0.18);
    coinSparkle.scale.set(0.65, 0.65, 1);
    mainCoinMesh.add(coinSparkle);

    // --- STAGE 2: EXPLODED EXPENSE OBJECTS ---
    const expenseGroup = new THREE.Group();
    scene.add(expenseGroup);
    expenseGroup.visible = false;

    // Center coin in Stage 2
    const stage2CenterCoin = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, 0.22, 48),
      coinMaterials
    );
    stage2CenterCoin.rotation.x = Math.PI / 2;
    expenseGroup.add(stage2CenterCoin);

    // Orbiting Miniature Objects:
    // 1. Miniature Green Shopping Bag with golden handles
    const bagGroup = new THREE.Group();
    const bagBodyGeo = new THREE.BoxGeometry(0.85, 1.05, 0.5);
    const bagMat = new THREE.MeshPhysicalMaterial({
      color: 0x14532d,
      roughness: 0.25,
      metalness: 0.2,
      clearcoat: 0.5,
      envMapIntensity: 2.0,
    });
    const bagMesh = new THREE.Mesh(bagBodyGeo, bagMat);
    bagGroup.add(bagMesh);

    const handleCurve = new THREE.TorusGeometry(0.24, 0.035, 16, 32, Math.PI);
    const handleMesh1 = new THREE.Mesh(handleCurve, polishedGoldMat);
    handleMesh1.position.set(0, 0.52, 0.12);
    bagGroup.add(handleMesh1);
    const handleMesh2 = new THREE.Mesh(handleCurve, polishedGoldMat);
    handleMesh2.position.set(0, 0.52, -0.12);
    bagGroup.add(handleMesh2);
    expenseGroup.add(bagGroup);

    // 2. Realistic 3D Miniature Burger / Food
    const burgerGroup = new THREE.Group();
    const bunTopGeo = new THREE.SphereGeometry(0.48, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const bunMat = new THREE.MeshPhysicalMaterial({ color: 0xd9822b, roughness: 0.35, clearcoat: 0.3 });
    const bunTop = new THREE.Mesh(bunTopGeo, bunMat);
    bunTop.position.y = 0.15;
    burgerGroup.add(bunTop);

    const pattyGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.14, 24);
    const pattyMat = new THREE.MeshStandardMaterial({ color: 0x4a2810, roughness: 0.6 });
    const patty = new THREE.Mesh(pattyGeo, pattyMat);
    patty.position.y = 0.04;
    burgerGroup.add(patty);

    const lettuceGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.06, 24);
    const lettuceMat = new THREE.MeshPhysicalMaterial({ color: 0x22c55e, roughness: 0.3, clearcoat: 0.4 });
    const lettuce = new THREE.Mesh(lettuceGeo, lettuceMat);
    lettuce.position.y = 0.12;
    burgerGroup.add(lettuce);

    const bunBottomGeo = new THREE.CylinderGeometry(0.46, 0.44, 0.14, 24);
    const bunBottom = new THREE.Mesh(bunBottomGeo, bunMat);
    bunBottom.position.y = -0.09;
    burgerGroup.add(bunBottom);
    expenseGroup.add(burgerGroup);

    // 3. Miniature Golden Transport Vehicle / Car
    const carGroup = new THREE.Group();
    const carBodyGeo = new THREE.BoxGeometry(1.1, 0.36, 0.65);
    const carMesh = new THREE.Mesh(carBodyGeo, polishedGoldMat);
    carGroup.add(carMesh);

    const carCabinGeo = new THREE.BoxGeometry(0.6, 0.3, 0.55);
    const carCabin = new THREE.Mesh(carCabinGeo, titaniumPedestalMat);
    carCabin.position.set(-0.08, 0.3, 0);
    carGroup.add(carCabin);
    expenseGroup.add(carGroup);

    // 4. Miniature Receipt Scrolls
    const receiptGroup = new THREE.Group();
    const receiptPlaneGeo = new THREE.PlaneGeometry(0.8, 1.3, 16, 16);
    const posAttr = receiptPlaneGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const y = posAttr.getY(i);
      posAttr.setZ(i, Math.sin(y * 3) * 0.12);
    }
    receiptPlaneGeo.computeVertexNormals();

    const receiptMat = new THREE.MeshPhysicalMaterial({
      color: 0xfbfbf8,
      roughness: 0.28,
      clearcoat: 0.3,
      side: THREE.DoubleSide,
    });
    const receiptMesh = new THREE.Mesh(receiptPlaneGeo, receiptMat);
    receiptGroup.add(receiptMesh);
    expenseGroup.add(receiptGroup);

    // 5. Small floating coins in Stage 2
    const stage2OrbitCoins = [];
    for (let i = 0; i < 5; i++) {
      const ocGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 24);
      const oc = new THREE.Mesh(ocGeo, coinMaterials);
      oc.rotation.x = Math.PI / 2 + (Math.random() - 0.5);
      expenseGroup.add(oc);
      stage2OrbitCoins.push(oc);
    }

    // --- STAGE 3: GLASS SAVINGS JAR WITH POURING COINS ---
    const jarGroup = new THREE.Group();
    scene.add(jarGroup);
    jarGroup.visible = false;

    // Mossy / Emerald Stone Plinth Base (Proportionally refined)
    const jarPlinthGeo = new THREE.CylinderGeometry(1.42, 1.62, 0.40, 48);
    const jarPlinth = new THREE.Mesh(jarPlinthGeo, emeraldMarbleMat);
    jarPlinth.position.set(0, -2.1, 0);
    jarGroup.add(jarPlinth);

    // Detailed Lathe Glass Jar Profile (Subtly reduced ~15% for balanced scene framing)
    const jarProfile = [];
    jarProfile.push(new THREE.Vector2(0, -1.45));
    jarProfile.push(new THREE.Vector2(1.08, -1.45));
    jarProfile.push(new THREE.Vector2(1.22, -1.32));
    jarProfile.push(new THREE.Vector2(1.25, 0.52));
    jarProfile.push(new THREE.Vector2(1.12, 0.95));
    jarProfile.push(new THREE.Vector2(0.82, 1.12));
    jarProfile.push(new THREE.Vector2(0.82, 1.34));
    jarProfile.push(new THREE.Vector2(0.94, 1.42));
    jarProfile.push(new THREE.Vector2(0.88, 1.48));
    jarProfile.push(new THREE.Vector2(0.76, 1.38));
    jarProfile.push(new THREE.Vector2(0.76, 1.15));
    jarProfile.push(new THREE.Vector2(1.05, 0.85));
    jarProfile.push(new THREE.Vector2(1.12, -1.22));
    jarProfile.push(new THREE.Vector2(0, -1.28));

    const jarGeo = new THREE.LatheGeometry(jarProfile, 48);
    const jarMesh = new THREE.Mesh(jarGeo, jarGlassMat);
    jarGroup.add(jarMesh);

    // Warm internal light inside the jar reflecting through glass
    const jarInnerLight = new THREE.PointLight(0xffdf88, 5.2, 8, 1.2);
    jarInnerLight.position.set(0, -0.35, 0);
    jarGroup.add(jarInnerLight);

    // Dedicated materials for the central jar coin (transparent + depthWrite eliminates transmission ghosting/stretching)
    const jarCoinSideMat = new THREE.MeshPhysicalMaterial({
      color: 0xf5be42,
      metalness: 0.98,
      roughness: 0.08,
      clearcoat: 0.95,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
      envMapIntensity: 3.2,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
    });

    const jarCoinFaceMat = new THREE.MeshPhysicalMaterial({
      map: coinDiffuse,
      bumpMap: coinBump,
      bumpScale: 0.06,
      roughnessMap: coinRoughness,
      metalness: 0.98,
      roughness: 0.08,
      clearcoat: 0.95,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
      envMapIntensity: 3.2,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
    });

    const jarCoinMaterials = [
      jarCoinSideMat, // side
      jarCoinFaceMat, // top face
      jarCoinFaceMat, // bottom face
    ];

    // Single, clean, solid circular 3D gold coin inside the savings jar (Zero duplicates or intersecting rings)
    const jarCoinAnchor = new THREE.Group();
    jarCoinAnchor.position.set(0, 0.02, 0.05);
    jarGroup.add(jarCoinAnchor);

    const insideFrontCoinGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.08, 64);
    const insideFrontCoin = new THREE.Mesh(insideFrontCoinGeo, jarCoinMaterials);
    insideFrontCoin.rotation.x = Math.PI / 2; // Upright orientation identical to hero coin
    insideFrontCoin.renderOrder = 1;
    jarCoinAnchor.add(insideFrontCoin);

    // Coins piled inside the base of jar
    for (let i = 0; i < 7; i++) {
      const ic = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.07, 24),
        goldMat
      );
      ic.position.set(
        (Math.sin(i * 1.8) * 0.48),
        -1.15 + (i * 0.07),
        (Math.cos(i * 1.8) * 0.48)
      );
      ic.rotation.set(0.2 * Math.sin(i), Math.random(), 0.2 * Math.cos(i));
      jarGroup.add(ic);
    }

    // Cascading Stream of Coins pouring into Jar from top right
    const pouringCoins = [];
    for (let i = 0; i < 11; i++) {
      const pc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.36, 0.07, 24),
        polishedGoldMat
      );
      jarGroup.add(pc);
      pouringCoins.push(pc);
    }

    // Floating Aspiration Icons above Jar (Balanced proportions, no text clipping):
    // A. Miniature House (Terracotta / Gold)
    const houseGroup = new THREE.Group();
    const houseBaseGeo = new THREE.BoxGeometry(0.52, 0.40, 0.44);
    const houseBase = new THREE.Mesh(
      houseBaseGeo,
      new THREE.MeshPhysicalMaterial({ color: 0xdfba76, roughness: 0.18, clearcoat: 0.6, envMapIntensity: 2.2 })
    );
    houseGroup.add(houseBase);

    const roofGeo = new THREE.ConeGeometry(0.50, 0.34, 4);
    const roof = new THREE.Mesh(
      roofGeo,
      new THREE.MeshPhysicalMaterial({ color: 0xb45309, roughness: 0.25, clearcoat: 0.5 })
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 0.36;
    houseGroup.add(roof);
    jarGroup.add(houseGroup);

    // B. Miniature Golden Airplane
    const planeGroup = new THREE.Group();
    const fuselageGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.88, 16);
    const fuselage = new THREE.Mesh(fuselageGeo, polishedGoldMat);
    fuselage.rotation.z = Math.PI / 2;
    planeGroup.add(fuselage);

    const wingGeo = new THREE.BoxGeometry(0.24, 0.025, 0.98);
    const wing = new THREE.Mesh(wingGeo, polishedGoldMat);
    planeGroup.add(wing);

    const tailGeo = new THREE.BoxGeometry(0.16, 0.20, 0.035);
    const tail = new THREE.Mesh(tailGeo, polishedGoldMat);
    tail.position.set(-0.36, 0.12, 0);
    planeGroup.add(tail);
    jarGroup.add(planeGroup);

    // C. Miniature Open Book
    const bookGroup = new THREE.Group();
    const pageLGeo = new THREE.PlaneGeometry(0.34, 0.46);
    const pageL = new THREE.Mesh(pageLGeo, receiptMat);
    pageL.rotation.y = 0.35;
    bookGroup.add(pageL);

    const pageR = new THREE.Mesh(pageLGeo, receiptMat);
    pageR.rotation.y = -0.35;
    bookGroup.add(pageR);
    jarGroup.add(bookGroup);

    // D. Miniature Pink / Gold Heart
    const heartGroup = new THREE.Group();
    const heartMat = new THREE.MeshPhysicalMaterial({ color: 0xf43f5e, roughness: 0.15, clearcoat: 0.8 });
    const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), heartMat);
    s1.position.set(-0.12, 0.10, 0);
    heartGroup.add(s1);
    const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), heartMat);
    s2.position.set(0.12, 0.10, 0);
    heartGroup.add(s2);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.44, 16), heartMat);
    cone.rotation.z = Math.PI;
    cone.position.set(0, -0.12, 0);
    heartGroup.add(cone);
    jarGroup.add(heartGroup);

    // --- STAGE 4: BUDGET CONTROL ROOM PODIUMS & ASCENDING ARROW ---
    const budgetGroup = new THREE.Group();
    scene.add(budgetGroup);
    budgetGroup.visible = false;

    // Stepped Emerald & Gold Pillars
    const budgetPillars = [];
    const pillarHeights = [1.2, 1.8, 2.5, 3.4];
    const pillarPositions = [-1.8, -0.6, 0.6, 1.8];

    pillarPositions.forEach((posX, idx) => {
      const h = pillarHeights[idx];
      const pGeo = new THREE.CylinderGeometry(0.48, 0.54, h, 32);
      const pMesh = new THREE.Mesh(pGeo, idx === 3 ? goldMat : emeraldMarbleMat);
      pMesh.position.set(posX, -2.1 + h / 2, 0);

      // Gold top collar
      const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.49, 0.045, 16, 32),
        polishedGoldMat
      );
      collar.rotation.x = Math.PI / 2;
      collar.position.set(0, h / 2, 0);
      pMesh.add(collar);

      budgetGroup.add(pMesh);
      budgetPillars.push(pMesh);
    });

    // Stacks of Gold Coins on Pillars
    for (let i = 0; i < 4; i++) {
      const stack = new THREE.Group();
      for (let j = 0; j < 3; j++) {
        const coin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.38, 0.07, 24),
          goldMat
        );
        coin.position.y = j * 0.07;
        stack.add(coin);
      }
      stack.position.set(pillarPositions[i], -2.1 + pillarHeights[i] + 0.05, 0);
      budgetGroup.add(stack);
    }

    // Ascending Dynamic Golden 3D Arrow Sweeping across Pillars
    const arrowCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.2, -1.2, 0.6),
      new THREE.Vector3(-1.0, -0.4, 0.8),
      new THREE.Vector3(0.5, 0.6, 0.9),
      new THREE.Vector3(2.0, 1.8, 0.7),
    ]);
    const arrowTubeGeo = new THREE.TubeGeometry(arrowCurve, 40, 0.09, 16, false);
    const arrowTube = new THREE.Mesh(arrowTubeGeo, polishedGoldMat);
    budgetGroup.add(arrowTube);

    const arrowHeadGeo = new THREE.ConeGeometry(0.24, 0.6, 16);
    const arrowHead = new THREE.Mesh(arrowHeadGeo, polishedGoldMat);
    arrowHead.position.set(2.0, 1.8, 0.7);
    arrowHead.rotation.z = -Math.PI / 4;
    budgetGroup.add(arrowHead);

    // Floating Glass Budget Cards
    const bCard1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.06), cardGlassMat);
    bCard1.position.set(-1.8, 1.4, 0.5);
    budgetGroup.add(bCard1);

    const bCard2 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.0, 0.06), cardGlassMat);
    bCard2.position.set(0.8, 2.0, 0.3);
    budgetGroup.add(bCard2);

    // --- STAGE 5: SMARTER INSIGHTS WITH AI AVATAR & ANALYTICS ---
    const aiGroup = new THREE.Group();
    scene.add(aiGroup);
    aiGroup.visible = false;

    // A. AI Avatar Head
    const aiAvatar = new THREE.Group();
    aiGroup.add(aiAvatar);

    // Deep Emerald Glass Visor Dome
    const visorGeo = new THREE.SphereGeometry(1.1, 48, 48);
    const visorMesh = new THREE.Mesh(visorGeo, glowingEmeraldMat);
    aiAvatar.add(visorMesh);

    // Digital Happy Eye Arcs (`◠ ‿ ◠`)
    const eyeCurveL = new THREE.TorusGeometry(0.22, 0.04, 16, 24, Math.PI);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xc6f6d5 });
    const eyeL = new THREE.Mesh(eyeCurveL, eyeMat);
    eyeL.position.set(-0.35, 0.12, 1.02);
    aiAvatar.add(eyeL);

    const eyeR = new THREE.Mesh(eyeCurveL, eyeMat);
    eyeR.position.set(0.35, 0.12, 1.02);
    aiAvatar.add(eyeR);

    // Champagne-Gold Metallic Headphone Ear Fixtures
    const earGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.28, 24);
    const earL = new THREE.Mesh(earGeo, polishedGoldMat);
    earL.rotation.z = Math.PI / 2;
    earL.position.set(-1.18, 0, 0);
    aiAvatar.add(earL);

    const earR = new THREE.Mesh(earGeo, polishedGoldMat);
    earR.rotation.z = Math.PI / 2;
    earR.position.set(1.18, 0, 0);
    aiAvatar.add(earR);

    // Halo Golden Ring Glowing Behind Head
    const haloGeo = new THREE.TorusGeometry(1.5, 0.035, 16, 64);
    const haloMesh = new THREE.Mesh(haloGeo, polishedGoldMat);
    haloMesh.rotation.x = Math.PI / 6;
    haloMesh.position.set(0, 0.1, -0.4);
    aiAvatar.add(haloMesh);

    // B. Floating 3D Analytics Glass Cards
    const chartCard1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.4, 0.05), cardGlassMat);
    chartCard1.position.set(-2.2, 0.8, -0.5);
    aiGroup.add(chartCard1);

    const chartCard2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 0.05), cardGlassMat);
    chartCard2.position.set(2.2, 0.6, -0.4);
    aiGroup.add(chartCard2);

    // ==========================================
    // 6. DELICATE GOLDEN PARTICLES & SPARKLES
    // Subtle, calm, supporting ambiance inspired by Image 2
    // ==========================================
    function createGlowSprite() {
      const c = document.createElement('canvas');
      c.width = 32;
      c.height = 32;
      const x = c.getContext('2d');
      const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, 'rgba(255, 245, 210, 1)');
      g.addColorStop(0.3, 'rgba(255, 215, 110, 0.7)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      x.fillStyle = g;
      x.beginPath();
      x.arc(16, 16, 16, 0, Math.PI * 2);
      x.fill();
      const t = new THREE.CanvasTexture(c);
      t.needsUpdate = true;
      return t;
    }

    const glowTexture = createGlowSprite();

    // 160 fine golden motes drifting gently (not spinning wildly)
    const moteCount = 160;
    const moteGeo = new THREE.BufferGeometry();
    const motePos = new Float32Array(moteCount * 3);
    const moteVel = new Float32Array(moteCount * 3);

    for (let i = 0; i < moteCount * 3; i += 3) {
      motePos[i] = (Math.random() - 0.5) * 16;
      motePos[i + 1] = (Math.random() - 0.5) * 14;
      motePos[i + 2] = (Math.random() - 0.5) * 10;
      moteVel[i + 1] = 0.0015 + Math.random() * 0.002;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));

    const moteMat = new THREE.PointsMaterial({
      size: 0.18,
      map: glowTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const moteSystem = new THREE.Points(moteGeo, moteMat);
    scene.add(moteSystem);

    // ==========================================
    // 7. ANIMATION LOOP & SCROLL CHOREOGRAPHY
    // ==========================================
    let smoothProgress = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;
    let animationFrameId;

    const animate = (time) => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth progress & mouse interpolation
      const targetP = targetRef.current;
      smoothProgress += (targetP - smoothProgress) * 0.075;
      smoothMouseX += (mouseRef.current.x - smoothMouseX) * 0.05;
      smoothMouseY += (mouseRef.current.y - smoothMouseY) * 0.05;

      // Mouse Parallax on camera
      camera.position.x = smoothMouseX * 0.85;
      camera.position.y = -smoothMouseY * 0.65;
      camera.lookAt(0, 0, 0);

      // Dynamic Specular Light Sweep (sweeps softly across the coin face)
      sweepSpot.position.x = 2 + Math.cos(time * 0.001) * 3;
      sweepSpot.position.y = 5 + Math.sin(time * 0.0012) * 1.5;

      // Aura ring subtle breath
      auraRingMat.opacity = 0.45 + Math.sin(time * 0.003) * 0.15;

      // Sparkle glint on coin rim pulse
      coinSparkle.scale.setScalar(0.55 + Math.sin(time * 0.003) * 0.15);
      coinSparkleMat.opacity = 0.75 + Math.sin(time * 0.003) * 0.2;

      // Obsidian platform mirror reflection shimmer
      pedReflectionDisc.scale.setScalar(1.0 + Math.sin(time * 0.0015) * 0.05);

      // Gentle upward drift of subtle motes
      const mPositions = moteGeo.attributes.position.array;
      for (let i = 0; i < moteCount * 3; i += 3) {
        mPositions[i + 1] += moteVel[i + 1];
        if (mPositions[i + 1] > 8) mPositions[i + 1] = -8;
      }
      moteGeo.attributes.position.needsUpdate = true;

      // SCROLL-DRIVEN SCENE CHOREOGRAPHY
      const p = smoothProgress;

      // --- SCENE 1: HERO COIN (0.0 to 0.20) ---
      if (p < 0.22) {
        heroGroup.visible = true;
        const subP = Math.min(1, p / 0.16);

        mainCoinMesh.rotation.y = time * 0.0008 + subP * 1.5;
        mainCoinMesh.position.y = 0.1 + Math.sin(time * 0.0015) * 0.08;

        heroGroup.position.set(0, -subP * 0.6, -subP * 2.2);
        const fade = Math.max(0.001, 1 - Math.max(0, (p - 0.12) * 8));
        heroGroup.scale.setScalar(fade);
      } else {
        heroGroup.visible = false;
      }

      // --- SCENE 2: TRACK EVERY EXPENSE (0.15 to 0.38) ---
      if (p >= 0.14 && p < 0.40) {
        expenseGroup.visible = true;
        const subP = (p - 0.14) / 0.24;
        const separation = Math.sin(subP * Math.PI) * 3.6;

        stage2CenterCoin.rotation.y = time * 0.0007;

        // 1. Shopping Bag
        bagGroup.position.set(-1.8 - separation * 0.45, 1.2 + separation * 0.25, separation * 0.2);
        bagGroup.rotation.set(0.2, time * 0.0008, 0.1);

        // 2. Burger
        burgerGroup.position.set(2.0 + separation * 0.4, 1.4 + separation * 0.2, -separation * 0.1);
        burgerGroup.rotation.set(time * 0.001, 0.4 + subP * 2, 0);

        // 3. Golden Car
        carGroup.position.set(1.9 + separation * 0.45, -1.2 - separation * 0.2, separation * 0.1);
        carGroup.rotation.set(0.3, time * 0.0007, 0.2);

        // 4. Receipt Scroll
        receiptGroup.position.set(-1.9 - separation * 0.4, -1.0 - separation * 0.25, -separation * 0.15);
        receiptGroup.rotation.set(-0.3, time * 0.0006, 0.2);

        // 5. Orbiting coins
        stage2OrbitCoins.forEach((oc, i) => {
          const angle = time * 0.0008 + i * 1.26;
          const rad = 2.2 + separation * 0.3;
          oc.position.set(Math.cos(angle) * rad, Math.sin(angle * 1.5) * 0.8, Math.sin(angle) * rad);
          oc.rotation.y += 0.01;
        });

        const fade = Math.sin(subP * Math.PI);
        expenseGroup.scale.setScalar(Math.max(0.001, fade * 1.1));
      } else {
        expenseGroup.visible = false;
      }

      // --- SCENE 3: BUILD YOUR SAVINGS (0.34 to 0.58) ---
      if (p >= 0.33 && p < 0.60) {
        jarGroup.visible = true;
        const subP = (p - 0.33) / 0.25;
        const appear = Math.sin(subP * Math.PI);

        jarGroup.scale.setScalar(Math.max(0.001, appear * 0.96));
        jarGroup.position.set(0, -0.2, 0);
        jarMesh.rotation.y = time * 0.0005;

        jarCoinAnchor.rotation.y = Math.sin(time * 0.0012) * 0.16;
        jarCoinAnchor.rotation.x = -0.06;

        // Cascading coin stream entering jar mouth gracefully
        pouringCoins.forEach((pc, idx) => {
          const streamP = Math.max(0, Math.min(1, subP * 2.0 - idx * 0.09));
          const t = streamP;
          pc.position.x = 1.7 * (1 - t) + 0.08 * t + Math.sin(idx * 2) * 0.08;
          pc.position.y = 2.6 * (1 - t) + 0.9 * t + Math.sin(time * 0.002 + idx) * 0.04;
          pc.position.z = 0.4 * (1 - t);
          pc.rotation.z += 0.02;
          pc.rotation.x += 0.015;
        });

        // Floating Aspiration Models (Adjusted to avoid any text or border clipping)
        houseGroup.position.set(-1.45, 1.9 + Math.sin(time * 0.002) * 0.10, 0);
        houseGroup.rotation.y = time * 0.0008;

        planeGroup.position.set(1.25, 2.15 + Math.sin(time * 0.0018 + 1) * 0.12, 0);
        planeGroup.rotation.y = Math.PI / 4 + Math.sin(time * 0.001) * 0.2;

        bookGroup.position.set(-1.40, 0.95 + Math.sin(time * 0.0022 + 2) * 0.08, 0);
        bookGroup.rotation.y = 0.4 + time * 0.0006;

        heartGroup.position.set(1.40, 1.10 + Math.sin(time * 0.002 + 3) * 0.10, 0);
        heartGroup.rotation.y = -0.3 + Math.sin(time * 0.0015) * 0.2;

        emeraldPoint.intensity = appear * 3.5;
        jarInnerLight.intensity = appear * 4.5;
      } else {
        jarGroup.visible = false;
      }

      // --- SCENE 4: BUDGET CONTROL ROOM (0.54 to 0.76) ---
      if (p >= 0.52 && p < 0.78) {
        budgetGroup.visible = true;
        const subP = (p - 0.52) / 0.24;
        const appear = Math.sin(subP * Math.PI);

        budgetGroup.scale.setScalar(Math.max(0.001, appear * 1.1));
        budgetGroup.rotation.y = (subP - 0.5) * 0.6 + Math.sin(time * 0.0004) * 0.15;
        budgetGroup.position.set(0, 0, 0);

        budgetPillars.forEach((pillar, idx) => {
          pillar.position.y = -2.1 + (pillarHeights[idx] / 2) * Math.min(1, subP * 1.6);
        });

        bCard1.position.y = 1.4 + Math.sin(time * 0.0018) * 0.1;
        bCard2.position.y = 2.0 + Math.sin(time * 0.0016 + 1) * 0.1;
      } else {
        budgetGroup.visible = false;
      }

      // --- SCENE 5: SMARTER INSIGHTS WITH AI (0.72 to 0.94) ---
      if (p >= 0.70 && p < 0.95) {
        aiGroup.visible = true;
        const subP = (p - 0.70) / 0.23;
        const appear = Math.sin(subP * Math.PI);

        aiGroup.scale.setScalar(Math.max(0.001, appear * 1.15));
        aiGroup.position.set(0, 0.2, 0);

        aiAvatar.position.y = Math.sin(time * 0.002) * 0.12;
        aiAvatar.rotation.y = smoothMouseX * 0.35 + Math.sin(time * 0.001) * 0.1;

        haloMesh.rotation.z = time * 0.0012;

        chartCard1.position.y = 0.8 + Math.sin(time * 0.0015 + 2) * 0.1;
        chartCard2.position.y = 0.6 + Math.sin(time * 0.0017 + 1) * 0.1;
      } else {
        aiGroup.visible = false;
      }

      // --- SCENE 6 / 7: FINALE & AUTH (0.90 to 1.0) ---
      if (p >= 0.88) {
        const subP = (p - 0.88) / 0.12;
        camera.position.z = 11 + subP * 1.2;
      } else {
        camera.position.z = 11;
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
      coinDiffuse.dispose();
      coinBump.dispose();
      coinRoughness.dispose();
      sparkleTexture.dispose();
      beamTexture.dispose();
      glowTexture.dispose();
      studioEnv.dispose();
    };
  }, []); 

  return (
    <div
      ref={mountRef}
      className="spendwise-3d-viewport"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  );
}
