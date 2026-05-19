#!/usr/bin/env node
import sharp from 'sharp';

const [input] = process.argv.slice(2);
if (!input) {
  console.error('Usage: node scripts/icon-inspect.mjs <file.png>');
  process.exit(1);
}

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const buckets = new Array(11).fill(0);
let cornerAlphas = [];
let totalPx = width * height;

for (let i = 0; i < data.length; i += channels) {
  const a = data[i + 3];
  buckets[Math.min(10, Math.floor(a / 25.5))]++;
}

const corners = [
  [0, 0],
  [width - 1, 0],
  [0, height - 1],
  [width - 1, height - 1],
];
for (const [x, y] of corners) {
  const idx = (y * width + x) * channels;
  cornerAlphas.push({
    pos: [x, y],
    r: data[idx],
    g: data[idx + 1],
    b: data[idx + 2],
    a: data[idx + 3],
  });
}

console.log(`File: ${input}`);
console.log(`Size: ${width}x${height}  channels: ${channels}`);
console.log('Alpha histogram (0..255 binned):');
buckets.forEach((count, i) => {
  const range = `${(i * 25.5).toFixed(0)}-${((i + 1) * 25.5 - 1).toFixed(0)}`;
  const pct = ((count / totalPx) * 100).toFixed(2);
  const bar = '#'.repeat(Math.round(pct / 2));
  console.log(`  α ${range.padStart(7)}: ${count.toString().padStart(8)}px (${pct.padStart(6)}%) ${bar}`);
});

console.log('Corner pixels (should be alpha=0 for transparent background):');
cornerAlphas.forEach(({ pos, r, g, b, a }) => {
  console.log(`  (${pos[0]},${pos[1]}): rgba(${r},${g},${b},${a})`);
});
