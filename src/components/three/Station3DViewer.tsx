import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { getContactShadowTexture } from './proceduralTextures';
import { buildStation3DScene, Station3DParams } from './stationSceneBuilders';
import { Box, Eye, Layers, RotateCcw, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export interface Station3DViewerInputParams extends Omit<Station3DParams, 'stationId'> {
  stationId?: number;
  // Convenient aliases used by individual station components
  motif?: number[][];
  palette?: { fg: string; bg: string; accent?: string };
  liquidColor?: string;
  clothColor?: string;
  isDipped?: boolean;
  pitchDeg?: number;
  isSimulating?: boolean;
  lclElevation?: number;
}

interface Station3DViewerProps {
  stationId: number;
  params: Station3DViewerInputParams;
  onInteract?: (actionId: string) => void;
  title?: string;
  subtitle?: string;
  interactionHint?: string;
  heightClass?: string;
  children?: React.ReactNode; // Optional 2D fallback/schematic view
}

type CameraPreset = 'front' | 'closeup' | 'top' | 'orbit';

const CAMERA_PRESETS: Record<Exclude<CameraPreset, 'orbit'>, { pos: [number, number, number]; target: [number, number, number] }> = {
  front: { pos: [3.2, 2.3, 4.1], target: [0, 0.95, 0] },
  closeup: { pos: [1.65, 1.45, 2.35], target: [0, 1.05, 0] },
  top: { pos: [0.4, 4.8, 1.5], target: [0, 0.7, 0] },
};

function normalizeParams(
  stationId: number,
  raw: Station3DViewerInputParams,
  explodedFactor: number
): Station3DParams {
  return {
    ...raw,
    stationId,
    motifGrid: raw.motifGrid ?? raw.motif,
    bgHex: raw.bgHex ?? raw.palette?.bg,
    fgHex: raw.fgHex ?? raw.palette?.fg,
    dyeHex: raw.dyeHex ?? raw.liquidColor,
    fabricHex: raw.fabricHex ?? raw.clothColor,
    isFabricDipped: raw.isFabricDipped ?? raw.isDipped,
    roofPitch: raw.roofPitch ?? raw.pitchDeg,
    isRunning: raw.isRunning ?? raw.isSimulating,
    explodedFactor,
  };
}

export const Station3DViewer: React.FC<Station3DViewerProps> = ({
  stationId,
  params,
  onInteract,
  title = 'Mô phỏng vật lý 3D chân thực',
  subtitle = 'Xoay 360° • Cuộn để phóng to • Chạm trực tiếp vào vật thể',
  interactionHint,
  heightClass = 'h-[400px] sm:h-[460px]',
  children,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const paramsRef = useRef<Station3DViewerInputParams>(params);
  const onInteractRef = useRef<((actionId: string) => void) | undefined>(onInteract);
  const explodeRef = useRef<number>(0);
  const presetRef = useRef<CameraPreset>('front');
  const isTransitioningCameraRef = useRef<boolean>(false);

  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [activePreset, setActivePreset] = useState<CameraPreset>('front');
  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const [lastInteractionFeedback, setLastInteractionFeedback] = useState<string | null>(null);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    onInteractRef.current = onInteract;
  }, [onInteract]);

  useEffect(() => {
    explodeRef.current = explodeFactor;
  }, [explodeFactor]);

  const handleSelectPreset = (preset: CameraPreset) => {
    setActivePreset(preset);
    presetRef.current = preset;
    if (preset !== 'orbit') {
      isTransitioningCameraRef.current = true;
    }
  };

  const handleResetView = () => {
    setExplodeFactor(0);
    explodeRef.current = 0;
    handleSelectPreset('front');
  };

  useEffect(() => {
    if (viewMode !== '3d') return;
    const container = canvasMountRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 300);

    // 1. Scene & Atmospheric Depth
    const scene = new THREE.Scene();
    const bgColor = new THREE.Color(0x0c1410);
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(0x0c1410, 0.042);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.set(...CAMERA_PRESETS.front.pos);

    // 3. Renderer & Software WebGL Guard
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererInfo = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software/i.test(rendererInfo);

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const maxAnisotropy = isSoftwareGl ? 1 : Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

    container.replaceChildren(renderer.domElement);

    // 4. Studio Environment Map (RoomEnvironment + PMREMGenerator) for PBR Metals & Woods
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.85;

    // 5. Three-Point Studio Lighting Rig (Warm Key, Cool Fill, Rim Backlight)
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x291d12, 0.65);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff3db, 2.6);
    keyLight.position.set(4.5, 6.8, 4.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = isSoftwareGl ? 512 : 1024;
    keyLight.shadow.mapSize.height = isSoftwareGl ? 512 : 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 18;
    const d = 3.2;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x6ee7b7, 1.15);
    rimLight.position.set(-4.2, 3.5, -3.8);
    scene.add(rimLight);

    const warmUnderLight = new THREE.PointLight(0xf59e0b, 0.55, 7);
    warmUnderLight.position.set(0, 0.4, 1.8);
    scene.add(warmUnderLight);

    // 6. Ground Studio Pedestal + Soft Contact Shadow
    const groundGroup = new THREE.Group();
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 4.4),
      new THREE.MeshBasicMaterial({
        map: getContactShadowTexture(),
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.005;
    groundGroup.add(shadowPlane);

    const studioFloor = new THREE.Mesh(
      new THREE.CircleGeometry(6.5, 48),
      new THREE.MeshStandardMaterial({
        color: 0x131e18,
        roughness: 0.88,
        metalness: 0.08,
      })
    );
    studioFloor.rotation.x = -Math.PI / 2;
    studioFloor.receiveShadow = !isSoftwareGl;
    groundGroup.add(studioFloor);

    const subtleRing = new THREE.Mesh(
      new THREE.RingGeometry(2.15, 2.18, 64),
      new THREE.MeshBasicMaterial({
        color: 0x2dd4bf,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
      })
    );
    subtleRing.rotation.x = -Math.PI / 2;
    subtleRing.position.y = 0.01;
    groundGroup.add(subtleRing);
    scene.add(groundGroup);

    // 7. Build Station-Specific 3D Apparatus
    const initialFullParams = normalizeParams(stationId, paramsRef.current, explodeRef.current);
    const stationBuild = buildStation3DScene(stationId, initialFullParams, maxAnisotropy, isSoftwareGl);
    scene.add(stationBuild.root);

    // Capture initial local positions of top-level children for Exploded View
    const basePositions = new Map<THREE.Object3D, THREE.Vector3>();
    stationBuild.root.children.forEach((child: THREE.Object3D, idx: number) => {
      basePositions.set(child, child.position.clone());
      const dir = child.position.clone();
      if (dir.lengthSq() < 0.02) {
        dir.set(
          Math.cos((idx * Math.PI * 2) / Math.max(1, stationBuild.root.children.length)) * 0.45,
          0.25 + idx * 0.14,
          Math.sin((idx * Math.PI * 2) / Math.max(1, stationBuild.root.children.length)) * 0.45
        );
      } else {
        dir.normalize().multiplyScalar(0.55);
        dir.y += 0.18 * (idx % 3);
      }
      child.userData.explodeVector = dir;
    });

    // 8. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minDistance = 1.3;
    controls.maxDistance = 8.5;
    controls.target.set(...CAMERA_PRESETS.front.target);
    controls.update();

    const onControlStart = () => {
      isTransitioningCameraRef.current = false;
      if (presetRef.current === 'orbit') {
        presetRef.current = 'front';
        setActivePreset('front');
      }
    };
    controls.addEventListener('start', onControlStart);

    // 9. Raycaster on Layer 1 for Interactive 3D Parts
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let lastMoveCheck = 0;

    const getHitObject = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(stationBuild.interactables, true);
      if (hits.length === 0) return null;
      let obj: THREE.Object3D | null = hits[0].object;
      while (obj && !obj.userData?.actionId && obj.parent) {
        obj = obj.parent;
      }
      return obj && obj.userData?.actionId ? obj : null;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastMoveCheck < 50) return;
      lastMoveCheck = now;
      const hit = getHitObject(e.clientX, e.clientY);
      if (hit) {
        renderer.domElement.style.cursor = 'pointer';
        setHoverLabel(hit.userData.label || 'Chạm để tương tác');
      } else {
        renderer.domElement.style.cursor = 'grab';
        setHoverLabel(null);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 6) return;
      const hit = getHitObject(e.clientX, e.clientY);
      if (hit && hit.userData?.actionId) {
        const actionId = String(hit.userData.actionId);
        const label = String(hit.userData.label || 'Đã tương tác vật thể 3D');
        setLastInteractionFeedback(label);
        if (onInteractRef.current) {
          onInteractRef.current(actionId);
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // 10. ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(entry.contentRect.width, 260);
        const h = Math.max(entry.contentRect.height, 260);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // 11. Paced Animation Loop (Fence Sync for Software WebGL, rAF for Hardware GPU)
    const gl2 = gl as WebGL2RenderingContext;
    let rafId = 0;
    let timerId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      if (!isSoftwareGl || !gl2.fenceSync) {
        rafId = requestAnimationFrame(cb);
        return;
      }
      const sync = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl2.flush();
      const poll = () => {
        if (disposed || !sync) return;
        const status = gl2.clientWaitSync(sync, 0, 0);
        if (status === gl2.TIMEOUT_EXPIRED) {
          timerId = window.setTimeout(poll, 16);
        } else {
          gl2.deleteSync(sync);
          timerId = window.setTimeout(cb, 0);
        }
      };
      timerId = window.setTimeout(poll, 16);
    };

    let lastTime = performance.now();
    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      const elapsed = now / 1000;
      lastTime = now;

      const targetExplode = explodeRef.current;
      const currentFullParams = normalizeParams(stationId, paramsRef.current, targetExplode);

      // Update station physics & animation
      stationBuild.update(dt, elapsed, currentFullParams);

      // Update Exploded View interpolation for top-level parts
      stationBuild.root.children.forEach((child: THREE.Object3D) => {
        const basePos = basePositions.get(child);
        const offsetVec = child.userData.explodeVector as THREE.Vector3 | undefined;
        if (basePos && offsetVec) {
          const tx = basePos.x + offsetVec.x * targetExplode;
          const ty = basePos.y + offsetVec.y * targetExplode;
          const tz = basePos.z + offsetVec.z * targetExplode;
          child.position.x = THREE.MathUtils.damp(child.position.x, tx, 7, dt);
          child.position.y = THREE.MathUtils.damp(child.position.y, ty, 7, dt);
          child.position.z = THREE.MathUtils.damp(child.position.z, tz, 7, dt);
        }
      });

      // Camera Preset Smooth Transition or Auto-Orbit
      const currentPreset = presetRef.current;
      if (currentPreset === 'orbit') {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.6;
      } else {
        controls.autoRotate = false;
        if (isTransitioningCameraRef.current) {
          const targetCam = CAMERA_PRESETS[currentPreset];
          camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCam.pos[0], 5, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCam.pos[1], 5, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCam.pos[2], 5, dt);
          controls.target.x = THREE.MathUtils.damp(controls.target.x, targetCam.target[0], 5, dt);
          controls.target.y = THREE.MathUtils.damp(controls.target.y, targetCam.target[1], 5, dt);
          controls.target.z = THREE.MathUtils.damp(controls.target.z, targetCam.target[2], 5, dt);

          const dist = Math.hypot(
            camera.position.x - targetCam.pos[0],
            camera.position.y - targetCam.pos[1],
            camera.position.z - targetCam.pos[2]
          );
          if (dist < 0.03) {
            isTransitioningCameraRef.current = false;
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);
      afterDraw(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.dispose();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      stationBuild.dispose();
      pmremGenerator.dispose();
      envTexture.dispose();
      renderer.dispose();
    };
  }, [stationId, viewMode]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-stone-800 bg-[#0c1410] shadow-xl">
      {/* Top Floating Header Bar (Solid high-contrast surface, zero backdrop-filter over WebGL) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#121d17] border-b border-stone-800/90 z-10 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                {title}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                PBR 3D Studio
              </span>
            </div>
            <p className="text-[11px] text-stone-400 hidden sm:block">{subtitle}</p>
          </div>
        </div>

        {/* Switch between 3D Physical Model and 2D Diagram (if provided) */}
        <div className="flex items-center gap-1.5">
          {children && (
            <div className="inline-flex rounded-lg bg-stone-900 p-0.5 border border-stone-700/80">
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  viewMode === '3d'
                    ? 'bg-emerald-700 text-white'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Mô hình 3D
              </button>
              <button
                type="button"
                onClick={() => setViewMode('2d')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  viewMode === '2d'
                    ? 'bg-emerald-700 text-white'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Sơ đồ 2D
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Viewport Area */}
      {viewMode === '3d' ? (
        <div className={`relative w-full ${heightClass}`}>
          {/* Dedicated empty mount div for Three.js WebGLRenderer */}
          <div ref={canvasMountRef} className="w-full h-full select-none" />

          {/* Interactive Hover / Click Callout Overlay */}
          <div className="pointer-events-none absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
            {hoverLabel ? (
              <div className="px-3 py-1.5 rounded-lg bg-[#16261e] border border-emerald-500/60 text-emerald-200 text-xs font-semibold shadow-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Nhấn chuột: {hoverLabel}</span>
              </div>
            ) : interactionHint ? (
              <div className="px-3 py-1.5 rounded-lg bg-[#121c17]/95 border border-stone-700/80 text-stone-300 text-xs font-medium shadow">
                💡 {interactionHint}
              </div>
            ) : <div />}

            {lastInteractionFeedback && (
              <div className="px-2.5 py-1 rounded-lg bg-amber-950/95 border border-amber-600/60 text-amber-200 text-xs font-medium">
                Tương tác: {lastInteractionFeedback}
              </div>
            )}
          </div>

          {/* Collapsible Bottom Control Dock */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-col items-center pointer-events-none">
            <div className="pointer-events-auto w-full max-w-2xl rounded-xl bg-[#121c17]/95 border border-stone-700/90 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-stone-800/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  Điều khiển góc nhìn & cấu trúc 3D
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetView}
                    className="text-[11px] text-stone-300 hover:text-emerald-300 flex items-center gap-1 px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 transition-colors"
                    title="Đặt lại góc nhìn"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Đặt lại</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDockCollapsed((prev) => !prev)}
                    className="text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 px-2 py-0.5 rounded bg-stone-800/90"
                  >
                    {dockCollapsed ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Hiện điều khiển 3D</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>Ẩn</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {!dockCollapsed && (
                <div className="p-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  {/* Camera Presets */}
                  <div className="sm:col-span-7 flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'front', label: 'Góc chính' },
                        { id: 'closeup', label: 'Cận cảnh' },
                        { id: 'top', label: 'Trên cao' },
                        { id: 'orbit', label: 'Tự xoay 360°' },
                      ] as { id: CameraPreset; label: string }[]
                    ).map((cam) => (
                      <button
                        key={cam.id}
                        type="button"
                        onClick={() => handleSelectPreset(cam.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                          activePreset === cam.id
                            ? 'bg-emerald-700 text-white border-emerald-500'
                            : 'bg-stone-900 text-stone-300 border-stone-700 hover:bg-stone-800'
                        }`}
                      >
                        {cam.label}
                      </button>
                    ))}
                  </div>

                  {/* Exploded View Slider */}
                  <div className="sm:col-span-5 flex items-center gap-2 bg-stone-900/90 px-2.5 py-1.5 rounded-lg border border-stone-800">
                    <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] font-medium text-stone-300 whitespace-nowrap">
                      Tách lớp:
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={explodeFactor}
                      onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
                    />
                    <span className="text-[11px] font-mono text-amber-300 w-8 text-right">
                      {Math.round(explodeFactor * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-stone-950">{children}</div>
      )}
    </div>
  );
};
