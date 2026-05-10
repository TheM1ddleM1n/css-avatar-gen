# CSS Avatar Generator

Generate unique avatars from any name or string — built entirely from CSS shapes, no canvas, no images, no dependencies.

**[Try it live →](https://them1ddlem1n.github.io/css-avatar-gen/)**

---

## What it does

Type any name (or anything really) and it generates a deterministic avatar for it. Same input always produces the same avatar. Useful for placeholder profile pictures, testing UIs, or just messing around.

Avatars are made of pure CSS — circles, rectangles, borders — no `<canvas>`, no WebGL, no image files.

## Features

- 5 face shapes (circle, squircle, hexagon, diamond, shield)
- 12 color palettes
- Randomized traits — glasses, hats, earrings, blush, winking eyes, and more
- **Grid view** — see 16 variations of a seed at once
- **Single view** — large avatar with a full trait breakdown
- **Showcase** — 24 preset named avatars to browse
- Click any avatar to copy it as an SVG
- Export button to download the current avatar as an `.svg` file
- No build step, no dependencies — just open `index.html`

## Getting started

```bash
git clone https://github.com/them1ddlem1n/css-avatar-gen.git
cd css-avatar-gen
open index.html
```

Or just visit the [live demo](https://them1ddlem1n.github.io/css-avatar-gen/).

## How it works

Each seed string gets run through a FNV-1a hash, which feeds a simple LCG random number generator. That gives a stable sequence of numbers used to pick palette, shape, mouth, accessories, and so on. Same seed → same sequence → same avatar every time.

Everything you see is a `<div>` styled with CSS — border-radius for shapes, borders for mouths and glasses, absolute positioning for accessories.

## Files
- `index.html`   — markup and layout
- `style.css`    — all the shapes and styles
- `script.js`    — avatar generation logic

## License is MIT

Enjoy!
