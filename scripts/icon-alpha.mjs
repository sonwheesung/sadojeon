#!/usr/bin/env node
// Convert PNG icons into clean silhouette icons (pure black + sharp alpha)
// AND normalize their visible size so every icon renders at a consistent
// tab-bar visual size.
//
// Pipeline:
//   1. Alpha processing — fresh / invert / sharpen / invert-alpha / auto
//   2. Normalize — trim transparent borders, pad to square, resize to
//      TARGET_SIZE so content longest side = (1 - 2 * PADDING_RATIO).
//
// Usage:
//   node scripts/icon-alpha.mjs <input.png> [output.png]
//      [--fresh | --invert | --sharpen | --invert-alpha | --auto]
//      [--no-normalize]
//   node scripts/icon-alpha.mjs <directory>  [flags]
//
// Defaults: --auto for alpha, normalize on.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SLOPE = 4.0;
const FLOOR = 80;
const CEIL = 220;
// All icons get a fixed canvas HEIGHT. Canvas WIDTH varies with content
// aspect ratio. Content fills CONTENT_HEIGHT_RATIO of canvas height; canvas
// width = (content_width_scaled) / (1 - 2 * SIDE_PADDING).
//
// Why: when icons render at a fixed pixel height in the tab bar (via
// aspectRatio + height), elongated icons get wider while keeping the same
// height as compact icons. Heights stay consistent across the row.
const CANVAS_HEIGHT = 512;
const CONTENT_HEIGHT_RATIO = 0.72;   // content height = 72% of canvas height
const SIDE_PADDING_RATIO = 0.06;     // 6% horizontal padding on each side

function applyThreshold(a) {
  if (a < FLOOR) return 0;
  if (a > CEIL) return 255;
  return Math.round(((a - FLOOR) / (CEIL - FLOOR)) * 255);
}

// Brightness-based thresholding. Robust against cream / paper-textured
// "background not pure white" cases that broke the distance-from-white approach.
// Tight cutoffs to eliminate soft drop-shadow halos around silhouettes.
const BRIGHT_BG = 130;  // brightness above this is considered background (transparent)
const BRIGHT_FG = 80;   // brightness below this is considered foreground (opaque)

function brightness(r, g, b) {
  return (r + g + b) / 3;
}

function detectMode(_data, _width, _height, _channels) {
  // Default to 'fresh' (dark-on-light). Use --invert explicitly for
  // light-on-dark sources. Auto-detection of polarity from a mixed-content
  // PNG is unreliable — wuxia icons are almost always dark silhouettes.
  return 'fresh';
}

function processFresh(out, channels) {
  // dark silhouette on bright background. Bright bg → α=0, dark fg → α=255.
  // Alpha-aware: respect source α=0 regions (true transparency) and modulate
  // the brightness-derived alpha by the source alpha so anti-alias edges from
  // the source are preserved smoothly.
  for (let i = 0; i < out.length; i += channels) {
    const r = out[i];
    const g = out[i + 1];
    const bl = out[i + 2];
    const srcA = out[i + 3];
    out[i] = 0; out[i + 1] = 0; out[i + 2] = 0;
    if (srcA === 0) {
      out[i + 3] = 0;
      continue;
    }
    const b = brightness(r, g, bl);
    let rgbA;
    if (b >= BRIGHT_BG) rgbA = 0;
    else if (b <= BRIGHT_FG) rgbA = 255;
    else rgbA = Math.round(((BRIGHT_BG - b) / (BRIGHT_BG - BRIGHT_FG)) * 255);
    out[i + 3] = Math.round((srcA * rgbA) / 255);
  }
}

function processInvert(out, channels) {
  // bright silhouette on dark background. Dark bg → α=0, bright fg → α=255.
  // Alpha-aware: same modulation pattern as fresh.
  const DARK_BG = 60;
  const DARK_FG = 180;
  for (let i = 0; i < out.length; i += channels) {
    const r = out[i];
    const g = out[i + 1];
    const bl = out[i + 2];
    const srcA = out[i + 3];
    out[i] = 0; out[i + 1] = 0; out[i + 2] = 0;
    if (srcA === 0) {
      out[i + 3] = 0;
      continue;
    }
    const b = brightness(r, g, bl);
    let rgbA;
    if (b <= DARK_BG) rgbA = 0;
    else if (b >= DARK_FG) rgbA = 255;
    else rgbA = Math.round(((b - DARK_BG) / (DARK_FG - DARK_BG)) * 255);
    out[i + 3] = Math.round((srcA * rgbA) / 255);
  }
}

function processSharpen(out, channels) {
  for (let i = 0; i < out.length; i += channels) {
    const a = out[i + 3];
    out[i] = 0; out[i + 1] = 0; out[i + 2] = 0;
    out[i + 3] = applyThreshold(a);
  }
}

function processInvertAlpha(out, channels) {
  for (let i = 0; i < out.length; i += channels) {
    const a = out[i + 3];
    out[i] = 0; out[i + 1] = 0; out[i + 2] = 0;
    out[i + 3] = applyThreshold(255 - a);
  }
}

