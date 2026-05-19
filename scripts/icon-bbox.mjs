#!/usr/bin/env node
// Inspect content bounding box (non-transparent area) of icon PNGs.
// Reports content fill ratio so we can normalize sizes across icons.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

async function bboxFile(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const fillW = (cw / width * 100).toFixed(1);
  const fillH = (ch / height * 100).toFixed(1);
  console.log(
    `${path.basename(input).padEnd(20)}  canvas ${width}×${height}  bbox ${cw}×${ch}  fill ${fillW}%w × ${fillH}%h  longest ${Math.max(cw, ch)}/${Math.max(width, height)} = ${(Math.max(cw, ch) / Math.max(width, height) * 100).toFixed(1)}%`
  );
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/icon-bbox.mjs <file.png|dir>');
  process.exit(1);
}
for (const arg of args) {
  const stat = await fs.stat(arg);
  if (stat.isDirectory()) {
    const entries = await fs.readdir(arg);
    for (const f of entries.filter((x) => x.toLowerCase().endsWith('.png'))) {
      await bboxFile(path.join(arg, f));
    }
  } else {
    await bboxFile(arg);
  }
}
