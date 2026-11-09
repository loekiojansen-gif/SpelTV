import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, getPixel) {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        if ((crc ^ byte) & 1) {
          crc = (crc >>> 1) ^ 0xedb88320;
        } else {
          crc = crc >>> 1;
        }
        byte >>>= 1;
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Draw the Pub Golf Icon:
// Vibrant Lime #a3e635 background matching the top-left icon in the header ⛳
function drawGolfIcon(x, y, w, h, isMaskable = false) {
  const nx = x / w;
  const ny = y / h;

  // Base background is vibrant lime #a3e635
  const lime = [163, 230, 53, 255]; // #a3e635
  const scale = isMaskable ? 0.8 : 1.0;
  const cx = 0.5;
  const cy = 0.5;

  // Transform coordinates relative to center
  const tx = (nx - cx) / scale + cx;
  const ty = (ny - cy) / scale + cy;

  // Putting Green (ellipse around cx=0.5, cy=0.75, rx=0.28, ry=0.09)
  const ex = (tx - 0.5) / 0.28;
  const ey = (ty - 0.75) / 0.09;
  if (ex * ex + ey * ey <= 1) {
    // Green hole cup (ellipse at cx=0.44, cy=0.76, rx=0.06, ry=0.026)
    const hx = (tx - 0.44) / 0.06;
    const hy = (ty - 0.76) / 0.026;
    if (hx * hx + hy * hy <= 1) {
      return [6, 26, 18, 255]; // hole cup dark
    }
    return [22, 163, 74, 255]; // emerald green
  }

  // White Golf Ball at (cx=0.62, cy=0.76, r=0.032)
  const bx = (tx - 0.62) / 0.032;
  const by = (ty - 0.76) / 0.032;
  if (bx * bx + by * by <= 1) {
    return [255, 255, 255, 255];
  }

  // Bold Dark Flagpole: x in [0.43, 0.45], y in [0.22, 0.76]
  if (tx >= 0.43 && tx <= 0.45 && ty >= 0.22 && ty <= 0.76) {
    return [6, 26, 18, 255];
  }

  // Gold ball at top of pole (cx=0.44, cy=0.21, r=0.026)
  const gx = (tx - 0.44) / 0.026;
  const gy = (ty - 0.21) / 0.026;
  if (gx * gx + gy * gy <= 1) {
    return [250, 204, 21, 255]; // gold pin top
  }

  // Triangular Vibrant Red Flag (⛳): x from 0.45 to 0.72, y from 0.23 to 0.47
  // Triangle between (0.45, 0.23), (0.72, 0.35), (0.45, 0.47)
  if (tx >= 0.45 && tx <= 0.72 && ty >= 0.23 && ty <= 0.47) {
    const t = (tx - 0.45) / (0.72 - 0.45);
    const topY = 0.23 + t * 0.12;
    const botY = 0.47 - t * 0.12;
    if (ty >= topY && ty <= botY) {
      return [239, 68, 68, 255]; // vibrant red flag
    }
  }

  return lime;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 192x192
const pwa192 = createPNG(192, 192, (x, y, w, h) => drawGolfIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

// 512x512
const pwa512 = createPNG(512, 512, (x, y, w, h) => drawGolfIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

// Maskable 512x512 (with safe zone scaling)
const pwaMaskable = createPNG(512, 512, (x, y, w, h) => drawGolfIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);

// Apple touch icon 180x180
const appleTouch = createPNG(180, 180, (x, y, w, h) => drawGolfIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

console.log('Successfully generated all PWA icons with header top-left icon matching!');
