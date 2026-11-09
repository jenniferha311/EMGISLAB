import * as THREE from 'three';
import {
  getBronzeTexture,
  getBambooTexture,
  getPalmThatchTexture,
  createBrocadeTexture,
} from './proceduralTextures';

export interface Station3DParams {
  stationId: number;
  // Shared numeric parameters
  param1?: number;
  param2?: number;
  param3?: number;
  selectMode?: string;
  isRunning?: boolean;
  // Station 01 Gong specific
  strikeZone?: 'ron' | 'than' | 'vanh';
  malletType?: 'soft' | 'hard';
  isVibrating?: boolean;
  // Station 02 Brocade specific
  motifGrid?: number[][];
  bgHex?: string;
  fgHex?: string;
  // Station 03 Stilt house specific
  floorHeight?: number;
  roofPitch?: number;
  ventOpening?: number;
  roofMaterial?: string;
  // Station 06 Dyeing specific
  dyeHex?: string;
  fabricHex?: string;
  isFabricDipped?: boolean;
  dipsCount?: number;
  bathTemp?: number;
  // Station 07 Flute specific
  tubeLengthCm?: number;
  tubeDiameterMm?: number;
  holes?: boolean[];
  fundamentalFreq?: number;
  // Station 14 Men La specific
  menLaStep?: 'step1' | 'step2' | 'step3';
  isSealed?: boolean;
  microscopeView?: boolean;
  microscopeZoom?: 'mold' | 'yeast';
  temperature?: number;
  // Station 16 Roof specific
  thatchThicknessCm?: number;
  weatherMode?: 'light' | 'heavy' | 'storm';
  // Tam Dao (99) specific
  tamDaoModule?: 'elevation' | 'foehn' | 'orographic_rain' | 'adaptive_house';
  targetElevation?: number;
  // Exploded view factor (0 = assembled, 1 = exploded)
  explodedFactor?: number;
}

export interface SceneController {
  root: THREE.Group;
  interactables: THREE.Object3D[];
  update: (dt: number, elapsed: number, params: Station3DParams) => void;
  dispose: () => void;
}

// Pre-allocated math helpers for zero GC in render loop
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

function markClickable(obj: THREE.Object3D, actionId: string, label: string) {
  obj.layers.enable(1);
  obj.userData.actionId = actionId;
  obj.userData.label = label;
  obj.traverse((child) => {
    child.layers.enable(1);
    child.userData.actionId = actionId;
    child.userData.label = label;
  });
}

