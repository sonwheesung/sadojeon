#!/usr/bin/env node
// Zero out RGB channels where alpha is 0. Some RN Web / browser mask-image
// implementations misrender PNGs that have non-(0,0,0) RGB under α=0 — they
// read the RGB as part of the mask. Cleaning RGB to 0 in invisible regions
// fixes the bug without altering any visible pixel.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

async function processFile(input, output = input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.from(data);

  let cleaned = 0;
  for (let i = 0; i < out.length; i += channels) {
    if (out[i + 3] === 0) {
      if (out[i] !== 0 || out[i + 1] !== 0 || out[i + 2] !== 0) cleaned++;
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
    }
  }

  const buf = await sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  await fs.writeFile(output, buf);
  const stat = await fs.stat(output);
  console.log(`✓ ${path.basename(input)}  ${width}×${height}  ${(stat.size / 1024).toFixed(1)}KB  cleaned ${cleaned} hidden RGB pixels`);
}

const [input] = process.argv.slice(2);
if (!input) {
  console.error('Usage: node scripts/icon-clean-rgb.mjs <file.png>');
  process.exit(1);
}
const stat = await fs.stat(input);
if (stat.isDirectory()) {
  const entries = await fs.readdir(input);
  for (const f of entries.filter((x) => x.toLowerCase().endsWith('.png'))) {
    await processFile(path.join(input, f));
  }
} else {
  await processFile(input);
}
