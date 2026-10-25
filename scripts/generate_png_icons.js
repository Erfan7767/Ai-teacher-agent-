import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk: width, height, bit depth (8), color type (6 = RGBA), compression (0), filter (0), interlace (0)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data with 0 filter byte per row
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) / 2;
  const badgeRadius = isMaskable ? maxRadius : maxRadius * 0.92;
  const safeInnerRadius = maxRadius * 0.58;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background: Android Dark Indigo / Deep Blue gradient
      const t = (x + y) / (width + height);
      let r = Math.round(26 + (66 - 26) * t);   // #1a... to #42...
      let g = Math.round(30 + (133 - 30) * t);  // #1e... to #85...
      let b = Math.round(54 + (244 - 54) * t);  // #36... to #f4...
      let a = 255;

      if (!isMaskable && dist > badgeRadius) {
        a = 0; // transparent corners for non-maskable
      } else {
        // Draw Android robot antennae & glowing spark / graduation tutor icon
        // Outer glow ring
        if (dist > safeInnerRadius * 0.95 && dist < safeInnerRadius * 1.05) {
          r = 0x3d; g = 0xdc; b = 0x84; // Android Green accent #3DDC84
        }
        // Inner tutor circle / android icon center
        if (dist < safeInnerRadius * 0.8) {
          // Android green to cyan gradient
          const it = (y - (cy - safeInnerRadius * 0.8)) / (safeInnerRadius * 1.6);
          r = Math.round(0x3d + (0x42 - 0x3d) * Math.max(0, Math.min(1, it)));
          g = Math.round(0xdc + (0x85 - 0xdc) * Math.max(0, Math.min(1, it)));
          b = Math.round(0x84 + (0xf4 - 0x84) * Math.max(0, Math.min(1, it)));
        }

        // Add sleek eyes/white sparks in center
        const eyeOffset = safeInnerRadius * 0.28;
        const eyeRadius = safeInnerRadius * 0.12;
        const dLeftEye = Math.hypot(x - (cx - eyeOffset), y - (cy - eyeOffset * 0.4));
        const dRightEye = Math.hypot(x - (cx + eyeOffset), y - (cy - eyeOffset * 0.4));
        if (dLeftEye < eyeRadius || dRightEye < eyeRadius) {
          r = 255; g = 255; b = 255;
        }

        // Graduation cap / smile curve at bottom
        const smileDist = Math.abs(Math.hypot(x - cx, y - (cy + eyeOffset * 0.2)) - safeInnerRadius * 0.4);
        if (smileDist < safeInnerRadius * 0.08 && y > cy + eyeOffset * 0.1 && Math.abs(x - cx) < safeInnerRadius * 0.4) {
          r = 255; g = 255; b = 255;
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate files in public/
const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 192x192
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
// 512x512
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
// 512x512 maskable (full bleed background for Android adaptive icon)
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
// apple-touch-icon 180x180
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, true));
// favicon
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(64, 64, false));

// SVG icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A1C29" />
      <stop offset="50%" stop-color="#2D3B68" />
      <stop offset="100%" stop-color="#4285F4" />
    </linearGradient>
    <linearGradient id="androidGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3DDC84" />
      <stop offset="100%" stop-color="#26A69A" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <!-- Background with rounded squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  
  <!-- Outer glowing accent ring -->
  <circle cx="256" cy="256" r="170" fill="none" stroke="#3DDC84" stroke-width="8" opacity="0.8" filter="url(#glow)" />
  <circle cx="256" cy="256" r="145" fill="url(#androidGreen)" />
  
  <!-- Android Antennae -->
  <line x1="210" y1="130" x2="175" y2="85" stroke="#3DDC84" stroke-width="12" stroke-linecap="round" />
  <line x1="302" y1="130" x2="337" y2="85" stroke="#3DDC84" stroke-width="12" stroke-linecap="round" />
  <circle cx="170" cy="80" r="10" fill="#3DDC84" />
  <circle cx="342" cy="80" r="10" fill="#3DDC84" />

  <!-- Tutor Graduation Cap / Hat on top -->
  <path d="M 256 150 L 370 195 L 256 240 L 142 195 Z" fill="#FFFFFF" opacity="0.95" />
  <path d="M 350 205 L 350 245 L 340 250 L 340 209 Z" fill="#FFD54F" />

  <!-- Expressive Eyes -->
  <circle cx="215" cy="265" r="20" fill="#1A1C29" />
  <circle cx="297" cy="265" r="20" fill="#1A1C29" />
  <circle cx="220" cy="260" r="6" fill="#FFFFFF" />
  <circle cx="302" cy="260" r="6" fill="#FFFFFF" />

  <!-- Friendly Smile -->
  <path d="M 215 315 Q 256 355 297 315" fill="none" stroke="#1A1C29" stroke-width="10" stroke-linecap="round" />
  
  <!-- Soundwaves / Speech Indicator for Live Voice -->
  <path d="M 90 256 Q 70 210 90 170" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.6" />
  <path d="M 70 270 Q 45 210 70 150" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.4" />
  <path d="M 422 256 Q 442 210 422 170" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.6" />
  <path d="M 442 270 Q 467 210 442 150" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.4" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon, 'utf8');
console.log('All PWA and Android icons generated successfully in public/');