function enableShadows(group: THREE.Object3D) {
  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

/**
 * Builds the multi-part 3D model and animation controller for any station
 */
export function buildStation3DScene(
  stationId: number,
  initialParams: Station3DParams,
  maxAnisotropy: number,
  isSoftwareGl: boolean
): SceneController {
  const root = new THREE.Group();
  const interactables: THREE.Object3D[] = [];
  const disposables: Array<{ dispose: () => void }> = [];

  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const bambooTex = getBambooTexture('aged', maxAnisotropy);
  const freshBambooTex = getBambooTexture('fresh', maxAnisotropy);
  const bronzeTex = getBronzeTexture(maxAnisotropy);
  const thatchTex = getPalmThatchTexture(maxAnisotropy);

  // Common shared materials with distinct roughness/metalness contrast
  const woodMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x5c3a1e,
      roughness: 0.78,
      metalness: 0.05,
    })
  );
  const bambooMat = track(
    new THREE.MeshStandardMaterial({
      map: bambooTex,
      roughness: 0.52,
      metalness: 0.08,
    })
  );
  const freshBambooMat = track(
    new THREE.MeshStandardMaterial({
      map: freshBambooTex,
      roughness: 0.42,
      metalness: 0.08,
    })
  );
  const ropeMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xc29b56,
      roughness: 0.88,
      metalness: 0.02,
    })
  );

  let customUpdate: (dt: number, elapsed: number, p: Station3DParams) => void = () => {};

  // =========================================================================
  // STATION 01: CHIÊNG MƯỜNG (Bossed Bronze Gong on Carved Wooden Frame)
  // =========================================================================
  if (stationId === 1) {
    // 1. Carved Wooden Frame (Khung giá treo chiêng bằng gỗ chạm khắc - 5 parts)
    const frameGroup = new THREE.Group();
    const postGeo = track(new THREE.CylinderGeometry(0.09, 0.12, 3.2, 16));
    const leftPost = new THREE.Mesh(postGeo, woodMat);
    leftPost.position.set(-1.35, 1.6, 0);
    const rightPost = new THREE.Mesh(postGeo, woodMat);
    rightPost.position.set(1.35, 1.6, 0);

    // Crossbeam with curved horn ends
    const beamGeo = track(new THREE.CylinderGeometry(0.1, 0.1, 3.3, 16));
    beamGeo.rotateZ(Math.PI / 2);
    const topBeam = new THREE.Mesh(beamGeo, woodMat);
    topBeam.position.set(0, 3.05, 0);

    // Foot pedestals
    const baseGeo = track(new THREE.BoxGeometry(0.45, 0.16, 0.9));
    const leftBase = new THREE.Mesh(baseGeo, woodMat);
    leftBase.position.set(-1.35, 0.08, 0);
    const rightBase = new THREE.Mesh(baseGeo, woodMat);
    rightBase.position.set(1.35, 0.08, 0);

    frameGroup.add(leftPost, rightPost, topBeam, leftBase, rightBase);
    root.add(frameGroup);

    // 2. Braided Hanging Cords
    const cordGeo = track(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 8));
    const leftCord = new THREE.Mesh(cordGeo, ropeMat);
    leftCord.position.set(-0.45, 2.65, 0);
    leftCord.rotation.z = -0.18;
    const rightCord = new THREE.Mesh(cordGeo, ropeMat);
    rightCord.position.set(0.45, 2.65, 0);
    rightCord.rotation.z = 0.18;
    root.add(leftCord, rightCord);

    // 3. Multi-Zone Bronze Bossed Gong (Chiêng núm đồng - 3 interactive zones)
    const gongGroup = new THREE.Group();
    gongGroup.position.set(0, 1.75, 0);

    const bronzeRimMat = track(
      new THREE.MeshPhysicalMaterial({
        map: bronzeTex,
        color: 0xd4a349,
        metalness: 0.92,
        roughness: 0.28,
        anisotropy: 0.75,
        clearcoat: 0.25,
      })
    );
    const bronzeFaceMat = track(
      new THREE.MeshPhysicalMaterial({
        map: bronzeTex,
        color: 0xe5b95c,
        metalness: 0.94,
        roughness: 0.2,
        anisotropy: 0.85,
        clearcoat: 0.35,
      })
    );
    const bronzeBossMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0xfbe08e,
        metalness: 0.97,
        roughness: 0.12,
        clearcoat: 0.5,
      })
    );

    // Zone 1: Vành chiêng (Turned outer lip + outer ring)
    const rimPoints = [
      new THREE.Vector2(0.75, 0.04),
      new THREE.Vector2(1.02, 0.04),
      new THREE.Vector2(1.06, 0.0),
      new THREE.Vector2(1.02, -0.26),
      new THREE.Vector2(0.98, -0.26),
    ];
    const rimGeo = track(new THREE.LatheGeometry(rimPoints, 64));
    rimGeo.rotateX(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeo, bronzeRimMat);
    markClickable(rimMesh, 'strike:vanh', 'Vành chiêng (Âm sắc đanh, giàu họa âm cao)');
    interactables.push(rimMesh);

    // Zone 2: Thân chiêng (Flat resonant disk)
    const faceGeo = track(new THREE.CylinderGeometry(0.75, 0.75, 0.05, 64));
    faceGeo.rotateX(Math.PI / 2);
    const faceMesh = new THREE.Mesh(faceGeo, bronzeFaceMat);
    faceMesh.position.z = 0.02;
    markClickable(faceMesh, 'strike:than', 'Thân chiêng (Hòa âm cân bằng)');
    interactables.push(faceMesh);

    // Zone 3: Rốn / Núm chiêng (Central raised hemispherical boss)
    const bossGeo = track(new THREE.SphereGeometry(0.24, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.55));
    bossGeo.rotateX(Math.PI / 2);
    const bossMesh = new THREE.Mesh(bossGeo, bronzeBossMat);
    bossMesh.position.z = 0.03;
    markClickable(bossMesh, 'strike:ron', 'Rốn chiêng (Âm trầm ngân vang sâu)');
    interactables.push(bossMesh);

    gongGroup.add(rimMesh, faceMesh, bossMesh);
    root.add(gongGroup);

    // 4. Acoustic Wave Rings (Sóng âm lan tỏa 3D)
    const waveRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const rGeo = track(new THREE.RingGeometry(0.25, 0.29, 64));
      const rMat = track(
        new THREE.MeshBasicMaterial({
          color: 0xf7df94,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.position.set(0, 1.75, 0.14);
      root.add(rMesh);
      waveRings.push(rMesh);
    }

    // 5. Striker Mallet (Dùi chiêng bọc vải thổ cẩm)
    const malletGroup = new THREE.Group();
    const handleGeo = track(new THREE.CylinderGeometry(0.035, 0.045, 0.95, 16));
    const handleMesh = new THREE.Mesh(handleGeo, bambooMat);
    handleMesh.position.y = -0.35;
    const headGeo = track(new THREE.SphereGeometry(0.14, 32, 24));
    headGeo.scale(1, 0.85, 1.15);
    const headMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xa94438,
        roughness: 0.85,
        metalness: 0.05,
      })
    );
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 0.16;
    malletGroup.add(handleMesh, headMesh);
    malletGroup.position.set(0.35, 1.55, 0.65);
    malletGroup.rotation.x = -0.5;
    root.add(malletGroup);

    let vibIntensity = 0;
    let prevVib = false;

    customUpdate = (dt, elapsed, p) => {
      if (p.isVibrating && !prevVib) {
        vibIntensity = 1.0;
      }
      prevVib = Boolean(p.isVibrating);
      vibIntensity = THREE.MathUtils.damp(vibIntensity, p.isVibrating ? 0.65 : 0, 3.2, dt);

      // Update mallet head fabric vs bare wood
      headMat.color.setHex(p.malletType === 'hard' ? 0x78350f : 0xa94438);
      headMat.roughness = p.malletType === 'hard' ? 0.45 : 0.88;

      // Position mallet toward selected strike zone
      const targetX = p.strikeZone === 'vanh' ? 0.85 : p.strikeZone === 'than' ? 0.48 : 0.0;
      const targetZ = vibIntensity > 0.45 ? 0.22 : 0.62;
      malletGroup.position.x = THREE.MathUtils.damp(malletGroup.position.x, targetX + 0.15, 10, dt);
      malletGroup.position.z = THREE.MathUtils.damp(malletGroup.position.z, targetZ, 14, dt);
      malletGroup.rotation.x = THREE.MathUtils.damp(
        malletGroup.rotation.x,
        vibIntensity > 0.45 ? -1.15 : -0.45,
        14,
        dt
      );

      // Gong physical oscillation & exploded view separation
      const exp = p.explodedFactor || 0;
      bossMesh.position.z = THREE.MathUtils.damp(bossMesh.position.z, 0.03 + exp * 0.55, 8, dt);
      faceMesh.position.z = THREE.MathUtils.damp(faceMesh.position.z, 0.02 + exp * 0.25, 8, dt);

      gongGroup.rotation.y = Math.sin(elapsed * 28) * 0.035 * vibIntensity;
      gongGroup.rotation.x = Math.cos(elapsed * 22) * 0.025 * vibIntensity;
      const scalePulse = 1 + Math.sin(elapsed * 45) * 0.012 * vibIntensity;
      gongGroup.scale.set(scalePulse, scalePulse, 1);

      // Animate expanding acoustic rings
      waveRings.forEach((ring, idx) => {
        const mat = ring.material as THREE.MeshBasicMaterial;
        if (vibIntensity > 0.04) {
          const cycle = (elapsed * 1.8 + idx * 0.33) % 1;
          const s = 1 + cycle * 4.2;
          ring.scale.set(s, s, 1);
          ring.position.z = 0.12 + cycle * 0.8;
          mat.opacity = (1 - cycle) * vibIntensity * 0.65;
        } else {
          mat.opacity = 0;
        }
      });
    };
  }

  // =========================================================================
  // STATION 02: THỔ CẨM MƯỜNG (3D Wooden Loom & Dynamic Brocade Scroll)
  // =========================================================================
  else if (stationId === 2) {
    const loomGroup = new THREE.Group();

    // 4-post angled wooden loom frame
    const postGeo = track(new THREE.BoxGeometry(0.12, 2.4, 0.12));
    [-1.25, 1.25].forEach((x) => {
      const pFront = new THREE.Mesh(postGeo, woodMat);
      pFront.position.set(x, 1.2, 0.55);
      pFront.rotation.x = -0.15;
      const pBack = new THREE.Mesh(postGeo, woodMat);
      pBack.position.set(x, 1.35, -0.65);
      pBack.rotation.x = 0.1;
      loomGroup.add(pFront, pBack);
    });

    // Warp beam & cloth roller (Trục cuốn vải)
    const rollerGeo = track(new THREE.CylinderGeometry(0.11, 0.11, 2.7, 24));
    rollerGeo.rotateZ(Math.PI / 2);
    const topRoller = new THREE.Mesh(rollerGeo, bambooMat);
    topRoller.position.set(0, 2.15, -0.45);
    const bottomRoller = new THREE.Mesh(rollerGeo, bambooMat);
    bottomRoller.position.set(0, 0.75, 0.55);
    loomGroup.add(topRoller, bottomRoller);

    // Woven Brocade Cloth Banner stretched between rollers
    const brocadeTex = track(
      createBrocadeTexture(
        initialParams.bgHex || '#1e1b4b',
        initialParams.fgHex || '#f43f5e',
        initialParams.motifGrid,
        maxAnisotropy
      )
    );
    const clothGeo = track(new THREE.PlaneGeometry(2.1, 1.75, 32, 32));
    const clothMat = track(
      new THREE.MeshPhysicalMaterial({
        map: brocadeTex,
        roughness: 0.72,
        metalness: 0.05,
        sheen: 0.9,
        sheenRoughness: 0.4,
        sheenColor: new THREE.Color(0xf7df94),
        side: THREE.DoubleSide,
      })
    );
    const clothMesh = new THREE.Mesh(clothGeo, clothMat);
    clothMesh.position.set(0, 1.45, 0.05);
    clothMesh.rotation.x = -0.62;
    loomGroup.add(clothMesh);

    // Wooden Shuttle (Con thoi dệt)
    const shuttleGeo = track(new THREE.CapsuleGeometry(0.055, 0.42, 8, 16));
    shuttleGeo.rotateZ(Math.PI / 2);
    const shuttleMesh = new THREE.Mesh(shuttleGeo, bambooMat);
    shuttleMesh.position.set(0, 1.35, 0.25);
    loomGroup.add(shuttleMesh);

    root.add(loomGroup);

    let lastPaletteSignature = '';
    customUpdate = (dt, elapsed, p) => {
      const sig = `${p.bgHex || '#1e1b4b'}_${p.fgHex || '#f43f5e'}_${JSON.stringify(p.motifGrid || [])}`;
      if (sig !== lastPaletteSignature) {
        lastPaletteSignature = sig;
        const newTex = createBrocadeTexture(
          p.bgHex || '#1e1b4b',
          p.fgHex || '#f43f5e',
          p.motifGrid,
          maxAnisotropy
        );
        if (clothMat.map) clothMat.map.dispose();
        clothMat.map = newTex;
        clothMat.needsUpdate = true;
      }

      // Shuttle weaving motion
      shuttleMesh.position.x = Math.sin(elapsed * 2.2) * 0.85;
      const exp = p.explodedFactor || 0;
      clothMesh.position.z = THREE.MathUtils.damp(clothMesh.position.z, 0.05 + exp * 0.45, 6, dt);
    };
  }

  // =========================================================================
  // STATION 03 & STATION 16: NHÀ SÀN MƯỜNG & MÁI LÁ CỌ THOÁT NƯỚC
  // =========================================================================
  else if (stationId === 3 || stationId === 16) {
    const houseGroup = new THREE.Group();

    // 1. 6 Wooden Stilt Columns (Cột nhà sàn gỗ nghiến)
    const pillars: THREE.Mesh[] = [];
    const pillarGeo = track(new THREE.CylinderGeometry(0.08, 0.095, 1.0, 16));
    pillarGeo.translate(0, 0.5, 0); // bottom-center pivot
    [-1.3, 0, 1.3].forEach((x) => {
      [-0.75, 0.75].forEach((z) => {
        const col = new THREE.Mesh(pillarGeo, woodMat);
        col.position.set(x, 0, z);
        houseGroup.add(col);
        pillars.push(col);
      });
    });

    // 2. Elevated Bamboo & Timber Floor Deck (Sàn nhà)
    const floorGroup = new THREE.Group();
    const deckGeo = track(new THREE.BoxGeometry(3.1, 0.1, 1.9));
    const deckMesh = new THREE.Mesh(deckGeo, bambooMat);
    floorGroup.add(deckMesh);

    // Wooden Walls with Ventilation Windows
    const wallMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x7c522b,
        roughness: 0.75,
      })
    );
    const backWall = new THREE.Mesh(track(new THREE.BoxGeometry(2.8, 0.95, 0.06)), wallMat);
    backWall.position.set(0, 0.52, -0.82);
    const frontWall = new THREE.Mesh(track(new THREE.BoxGeometry(2.8, 0.45, 0.06)), wallMat);
    frontWall.position.set(0, 0.27, 0.82);
    floorGroup.add(backWall, frontWall);
    houseGroup.add(floorGroup);

    // 3. Pitched Roof Assembly (Hai mái dốc lợp lá cọ / tôn)
    const roofGroup = new THREE.Group();
    const slopeGeo = track(new THREE.BoxGeometry(3.4, 0.12, 1.55));
    slopeGeo.translate(0, 0, 0.775); // hinge at ridge apex

    const roofMat = track(
      new THREE.MeshStandardMaterial({
        map: thatchTex,
        color: 0x9c723c,
        roughness: 0.88,
        metalness: 0.05,
      })
    );

    const frontSlope = new THREE.Mesh(slopeGeo, roofMat);
    const backSlope = new THREE.Mesh(slopeGeo, roofMat);
    backSlope.rotation.y = Math.PI;
    roofGroup.add(frontSlope, backSlope);
    houseGroup.add(roofGroup);

    // 4. Split-Bamboo Gutter & Earthenware Rainwater Vat (Máng tre & Chum hứng nước)
    const gutterGeo = track(new THREE.CylinderGeometry(0.06, 0.06, 3.4, 16, 1, false, 0, Math.PI));
    gutterGeo.rotateZ(Math.PI / 2);
    gutterGeo.rotateX(Math.PI);
    const gutterMesh = new THREE.Mesh(gutterGeo, freshBambooMat);
    houseGroup.add(gutterMesh);

    const vatPoints = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.24, 0),
      new THREE.Vector2(0.32, 0.35),
      new THREE.Vector2(0.22, 0.62),
      new THREE.Vector2(0.25, 0.68),
    ];
    const vatGeo = track(new THREE.LatheGeometry(vatPoints, 32));
    const vatMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0x5c3317,
        roughness: 0.32,
        clearcoat: 0.6,
      })
    );
    const vatMesh = new THREE.Mesh(vatGeo, vatMat);
    vatMesh.position.set(1.75, 0, 1.15);
    houseGroup.add(vatMesh);

    // 5. Instanced Raindrops / Airflow Particles (60 instances)
    const particleCount = 60;
    const dropGeo = track(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6));
    const dropMat = track(
      new THREE.MeshBasicMaterial({
        color: stationId === 16 ? 0x38bdf8 : 0xfde047,
        transparent: true,
        opacity: 0.75,
      })
    );
    const particlesMesh = new THREE.InstancedMesh(dropGeo, dropMat, particleCount);
    particlesMesh.frustumCulled = false;
    houseGroup.add(particlesMesh);

    root.add(houseGroup);

    customUpdate = (dt, elapsed, p) => {
      const fHeight = p.floorHeight ?? 1.25;
      const pitchDeg = p.roofPitch ?? p.param1 ?? 45;
      const matMode = p.roofMaterial || 'co_gianh';
      const thicknessScale = (p.thatchThicknessCm ?? 15) / 15;
      const exp = p.explodedFactor || 0;

      // Update stilt heights
      const targetFloorY = fHeight * 0.65;
      pillars.forEach((col) => {
        col.scale.y = THREE.MathUtils.damp(col.scale.y, targetFloorY + 0.9, 8, dt);
      });
      floorGroup.position.y = THREE.MathUtils.damp(floorGroup.position.y, targetFloorY, 8, dt);

      // Update roof pitch & material
      const pitchRad = THREE.MathUtils.degToRad(pitchDeg);
      const ridgeY = targetFloorY + 0.95 + Math.sin(pitchRad) * 0.85 + exp * 0.65;
      roofGroup.position.y = THREE.MathUtils.damp(roofGroup.position.y, ridgeY, 8, dt);

      frontSlope.rotation.x = THREE.MathUtils.damp(frontSlope.rotation.x, pitchRad, 8, dt);
      backSlope.rotation.x = THREE.MathUtils.damp(backSlope.rotation.x, pitchRad, 8, dt);
      frontSlope.scale.y = THREE.MathUtils.damp(frontSlope.scale.y, thicknessScale, 8, dt);
      backSlope.scale.y = THREE.MathUtils.damp(backSlope.scale.y, thicknessScale, 8, dt);

      if (matMode === 'ton') {
        roofMat.map = null;
        roofMat.color.setHex(0x94a3b8);
        roofMat.metalness = 0.82;
        roofMat.roughness = 0.28;
      } else if (matMode === 'ngoi_am_duong') {
        roofMat.map = null;
        roofMat.color.setHex(0xb45309);
        roofMat.metalness = 0.1;
        roofMat.roughness = 0.65;
      } else {
        roofMat.map = thatchTex;
        roofMat.color.setHex(0x9c723c);
        roofMat.metalness = 0.05;
        roofMat.roughness = 0.88;
      }
      roofMat.needsUpdate = true;

      // Position bamboo gutter at front eave
      const eaveZ = Math.cos(pitchRad) * 1.45;
      const eaveY = ridgeY - Math.sin(pitchRad) * 1.45 - 0.08;
      gutterMesh.position.set(0, eaveY, eaveZ);
      vatMesh.position.set(1.65, 0, eaveZ);

      // Animate raindrops (Station 16) or convection wind streams (Station 03)
      for (let i = 0; i < particleCount; i++) {
        if (stationId === 16) {
          const speed = p.weatherMode === 'storm' ? 4.5 : p.weatherMode === 'heavy' ? 3.0 : 1.8;
          const cycle = ((elapsed * speed + i * 0.19) % 2.4) / 2.4;
          const x = ((i % 12) - 5.5) * 0.3;
          const z = (Math.floor(i / 12) - 2) * 0.55;
          const y = 3.6 - cycle * 3.4;
          _dummy.position.set(x, y, z);
          _dummy.rotation.set(0, 0, p.weatherMode === 'storm' ? 0.28 : 0.05);
          _dummy.scale.setScalar(p. isRunning === false ? 0.001 : 1);
        } else {
          // Rising cool breeze under stilts & warm air venting through roof
          const cycle = ((elapsed * 0.85 + i * 0.11) % 1);
          const x = -1.6 + cycle * 3.2;
          const z = ((i % 5) - 2) * 0.32;
          const y = 0.3 + Math.sin(cycle * Math.PI) * (targetFloorY + 0.8);
          _dummy.position.set(x, y, z);
          _dummy.rotation.set(0, 0, Math.PI / 2);
          _dummy.scale.setScalar(0.8);
        }
        _dummy.updateMatrix();
        particlesMesh.setMatrixAt(i, _dummy.matrix);
      }
      particlesMesh.instanceMatrix.needsUpdate = true;
    };
  }

  // =========================================================================
  // STATION 05: GUỒNG NƯỚC / CỌN NƯỚC TÂY BẮC (3D Rotating Bamboo Water Wheel)
  // =========================================================================
  else if (stationId === 5) {
    // 1. Riverbed & Animated Water Stream
    const riverGeo = track(new THREE.BoxGeometry(4.6, 0.24, 2.8));
    const riverMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0x0284c7,
        roughness: 0.15,
        metalness: 0.1,
        transmission: isSoftwareGl ? 0 : 0.65,
        transparent: true,
        opacity: isSoftwareGl ? 0.78 : 1.0,
        clearcoat: 1.0,
      })
    );
    const riverMesh = new THREE.Mesh(riverGeo, riverMat);
    riverMesh.position.set(0, 0.12, 0);
    root.add(riverMesh);

    // 2. A-Frame Axle Support Posts
    const supportGroup = new THREE.Group();
    const legGeo = track(new THREE.CylinderGeometry(0.07, 0.09, 2.1, 12));
    [-0.45, 0.45].forEach((z) => {
      const leg1 = new THREE.Mesh(legGeo, woodMat);
      leg1.position.set(-0.35, 1.0, z);
      leg1.rotation.z = -0.2;
      const leg2 = new THREE.Mesh(legGeo, woodMat);
      leg2.position.set(0.35, 1.0, z);
      leg2.rotation.z = 0.2;
      supportGroup.add(leg1, leg2);
    });
    root.add(supportGroup);

    // 3. Rotating Water Wheel Assembly (Cọn nước)
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(0, 1.65, 0);

    const hubGeo = track(new THREE.CylinderGeometry(0.14, 0.14, 1.05, 16));
    hubGeo.rotateX(Math.PI / 2);
    const hubMesh = new THREE.Mesh(hubGeo, woodMat);
    wheelGroup.add(hubMesh);

    // Outer bamboo rims (2 parallel rings)
    const rimGeo = track(new THREE.TorusGeometry(1.25, 0.04, 12, 48));
    const frontRim = new THREE.Mesh(rimGeo, bambooMat);
    frontRim.position.z = 0.32;
    const backRim = new THREE.Mesh(rimGeo, bambooMat);
    backRim.position.z = -0.32;
    wheelGroup.add(frontRim, backRim);

    // 16 Radial Spokes, Woven Paddles & Angled Bamboo Water Scoops (Ống bương)
    const maxBlades = 20;
    const bladeGroups: THREE.Group[] = [];
    const spokeGeo = track(new THREE.CylinderGeometry(0.02, 0.025, 2.5, 8));
    const paddleGeo = track(new THREE.BoxGeometry(0.28, 0.02, 0.58));
    const scoopGeo = track(new THREE.CylinderGeometry(0.045, 0.045, 0.52, 12));

    for (let i = 0; i < maxBlades; i++) {
      const bg = new THREE.Group();
      const sp1 = new THREE.Mesh(spokeGeo, bambooMat);
      sp1.position.z = 0.32;
      const sp2 = new THREE.Mesh(spokeGeo, bambooMat);
      sp2.position.z = -0.32;

      const paddle = new THREE.Mesh(paddleGeo, woodMat);
      paddle.position.set(1.22, 0, 0);

      const scoop = new THREE.Mesh(scoopGeo, freshBambooMat);
      scoop.position.set(1.26, 0.1, 0);
      scoop.rotation.x = Math.PI / 2;
      scoop.rotation.z = 0.38;

      bg.add(sp1, sp2, paddle, scoop);
      wheelGroup.add(bg);
      bladeGroups.push(bg);
    }
    root.add(wheelGroup);

    // 4. Elevated Bamboo Aqueduct Trough (Máng thu nước trên cao)
    const troughGeo = track(new THREE.BoxGeometry(2.2, 0.14, 0.32));
    const troughMesh = new THREE.Mesh(troughGeo, freshBambooMat);
    troughMesh.position.set(0.95, 2.75, 0.45);
    root.add(troughMesh);

    let wheelAngle = 0;
    customUpdate = (dt, _elapsed, p) => {
      const radiusScale = (p.param1 ?? 2.5) / 2.5;
      const waterSpeed = p.param2 ?? 1.8;
      const bladeCount = Math.max(8, Math.min(maxBlades, Math.round(p.param3 ?? 14)));

      wheelGroup.scale.setScalar(THREE.MathUtils.damp(wheelGroup.scale.x, 0.68 + radiusScale * 0.32, 6, dt));
      troughMesh.position.y = THREE.MathUtils.damp(
        troughMesh.position.y,
        1.65 + wheelGroup.scale.x * 1.18,
        6,
        dt
      );

      bladeGroups.forEach((bg, idx) => {
        bg.visible = idx < bladeCount;
        if (bg.visible) {
          const angle = (idx / bladeCount) * Math.PI * 2;
          bg.rotation.z = angle;
        }
      });

      if (p.isRunning !== false) {
        const omega = (waterSpeed * 0.9) / Math.max(1, p.param1 ?? 2.5);
        wheelAngle += omega * dt;
        wheelGroup.rotation.z = wheelAngle;
      }
    };
  }

  // =========================================================================
  // STATION 06: NHUỘM VẢI TỰ NHIÊN (3D Clay Dye Vat, Hanging Rack & Cloth)
  // =========================================================================
  else if (stationId === 6) {
    // 1. Earthenware Dye Vat (Chậu gốm nung chứa dịch chàm/nghệ/cẩm)
    const vatPoints = [
      new THREE.Vector2(0, 0.05),
      new THREE.Vector2(0.65, 0.05),
      new THREE.Vector2(0.92, 0.55),
      new THREE.Vector2(0.84, 1.05),
      new THREE.Vector2(0.92, 1.14),
      new THREE.Vector2(0.78, 1.14),
      new THREE.Vector2(0.75, 0.95),
    ];
    const vatGeo = track(new THREE.LatheGeometry(vatPoints, 48));
    const vatMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0x4a2810,
        roughness: 0.42,
        metalness: 0.08,
        clearcoat: 0.45,
      })
    );
    const vatMesh = new THREE.Mesh(vatGeo, vatMat);
    root.add(vatMesh);

    // 2. Dye Liquid Pool Inside Vat
    const liquidGeo = track(new THREE.CylinderGeometry(0.78, 0.72, 0.12, 48));
    const liquidMat = track(
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(initialParams.dyeHex || '#1e3a5f'),
        roughness: 0.12,
        metalness: 0.1,
        clearcoat: 1.0,
      })
    );
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.y = 0.92;
    root.add(liquidMesh);

    // 3. Bamboo Drying Frame (Giá tre treo vải)
    const postGeo = track(new THREE.CylinderGeometry(0.055, 0.07, 2.85, 16));
    const leftPole = new THREE.Mesh(postGeo, bambooMat);
    leftPole.position.set(-1.15, 1.42, 0);
    const rightPole = new THREE.Mesh(postGeo, bambooMat);
    rightPole.position.set(1.15, 1.42, 0);
    const crossbarGeo = track(new THREE.CylinderGeometry(0.045, 0.045, 2.6, 16));
    crossbarGeo.rotateZ(Math.PI / 2);
    const crossbar = new THREE.Mesh(crossbarGeo, bambooMat);
    crossbar.position.set(0, 2.7, 0);
    root.add(leftPole, rightPole, crossbar);

    // 4. Suspended Cloth Assembly (Tấm vải lanh dệt thủ công nhúng vại)
    const clothGroup = new THREE.Group();
    clothGroup.position.set(0, 2.15, 0);

    const clothTex = track(
      createBrocadeTexture(
        initialParams.fabricHex || '#1e3a5f',
        '#D6AA55',
        undefined,
        maxAnisotropy
      )
    );
    const clothGeo = track(new THREE.PlaneGeometry(0.95, 1.35, 24, 32));
    const clothMat = track(
      new THREE.MeshPhysicalMaterial({
        map: clothTex,
        color: new THREE.Color(initialParams.fabricHex || '#1e3a5f'),
        roughness: 0.75,
        sheen: 1.0,
        sheenRoughness: 0.5,
        side: THREE.DoubleSide,
      })
    );
    const clothMesh = new THREE.Mesh(clothGeo, clothMat);
    markClickable(clothMesh, 'toggle:dip', 'Bấm vào tấm vải để nhúng xuống chậu nhuộm hoặc vớt lên oxy hóa');
    interactables.push(clothMesh);
    clothGroup.add(clothMesh);
    root.add(clothGroup);

    // Store original vertex positions for cloth wave animation
    const basePositions = clothGeo.attributes.position.array.slice() as Float32Array;

    customUpdate = (dt, elapsed, p) => {
      if (p.dyeHex) {
        _color.set(p.dyeHex);
        liquidMat.color.lerp(_color, 0.15);
      }
      if (p.fabricHex) {
        _color.set(p.fabricHex);
        clothMat.color.lerp(_color, 0.12);
      }

      // Vertical dip animation into the vat
      const targetY = p.isFabricDipped ? 1.15 : 2.02;
      clothGroup.position.y = THREE.MathUtils.damp(clothGroup.position.y, targetY, 5.5, dt);

      // Gentle cloth ripple
      const pos = clothGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const bx = basePositions[i * 3];
        const by = basePositions[i * 3 + 1];
        const wave = Math.sin(by * 3.5 + elapsed * 2.4) * 0.045 * (0.6 - by * 0.4);
        pos.setZ(i, wave + Math.cos(bx * 4 + elapsed * 1.8) * 0.02);
      }
      pos.needsUpdate = true;
      clothGeo.computeVertexNormals();
    };
  }

  // =========================================================================
  // STATION 07: SÁO TRÚC – CỘT KHÍ & SÓNG DỪNG 3D
  // =========================================================================
  else if (stationId === 7) {
    const fluteGroup = new THREE.Group();
    fluteGroup.position.set(0, 1.45, 0);

    // 1. Hollow Bamboo Flute Cylinder (Thân sáo trúc có đốt)
    const bodyGeo = track(new THREE.CylinderGeometry(0.14, 0.14, 3.6, 32));
    bodyGeo.rotateZ(Math.PI / 2);
    const bodyMesh = new THREE.Mesh(bodyGeo, bambooMat);
    fluteGroup.add(bodyMesh);

    // Decorative rattan bindings (Vòng mây buộc đầu sáo)
    const ringGeo = track(new THREE.TorusGeometry(0.145, 0.018, 12, 32));
    ringGeo.rotateY(Math.PI / 2);
    [-1.65, -0.95, 1.65].forEach((x) => {
      const r = new THREE.Mesh(ringGeo, ropeMat);
      r.position.x = x;
      fluteGroup.add(r);
    });

    // Embouchure blow hole (Lỗ thổi)
    const blowHoleGeo = track(new THREE.CylinderGeometry(0.065, 0.065, 0.08, 24));
    const darkHoleMat = track(new THREE.MeshBasicMaterial({ color: 0x090d16 }));
    const blowHole = new THREE.Mesh(blowHoleGeo, darkHoleMat);
    blowHole.position.set(-1.25, 0.12, 0);
    fluteGroup.add(blowHole);

    // 2. 6 Interactive Finger Holes (Lỗ bấm 1..6)
    const holeMeshes: THREE.Mesh[] = [];
    const capMeshes: THREE.Mesh[] = [];
    const holeGeo = track(new THREE.CylinderGeometry(0.055, 0.055, 0.08, 24));
    const capGeo = track(new THREE.SphereGeometry(0.075, 24, 16));

    for (let i = 0; i < 6; i++) {
      // Index 0 = farthest tip (Lỗ 1), Index 5 = closest to blow hole (Lỗ 6)
      const hx = 1.35 - i * 0.38;
      const hMat = track(
        new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          emissive: 0x0369a1,
          emissiveIntensity: 0.4,
        })
      );
      const hMesh = new THREE.Mesh(holeGeo, hMat);
      hMesh.position.set(hx, 0.12, 0);
      markClickable(hMesh, `hole:${i}`, `Lỗ bấm ${6 - i} (Bấm để Đóng/Mở)`);
      interactables.push(hMesh);
      fluteGroup.add(hMesh);
      holeMeshes.push(hMesh);

      // Finger plug indicator when closed
      const capMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xd6aa55,
          roughness: 0.4,
          metalness: 0.3,
        })
      );
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(hx, 0.18, 0);
      markClickable(cap, `hole:${i}`, `Lỗ bấm ${6 - i} (Bấm để Đóng/Mở)`);
      interactables.push(cap);
      fluteGroup.add(cap);
      capMeshes.push(cap);
    }

    // 3. 3D Standing Wave Harmonic Envelope (Sóng dừng 3D phát sáng phía trên thân sáo)
    const waveSegments = 48;
    const waveSpheres: THREE.Mesh[] = [];
    const nodeGeo = track(new THREE.SphereGeometry(0.032, 12, 12));
    const nodeMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
      })
    );
    const waveGroup = new THREE.Group();
    waveGroup.position.set(0, 0.55, 0);
    for (let i = 0; i < waveSegments; i++) {
      const sp = new THREE.Mesh(nodeGeo, nodeMat);
      waveGroup.add(sp);
      waveSpheres.push(sp);
    }
    fluteGroup.add(waveGroup);
    root.add(fluteGroup);

    customUpdate = (dt, elapsed, p) => {
      const lenScale = (p.tubeLengthCm ?? 42) / 42;
      const diamScale = (p.tubeDiameterMm ?? 14) / 14;
      fluteGroup.scale.x = THREE.MathUtils.damp(fluteGroup.scale.x, lenScale, 8, dt);
      bodyMesh.scale.set(1, diamScale, diamScale);

      const holes = p.holes || [false, false, false, false, false, false];
      let firstOpenHoleX = 1.75; // full tube end
      for (let i = 5; i >= 0; i--) {
        const isOpen = Boolean(holes[i]);
        const hx = 1.35 - i * 0.38;
        if (isOpen && firstOpenHoleX === 1.75) {
          firstOpenHoleX = hx;
        }
        capMeshes[i].visible = !isOpen;
        const hMat = holeMeshes[i].material as THREE.MeshStandardMaterial;
        hMat.color.setHex(isOpen ? 0x38bdf8 : 0x18181b);
        hMat.emissiveIntensity = isOpen ? 0.8 : 0.0;
      }

      // Update 3D Standing Wave from embouchure (-1.25) to firstOpenHoleX
      const startX = -1.25;
      const colSpan = Math.max(0.5, firstOpenHoleX - startX);
      for (let i = 0; i < waveSegments; i++) {
        const t = i / (waveSegments - 1);
        const x = startX + t * colSpan;
        const envelope = Math.cos(t * Math.PI);
        const y = Math.sin(elapsed * 12) * 0.24 * envelope;
        const z = Math.cos(elapsed * 12) * 0.12 * envelope;
        waveSpheres[i].position.set(x, y, z);
        waveSpheres[i].scale.setScalar(0.6 + Math.abs(envelope) * 0.9);
      }
    };
  }

  // =========================================================================
  // STATION 14: RƯỢU MEN LÁ TRUYỀN THỐNG (Mortar, Ceramic Jar / 3D Microscope, Still)
  // =========================================================================
  else if (stationId === 14) {
    // Group A: Ceramic Fermentation Jar + Lid + Bubbles
    const jarGroup = new THREE.Group();
    const jarPoints = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.58, 0),
      new THREE.Vector2(0.88, 0.75),
      new THREE.Vector2(0.85, 1.45),
      new THREE.Vector2(0.52, 1.95),
      new THREE.Vector2(0.58, 2.08),
      new THREE.Vector2(0.46, 2.08),
      new THREE.Vector2(0.45, 1.85),
    ];
    const jarGeo = track(new THREE.LatheGeometry(jarPoints, 48));
    const jarMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0x6b3a19,
        roughness: 0.28,
        metalness: 0.08,
        clearcoat: 0.75,
        clearcoatRoughness: 0.18,
      })
    );
    const jarMesh = new THREE.Mesh(jarGeo, jarMat);
    jarGroup.add(jarMesh);

    // Banana leaf tied cover (Nắp lá chuối buộc lạt yếm khí)
    const lidGeo = track(new THREE.ConeGeometry(0.66, 0.35, 32));
    const lidMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x15803d,
        roughness: 0.65,
      })
    );
    const lidMesh = new THREE.Mesh(lidGeo, lidMat);
    lidMesh.position.y = 2.18;
    markClickable(lidMesh, 'toggle:seal', 'Nắp lá chuối (Bấm để Đóng/Mở nắp chum)');
    interactables.push(lidMesh);
    jarGroup.add(lidMesh);

    // CO2 Rising Bubbles
    const bubbles: THREE.Mesh[] = [];
    const bGeo = track(new THREE.SphereGeometry(0.045, 16, 16));
    const bMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0x7dd3fc,
        roughness: 0.1,
        transmission: isSoftwareGl ? 0 : 0.85,
        transparent: true,
        opacity: 0.75,
      })
    );
    for (let i = 0; i < 18; i++) {
      const b = new THREE.Mesh(bGeo, bMat);
      jarGroup.add(b);
      bubbles.push(b);
    }
    root.add(jarGroup);

    // Group B: 3D Cellular Microscope World (Saccharomyces budding yeast + Rhizopus hyphae)
    const microGroup = new THREE.Group();
    microGroup.position.set(0, 1.35, 0);
    const yeastMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0x34d399,
        roughness: 0.25,
        clearcoat: 0.8,
        transmission: isSoftwareGl ? 0 : 0.5,
        transparent: true,
        opacity: 0.92,
      })
    );
    const cellGeo = track(new THREE.SphereGeometry(0.32, 32, 24));
    const budGeo = track(new THREE.SphereGeometry(0.18, 24, 16));
    for (let i = 0; i < 7; i++) {
      const cellPair = new THREE.Group();
      const angle = (i / 7) * Math.PI * 2;
      const r = i === 0 ? 0 : 0.85;
      cellPair.position.set(Math.cos(angle) * r, Math.sin(angle) * r * 0.65, (i % 3 - 1) * 0.3);
      const mother = new THREE.Mesh(cellGeo, yeastMat);
      const daughter = new THREE.Mesh(budGeo, yeastMat);
      daughter.position.set(0.34, 0.22, 0);
      cellPair.add(mother, daughter);
      microGroup.add(cellPair);
    }
    microGroup.visible = false;
    root.add(microGroup);

    customUpdate = (dt, elapsed, p) => {
      const isMicro = Boolean(p.microscopeView);
      jarGroup.visible = !isMicro;
      microGroup.visible = isMicro;

      if (isMicro) {
        microGroup.rotation.y = elapsed * 0.35;
        microGroup.children.forEach((cell, idx) => {
          const pulse = 1 + Math.sin(elapsed * 3 + idx) * 0.08;
          cell.scale.setScalar(pulse);
        });
      } else {
        const sealed = p.isSealed !== false;
        const targetLidY = sealed ? 2.16 : 2.75;
        const targetLidX = sealed ? 0 : 0.85;
        lidMesh.position.y = THREE.MathUtils.damp(lidMesh.position.y, targetLidY, 7, dt);
        lidMesh.position.x = THREE.MathUtils.damp(lidMesh.position.x, targetLidX, 7, dt);
        lidMesh.rotation.z = THREE.MathUtils.damp(lidMesh.rotation.z, sealed ? 0 : -0.45, 7, dt);

        const temp = p.temperature ?? 30;
        const activeFerment = temp >= 18 && temp <= 38;
        bubbles.forEach((b, i) => {
          b.visible = activeFerment;
          if (activeFerment) {
            const cycle = (elapsed * (temp / 22) + i * 0.17) % 1;
            const angle = i * 1.1;
            const rad = (i % 4) * 0.09;
            b.position.set(Math.cos(angle) * rad, 1.65 + cycle * 1.25, Math.sin(angle) * rad);
            b.scale.setScalar(1 - cycle * 0.5);
          }
        });
      }
    };
  }

  // =========================================================================
  // TAM ĐẢO 3D CLIMATE LAB (Station 99) OR STATION 10 (RUỘNG BẬC THANG)
  // =========================================================================
  else if (stationId === 99 || stationId === 10) {
    const terrainGroup = new THREE.Group();
    const steps = stationId === 10 ? Math.max(2, Math.round(initialParams.param2 ?? 5)) : 8;

    const stepMeshes: THREE.Mesh[] = [];
    const waterMeshes: THREE.Mesh[] = [];
    const earthMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x3f6212,
        roughness: 0.85,
      })
    );
    const paddyWaterMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        roughness: 0.12,
        metalness: 0.15,
        clearcoat: 1.0,
      })
    );

    for (let i = 0; i < 8; i++) {
      const rBot = 1.9 - i * 0.2;
      const rTop = rBot - 0.15;
      const sGeo = track(new THREE.CylinderGeometry(rTop, rBot, 0.26, 32));
      const sMesh = new THREE.Mesh(sGeo, earthMat);
      sMesh.position.y = i * 0.26 + 0.13;
      terrainGroup.add(sMesh);
      stepMeshes.push(sMesh);

      const wGeo = track(new THREE.CylinderGeometry(rTop * 0.94, rTop * 0.94, 0.03, 32));
      const wMesh = new THREE.Mesh(wGeo, paddyWaterMat);
      wMesh.position.y = i * 0.26 + 0.255;
      terrainGroup.add(wMesh);
      waterMeshes.push(wMesh);
    }

    // Elevation / Cloud Marker Ring for Tam Dao
    const cloudGeo = track(new THREE.TorusGeometry(1.15, 0.16, 16, 48));
    cloudGeo.rotateX(Math.PI / 2);
    const cloudMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.9,
        transparent: true,
        opacity: 0.78,
      })
    );
    const cloudRing = new THREE.Mesh(cloudGeo, cloudMat);
    cloudRing.position.y = 1.45;
    terrainGroup.add(cloudRing);

    root.add(terrainGroup);

    customUpdate = (dt, elapsed, p) => {
      const activeCount = stationId === 10 ? Math.max(1, Math.min(8, Math.round(p.param2 ?? 5))) : 8;
      stepMeshes.forEach((m, idx) => {
        m.visible = idx < activeCount;
        waterMeshes[idx].visible = idx < activeCount;
      });

      const elevRatio = ((p.targetElevation ?? 900) - 100) / 1200;
      const targetCloudY = stationId === 99 ? 0.35 + elevRatio * 1.75 : 2.15;
      cloudRing.position.y = THREE.MathUtils.damp(cloudRing.position.y, targetCloudY, 6, dt);
      cloudRing.rotation.z = elapsed * 0.25;
    };
  }

  // =========================================================================
  // REMAINING STATIONS (4, 8, 9, 11, 12, 13, 15): BESPOKE MULTI-PART 3D MODELS
  // =========================================================================
  else {
    const customGroup = new THREE.Group();

    if (stationId === 4) {
      // Đan lát mây tre: Woven Bamboo Lattice + Brass Weight
      const rimGeo = track(new THREE.TorusGeometry(1.35, 0.07, 16, 48));
      rimGeo.rotateX(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, bambooMat);
      rim.position.y = 1.2;
      customGroup.add(rim);

      const strips: THREE.Mesh[] = [];
      const stripGeo = track(new THREE.BoxGeometry(2.5, 0.025, 0.11));
      for (let i = -4; i <= 4; i++) {
        const s1 = new THREE.Mesh(stripGeo, bambooMat);
        s1.position.set(0, 1.2, i * 0.22);
        const s2 = new THREE.Mesh(stripGeo, freshBambooMat);
        s2.rotation.y = Math.PI / 2;
        s2.position.set(i * 0.22, 1.22, 0);
        customGroup.add(s1, s2);
        strips.push(s1, s2);
      }

      const weightGeo = track(new THREE.CylinderGeometry(0.28, 0.32, 0.45, 24));
      const weightMat = track(
        new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.85, roughness: 0.25 })
      );
      const weightMesh = new THREE.Mesh(weightGeo, weightMat);
      weightMesh.position.y = 1.48;
      customGroup.add(weightMesh);

      customUpdate = (dt, _elapsed, p) => {
        const load = p.param2 ?? 15;
        const density = p.param1 ?? 3;
        const sag = Math.min(0.35, (load / (density * 18)) * 0.25);
        weightMesh.position.y = THREE.MathUtils.damp(weightMesh.position.y, 1.45 - sag, 8, dt);
        weightMesh.scale.setScalar(0.75 + (load / 30) * 0.45);
        strips.forEach((st) => {
          st.position.y = THREE.MathUtils.damp(st.position.y, 1.2 - sag * 0.5, 8, dt);
        });
      };
    } else if (stationId === 8) {
      // Cơm lam: Green Bamboo Tube over Glowing Firewood
      const logGeo = track(new THREE.CylinderGeometry(0.09, 0.09, 1.8, 12));
      logGeo.rotateZ(Math.PI / 2);
      for (let i = 0; i < 4; i++) {
        const log = new THREE.Mesh(logGeo, woodMat);
        log.position.set(0, 0.12, (i - 1.5) * 0.22);
        log.rotation.y = (i % 2 === 0 ? 1 : -1) * 0.25;
        customGroup.add(log);
      }
      const emberMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xf97316,
          emissiveIntensity: 1.5,
        })
      );
      const emberMesh = new THREE.Mesh(track(new THREE.SphereGeometry(0.45, 24, 16)), emberMat);
      emberMesh.scale.set(1.6, 0.35, 1.0);
      emberMesh.position.y = 0.18;
      customGroup.add(emberMesh);

      const lamTube = new THREE.Mesh(
        track(new THREE.CylinderGeometry(0.22, 0.22, 2.4, 32)),
        freshBambooMat
      );
      lamTube.rotation.z = Math.PI / 2 - 0.22;
      lamTube.position.set(0, 0.95, 0);
      customGroup.add(lamTube);

      customUpdate = (_dt, elapsed, p) => {
        const fireT = p.param2 ?? 350;
        emberMat.emissiveIntensity = (fireT / 350) * (1.2 + Math.sin(elapsed * 8) * 0.25);
      };
    } else if (stationId === 9) {
      // Cầu tre vượt suối: Bamboo Truss Bridge
      const abutmentGeo = track(new THREE.BoxGeometry(0.65, 1.1, 1.4));
      const leftBank = new THREE.Mesh(abutmentGeo, woodMat);
      leftBank.position.set(-1.65, 0.55, 0);
      const rightBank = new THREE.Mesh(abutmentGeo, woodMat);
      rightBank.position.set(1.65, 0.55, 0);
      customGroup.add(leftBank, rightBank);

      const deckMesh = new THREE.Mesh(track(new THREE.BoxGeometry(2.9, 0.09, 0.95)), bambooMat);
      deckMesh.position.set(0, 1.1, 0);
      const trussGroup = new THREE.Group();
      const strutGeo = track(new THREE.CylinderGeometry(0.04, 0.04, 1.35, 12));
      [-0.85, 0.85].forEach((x) => {
        const s = new THREE.Mesh(strutGeo, freshBambooMat);
        s.position.set(x, 0.65, 0);
        s.rotation.z = x < 0 ? -0.55 : 0.55;
        trussGroup.add(s);
      });
      customGroup.add(deckMesh, trussGroup);

      customUpdate = (dt, _elapsed, p) => {
        const braced = p.selectMode !== 'don_thuan';
        trussGroup.visible = braced;
        const load = p.param2 ?? 1200;
        const sag = (load / 2500) * (braced ? 0.08 : 0.26);
        deckMesh.position.y = THREE.MathUtils.damp(deckMesh.position.y, 1.1 - sag, 8, dt);
      };
    } else if (stationId === 12) {
      // Đòn gánh & Quang thúng: Balance Lever Beam
      const fulcrum = new THREE.Mesh(track(new THREE.ConeGeometry(0.28, 1.35, 24)), woodMat);
      fulcrum.position.y = 0.675;
      customGroup.add(fulcrum);

      const beamGroup = new THREE.Group();
      beamGroup.position.set(0, 1.38, 0);
      const pole = new THREE.Mesh(
        track(new THREE.CylinderGeometry(0.045, 0.045, 3.2, 24)).rotateZ(Math.PI / 2),
        bambooMat
      );
      const basketGeo = track(new THREE.CylinderGeometry(0.36, 0.24, 0.32, 24));
      const leftBasket = new THREE.Mesh(basketGeo, bambooMat);
      leftBasket.position.set(-1.35, -0.65, 0);
      const rightBasket = new THREE.Mesh(basketGeo, bambooMat);
      rightBasket.position.set(1.35, -0.65, 0);
      beamGroup.add(pole, leftBasket, rightBasket);
      customGroup.add(beamGroup);

      customUpdate = (dt, _elapsed, p) => {
        const m1 = p.param1 ?? 20;
        const m2 = p.param2 ?? 25;
        const tilt = THREE.MathUtils.clamp((m1 - m2) * 0.018, -0.35, 0.35);
        beamGroup.rotation.z = THREE.MathUtils.damp(beamGroup.rotation.z, tilt, 6, dt);
      };
    } else if (stationId === 13) {
      // Đàn T'rưng / Nhạc cụ ống tre: 7 Graded Interactive Bamboo Tubes
      const tubes: THREE.Mesh[] = [];
      for (let i = 0; i < 7; i++) {
        const len = 1.95 - i * 0.18;
        const tGeo = track(new THREE.CylinderGeometry(0.085, 0.085, len, 24));
        const tMesh = new THREE.Mesh(tGeo, i % 2 === 0 ? bambooMat : freshBambooMat);
        tMesh.position.set((i - 3) * 0.36, 1.25, 0);
        tMesh.rotation.x = 0.22;
        const freq = Math.round(261.6 * Math.pow(2, i / 6));
        markClickable(tMesh, `tone:${freq}`, `Ống tre số ${i + 1} (${freq} Hz) – Bấm để gõ`);
        interactables.push(tMesh);
        customGroup.add(tMesh);
        tubes.push(tMesh);
      }

      customUpdate = (_dt, elapsed, _p) => {
        tubes.forEach((t, i) => {
          t.position.y = 1.25 + Math.sin(elapsed * 3 + i) * 0.015;
        });
      };
    } else {
      // Stations 11 (Quang phổ Chàm) & 15 (Hình thái lá rừng)
      const cuvetteGeo = track(new THREE.BoxGeometry(0.85, 1.65, 0.85));
      const cuvetteMat = track(
        new THREE.MeshPhysicalMaterial({
          color: stationId === 11 ? 0x1e3a8a : 0x15803d,
          roughness: 0.15,
          transmission: isSoftwareGl ? 0 : 0.72,
          transparent: true,
          opacity: 0.85,
          clearcoat: 1.0,
        })
      );
      const mainObj = new THREE.Mesh(cuvetteGeo, cuvetteMat);
      mainObj.position.y = 1.1;
      customGroup.add(mainObj);

      customUpdate = (_dt, elapsed, _p) => {
        mainObj.rotation.y = elapsed * 0.4;
      };
    }

    root.add(customGroup);
  }

  enableShadows(root);

  return {
    root,
    interactables,
    update: customUpdate,
    dispose: () => {
      disposables.forEach((d) => d.dispose());
    },
  };
}