function processPreserve(out, channels) {
  // Source alpha is already clean. Flatten RGB to (0,0,0) so RN Web's
  // CSS mask-image doesn't read dirty RGB under α=0. Keep alpha untouched.
  for (let i = 0; i < out.length; i += channels) {
    out[i] = 0;
    out[i + 1] = 0;
    out[i + 2] = 0;
  }
}

// Pixels below this alpha don't count toward the content bbox. Drop-shadow
// halos with partial alpha get cropped out as a result, keeping icons tight.
const BBOX_ALPHA_MIN = 100;

function findContentBbox(data, width, height, channels) {
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] >= BBOX_ALPHA_MIN) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY, contentW: maxX - minX + 1, contentH: maxY - minY + 1 };
}

async function normalize(rawBuf, width, height) {
  const { minX, minY, maxX, maxY, contentW, contentH } = findContentBbox(rawBuf, width, height, 4);

  if (maxX < 0) {
    return await sharp(rawBuf, { raw: { width, height, channels: 4 } })
      .resize(CANVAS_HEIGHT, CANVAS_HEIGHT)
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  // Scale content so its height is a fixed fraction of CANVAS_HEIGHT.
  // Canvas width then varies to fit the scaled content plus side padding.
  const targetContentH = Math.round(CANVAS_HEIGHT * CONTENT_HEIGHT_RATIO);
  const scale = targetContentH / contentH;
  const targetContentW = Math.round(contentW * scale);
  const canvasWidth = Math.round(targetContentW / (1 - 2 * SIDE_PADDING_RATIO));
  const padX = Math.floor((canvasWidth - targetContentW) / 2);
  const padY = Math.floor((CANVAS_HEIGHT - targetContentH) / 2);
  const padXRight = canvasWidth - targetContentW - padX;
  const padYBottom = CANVAS_HEIGHT - targetContentH - padY;

  // Convert raw buffer to a PNG buffer first so sharp's extract/resize/extend
  // chain works reliably (chaining on raw input has known quirks).
  const pngBuf = await sharp(rawBuf, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 0 })
    .toBuffer();

  // Extract content, scale to target dims, then extend with transparent padding.
  const scaled = await sharp(pngBuf)
    .extract({ left: minX, top: minY, width: contentW, height: contentH })
    .resize(targetContentW, targetContentH)
    .png({ compressionLevel: 0 })
    .toBuffer();

  return await sharp(scaled)
    .extend({
      top: padY,
      bottom: padYBottom,
      left: padX,
      right: padXRight,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function processFile(input, output, mode, doNormalize) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.from(data);

  let resolvedMode = mode;
  if (mode === 'auto') resolvedMode = detectMode(out, width, height, channels);

  switch (resolvedMode) {
    case 'fresh': processFresh(out, channels); break;
    case 'invert': processInvert(out, channels); break;
    case 'sharpen': processSharpen(out, channels); break;
    case 'invert-alpha': processInvertAlpha(out, channels); break;
    case 'preserve': processPreserve(out, channels); break;
    default: throw new Error(`Unknown mode: ${resolvedMode}`);
  }

  let buf;
  if (doNormalize) {
    buf = await normalize(out, width, height);
  } else {
    buf = await sharp(out, { raw: { width, height, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  await fs.writeFile(output, buf);
  const stat = await fs.stat(output);
  const finalMeta = await sharp(buf).metadata();
  console.log(`✓ ${path.basename(input)} → ${path.basename(output)}  ${finalMeta.width}×${finalMeta.height}  ${(stat.size / 1024).toFixed(1)}KB  mode=${resolvedMode}${doNormalize ? ' +normalize' : ''}`);
}

async function main() {
  const args = process.argv.slice(2);
  let mode = 'auto';
  if (args.includes('--fresh')) mode = 'fresh';
  else if (args.includes('--invert')) mode = 'invert';
  else if (args.includes('--sharpen')) mode = 'sharpen';
  else if (args.includes('--invert-alpha')) mode = 'invert-alpha';
  else if (args.includes('--preserve')) mode = 'preserve';
  const doNormalize = !args.includes('--no-normalize');
  const positional = args.filter((a) => !a.startsWith('--'));
  const [input, output] = positional;
  if (!input) {
    console.error('Usage: node scripts/icon-alpha.mjs <file.png|dir> [output.png] [--fresh|--invert|--sharpen|--invert-alpha|--auto] [--no-normalize]');
    process.exit(1);
  }
  const stat = await fs.stat(input);
  if (stat.isDirectory()) {
    const entries = await fs.readdir(input);
    const pngs = entries.filter((f) => f.toLowerCase().endsWith('.png'));
    for (const f of pngs) {
      const p = path.join(input, f);
      await processFile(p, p, mode, doNormalize);
    }
    console.log(`Done: ${pngs.length} file(s).`);
  } else {
    await processFile(input, output ?? input, mode, doNormalize);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
