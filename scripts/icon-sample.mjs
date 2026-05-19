#!/usr/bin/env node
// Sample pixel RGBA values at specific points in an image.
import sharp from 'sharp';

const [input] = process.argv.slice(2);
const points = [
  [0.5, 0.5],   // center (paper interior expected)
  [0.5, 0.35],  // upper paper
  [0.5, 0.65],  // lower paper
  [0.25, 0.5],  // left edge area (near outline)
  [0.05, 0.5],  // far left (background)
  [0.5, 0.05],  // top edge (background)
];

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
console.log(`File: ${input} (${width}×${height})`);
for (const [fx, fy] of points) {
  const x = Math.floor(fx * width);
  const y = Math.floor(fy * height);
  const idx = (y * width + x) * channels;
  const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
  const brightness = ((r + g + b) / 3).toFixed(0);
  console.log(`  (${(fx * 100).toFixed(0)}%, ${(fy * 100).toFixed(0)}%) at (${x}, ${y}): rgba(${r}, ${g}, ${b}, ${a})  brightness=${brightness}`);
}
