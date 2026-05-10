# CSS Avatar Generator

Generate unique avatars from any name or string — built entirely from CSS shapes, no canvas, no images, no dependencies.

**[Try it live →](https://them1ddlem1n.github.io/css-avatar-gen/)**

---

## What it does

Type any name and it spits out a deterministic avatar. Same input always produces the same result — useful for placeholder profile pictures, design mockups, or just messing around.

Everything you see is a `<div>` styled with CSS. No `<canvas>`, no WebGL, no image files, no build step.

## Features

**Avatars**
- 4 face shapes — circle, squircle, hexagon, shield
- 12 color palettes
- Randomized traits — glasses, hats, earrings, blush, winking eye, open mouth
- Idle animations — blinking, face bob, hat tip (toggle with ◎)

**Tabs**
- Grid — 16 variations of any seed at once, click to copy SVG
- Single — large avatar with full trait breakdown
- Showcase — 24 preset named avatars to browse
- ⚔ Battle — two names fight, winner decided by hash power
- ⇄ Compare — side-by-side trait diff, differences highlighted

**Export**
- Download as SVG
- Copy as a drop-in HTML + CSS snippet
- Copy as a self-contained React component

**Other**
- URL sharing — seed syncs to `?seed=Alice` so any avatar is linkable
- Avatar of the Day — changes daily, same for everyone
- Light and dark mode, persisted across sessions

## Getting started

```bash
git clone https://github.com/them1ddlem1n/css-avatar-gen.git
cd css-avatar-gen
open index.html
```

No install, no build step. Just open the file.

Or visit the [live demo](https://them1ddlem1n.github.io/css-avatar-gen/).

## How it works

Each seed string runs through an FNV-1a hash, which feeds an LCG random number generator. That produces a stable sequence of numbers used to pick the palette, shape, mouth, and accessories. Same seed means same sequence means same avatar every time.

The battle tab works the same way — it just compares the raw hash values of the two seeds and whoever's higher wins. Completely deterministic, completely silly.

## License is MIT

Enjoy!
