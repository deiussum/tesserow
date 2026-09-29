// Renders every app icon file from Resources/Icon/icon-grid.txt (run via `npm run icon`).
//
// Large sizes come from a detailed 1024px master (grid lines, double-crochet X
// marks). Sizes up to 48px are drawn on whole pixels instead - downsampling the
// master blurs a cell grid into haze at those sizes. See the add-app-icon
// OpenSpec change for the design.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Jimp, ResizeStrategy } from 'jimp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ICON_DIR = join(ROOT, 'Resources', 'Icon');
const TAURI_ICONS = join(ROOT, 'src-tauri', 'icons');

// Navy and amber from src/theme.ts, plus a lighter navy for alternate rows and a
// darker amber for the X marks.
const NAVY = [0x05, 0x40, 0x5c];
const NAVY_ROW = [0x0a, 0x54, 0x78];
const AMBER = [0xf2, 0xb5, 0x44];
const AMBER_MARK = [0xc4, 0x8a, 0x22];
const GRID = [0x03, 0x2c, 0x40];
const CORNER_RADIUS = 0.16; // fraction of the icon's width

const grid = readFileSync(join(ICON_DIR, 'icon-grid.txt'), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => [...line].map((ch) => ch === '#'));
const N = grid.length;
if (grid.some((row) => row.length !== N)) throw new Error('icon-grid.txt must be a square grid');

function cellColor(row, col) {
    if (grid[row][col]) return AMBER;
    return row % 2 === 0 ? NAVY : NAVY_ROW;
}

function insideRoundedSquare(x, y, size) {
    const r = size * CORNER_RADIUS;
    const cx = Math.min(Math.max(x, r), size - r);
    const cy = Math.min(Math.max(y, r), size - r);
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

function setPixel(image, x, y, [r, g, b], a = 255) {
    const i = (y * image.bitmap.width + x) * 4;
    image.bitmap.data[i] = r;
    image.bitmap.data[i + 1] = g;
    image.bitmap.data[i + 2] = b;
    image.bitmap.data[i + 3] = a;
}

/** Detailed master: drawn at 2x and downsampled once so lines and corners are smooth. */
async function renderMaster(size) {
    const s = size * 2;
    const cs = s / N;
    const markWidth = cs / 14;
    const gridWidth = cs / 22;
    const inset = cs * 0.2;
    const image = new Jimp({ width: s, height: s, color: 0x00000000 });
    for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
            if (!insideRoundedSquare(x + 0.5, y + 0.5, s)) continue;
            const col = Math.min(N - 1, Math.floor(x / cs));
            const row = Math.min(N - 1, Math.floor(y / cs));
            const u = x + 0.5 - col * cs;
            const v = y + 0.5 - row * cs;
            let color = cellColor(row, col);
            const inMark = u >= inset && u <= cs - inset && v >= inset && v <= cs - inset
                && (Math.abs(u - v) <= markWidth / 2 || Math.abs(u + v - cs) <= markWidth / 2);
            if (grid[row][col] && inMark) color = AMBER_MARK;
            const onGrid = Math.min(u, cs - u) <= gridWidth / 2 || Math.min(v, cs - v) <= gridWidth / 2;
            if (onGrid) color = GRID;
            setPixel(image, x, y, color);
        }
    }
    image.resize({ w: size, h: size, mode: ResizeStrategy.BICUBIC });
    return image;
}

/** Whole-pixel render: each cell is `scale` x `scale` pixels, no grid lines or marks. */
function renderPixelExact(scale, canvasSize = N * scale) {
    const artSize = N * scale;
    const offset = (canvasSize - artSize) / 2;
    const image = new Jimp({ width: canvasSize, height: canvasSize, color: 0x00000000 });
    for (let y = 0; y < artSize; y++) {
        for (let x = 0; x < artSize; x++) {
            if (!insideRoundedSquare(x + 0.5, y + 0.5, artSize)) continue;
            setPixel(image, x + offset, y + offset, cellColor(Math.floor(y / scale), Math.floor(x / scale)));
        }
    }
    return image;
}

/** PNG-in-ICO container (Vista+ format), one entry per image, smallest first. */
function writeIco(path, pngs) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(pngs.length, 4);
    const entries = [];
    let offset = 6 + 16 * pngs.length;
    for (const { size, data } of pngs) {
        const entry = Buffer.alloc(16);
        entry.writeUInt8(size >= 256 ? 0 : size, 0);
        entry.writeUInt8(size >= 256 ? 0 : size, 1);
        entry.writeUInt16LE(1, 4);
        entry.writeUInt16LE(32, 6);
        entry.writeUInt32LE(data.length, 8);
        entry.writeUInt32LE(offset, 12);
        entries.push(entry);
        offset += data.length;
    }
    writeFileSync(path, Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]));
}

/**
 * The Tauri CLI writes .icns entries in a different order on every run (the
 * entries' bytes don't change); sort them so regenerating is reproducible.
 */
function normalizeIcns(path) {
    const data = readFileSync(path);
    const entries = [];
    for (let i = 8; i < data.length;) {
        const length = data.readUInt32BE(i + 4);
        entries.push({ type: data.toString('latin1', i, i + 4), bytes: data.subarray(i, i + length) });
        i += length;
    }
    if (entries.some((e) => e.type === 'TOC ')) throw new Error('icns has a TOC entry; sorting would invalidate it');
    entries.sort((a, b) => (a.type < b.type ? -1 : a.type > b.type ? 1 : 0));
    writeFileSync(path, Buffer.concat([data.subarray(0, 8), ...entries.map((e) => e.bytes)]));
}

const png = (image) => image.getBuffer('image/png');

const masterPath = join(ICON_DIR, 'icon-1024.png');
const master = await renderMaster(1024);
writeFileSync(masterPath, await png(master));

const small = {
    16: renderPixelExact(1),
    24: renderPixelExact(1, 24),
    32: renderPixelExact(2),
    48: renderPixelExact(3),
};
for (const [size, image] of Object.entries(small)) {
    writeFileSync(join(ICON_DIR, `icon-${size}.png`), await png(image));
}

// Let the Tauri CLI produce the large PNGs, .icns, and Windows Store logos, then
// keep only the files this project uses (it also emits android/ and ios/).
const tmp = mkdtempSync(join(tmpdir(), 'tesserow-icon-'));
try {
    execFileSync('npx', ['tauri', 'icon', masterPath, '-o', tmp], { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
    const kept = ['128x128.png', '128x128@2x.png', 'icon.png', 'icon.icns', 'StoreLogo.png',
        ...[30, 44, 71, 89, 107, 142, 150, 284, 310].map((n) => `Square${n}x${n}Logo.png`)];
    for (const name of kept) copyFileSync(join(tmp, name), join(TAURI_ICONS, name));
    normalizeIcns(join(TAURI_ICONS, 'icon.icns'));
} finally {
    rmSync(tmp, { recursive: true, force: true });
}

writeFileSync(join(TAURI_ICONS, '32x32.png'), await png(small[32]));

const fromMaster = async (size) => png(master.clone().resize({ w: size, h: size, mode: ResizeStrategy.BICUBIC }));
writeIco(join(TAURI_ICONS, 'icon.ico'), [
    { size: 16, data: await png(small[16]) },
    { size: 24, data: await png(small[24]) },
    { size: 32, data: await png(small[32]) },
    { size: 48, data: await png(small[48]) },
    { size: 64, data: await fromMaster(64) },
    { size: 256, data: await fromMaster(256) },
]);

console.log('Rendered icons into Resources/Icon/ and src-tauri/icons/');
