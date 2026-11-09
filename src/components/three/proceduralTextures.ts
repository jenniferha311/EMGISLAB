import * as THREE from 'three';

const textureCache = new Map<string, THREE.CanvasTexture>();

function configureColorTexture(
  tex: THREE.CanvasTexture,
  maxAnisotropy: number,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  if (repeatX > 1 || repeatY > 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  tex.needsUpdate = true;
  return tex;
}

/**
 * Soft radial contact shadow texture for grounding 3D models on the floor plane
 */
export function getContactShadowTexture(): THREE.CanvasTexture {
  const key = 'contact_shadow';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.05,
    size / 2,
    size / 2,
    size * 0.48
  );
  grad.addColorStop(0, 'rgba(10, 18, 14, 0.72)');
  grad.addColorStop(0.45, 'rgba(10, 18, 14, 0.35)');
  grad.addColorStop(1, 'rgba(10, 18, 14, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set(key, tex);
  return tex;
}

/**
 * Hammered ancient Muong bronze texture with concentric artisan rings
 */
export function getBronzeTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const key = 'muong_bronze';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const baseGrad = ctx.createRadialGradient(cx, cy, 12, cx, cy, size * 0.5);
  baseGrad.addColorStop(0, '#F5DC90');
  baseGrad.addColorStop(0.22, '#D6AA55');
  baseGrad.addColorStop(0.65, '#9A712B');
  baseGrad.addColorStop(0.9, '#5E4217');
  baseGrad.addColorStop(1, '#3D290C');

  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  // Concentric lathe / hammering rings
  for (let r = 18; r < size * 0.48; r += 6) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = r % 12 === 0 ? 'rgba(255, 240, 190, 0.16)' : 'rgba(40, 25, 8, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Subtle hammered dimples
  for (let i = 0; i < 240; i++) {
    const angle = (i * 137.5 * Math.PI) / 180;
    const dist = Math.sqrt(i / 240) * (size * 0.45);
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 232, 170, 0.08)' : 'rgba(30, 18, 5, 0.1)';
    ctx.fill();
  }

  const tex = configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
  textureCache.set(key, tex);
  return tex;
}

/**
 * Natural bamboo culm texture with longitudinal fibers and dark node rings
 */
export function getBambooTexture(
  variant: 'aged' | 'fresh' = 'aged',
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const key = `bamboo_${variant}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = variant === 'fresh' ? '#3B7A3E' : '#C6934B';
  ctx.fillRect(0, 0, w, h);

  // Longitudinal vascular fibers
  for (let x = 0; x < w; x += 2) {
    const shade = Math.sin(x * 0.35) * 14;
    if (variant === 'fresh') {
      ctx.fillStyle = shade > 0 ? 'rgba(130, 200, 110, 0.18)' : 'rgba(20, 55, 25, 0.22)';
    } else {
      ctx.fillStyle = shade > 0 ? 'rgba(245, 210, 145, 0.22)' : 'rgba(110, 68, 20, 0.22)';
    }
    ctx.fillRect(x, 0, 1.5, h);
  }

  // Bamboo node bands (Đốt tre)
  [128, 384].forEach((ny) => {
    const grad = ctx.createLinearGradient(0, ny - 10, 0, ny + 10);
    grad.addColorStop(0, 'rgba(60, 35, 10, 0)');
    grad.addColorStop(0.45, 'rgba(55, 30, 8, 0.65)');
    grad.addColorStop(0.55, 'rgba(245, 215, 160, 0.4)');
    grad.addColorStop(1, 'rgba(60, 35, 10, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, ny - 10, w, 20);
  });

  const tex = configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy, 1, 2);
  textureCache.set(key, tex);
  return tex;
}

/**
 * Layered palm thatch (Lá cọ lợp mái) texture
 */
export function getPalmThatchTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const key = 'palm_thatch';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#6E4B26';
  ctx.fillRect(0, 0, w, h);

  // Overlapping palm leaf fan ribs
  for (let row = 0; row < 8; row++) {
    const yBase = row * 64;
    ctx.fillStyle = row % 2 === 0 ? '#7D562C' : '#63421F';
    ctx.fillRect(0, yBase, w, 64);

    // Leaf frond striations
    for (let x = 0; x < w; x += 6) {
      ctx.strokeStyle = x % 12 === 0 ? 'rgba(214, 170, 85, 0.28)' : 'rgba(38, 22, 8, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, yBase);
      ctx.lineTo(x + (row % 2 === 0 ? 8 : -8), yBase + 64);
      ctx.stroke();
    }

    // Horizontal overlap shadow
    ctx.fillStyle = 'rgba(25, 14, 4, 0.55)';
    ctx.fillRect(0, yBase + 58, w, 6);
  }

  const tex = configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy, 2, 2);
  textureCache.set(key, tex);
  return tex;
}

/**
 * Dynamic woven brocade / dyed cloth texture
 */
export function createBrocadeTexture(
  bgHex: string,
  fgHex: string,
  grid?: number[][],
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, w, h);

  // Linen / cotton thread cross-hatch micro-texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  for (let i = 0; i < w; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(w, i);
    ctx.stroke();
  }

  // Draw traditional geometric motif band across the cloth
  const pattern = grid && grid.length === 8
    ? grid
    : [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 0, 0, 1, 1, 0],
        [1, 1, 0, 1, 1, 0, 1, 1],
        [1, 1, 0, 1, 1, 0, 1, 1],
        [0, 1, 1, 0, 0, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
      ];

  ctx.fillStyle = fgHex;
  const cell = 16;
  for (let repX = 0; repX < 4; repX++) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (pattern[r][c] === 1) {
          const px = repX * 128 + c * cell;
          const py = 192 + r * cell;
          ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
        }
      }
    }
  }

  // Decorative gold border stripes
  ctx.fillStyle = '#D6AA55';
  ctx.fillRect(0, 180, w, 6);
  ctx.fillRect(0, 326, w, 6);

  return configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
}
