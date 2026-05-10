function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length)];
}

const PALETTES = [
  { face: '#f4a261', accent: '#e76f51', name: 'Sunset' },
  { face: '#a8dadc', accent: '#457b9d', name: 'Ocean' },
  { face: '#b5ead7', accent: '#6bcba0', name: 'Mint' },
  { face: '#ffd6ff', accent: '#c77dff', name: 'Lavender' },
  { face: '#ffb4a2', accent: '#ff6b6b', name: 'Coral' },
  { face: '#caffbf', accent: '#52b788', name: 'Forest' },
  { face: '#ffc6ff', accent: '#f72585', name: 'Bubblegum' },
  { face: '#f1c0e8', accent: '#b5179e', name: 'Berry' },
  { face: '#ffe066', accent: '#f4a261', name: 'Citrus' },
  { face: '#90e0ef', accent: '#0077b6', name: 'Sky' },
  { face: '#e9c46a', accent: '#264653', name: 'Dusk' },
  { face: '#d8f3dc', accent: '#40916c', name: 'Sage' },
];

const MOUTHS = ['smile', 'neutral', 'smirk', 'open'];
const SHAPES = ['circle', 'squircle', 'hexagon', 'diamond', 'shield'];
const SHAPE_NAMES = {
  circle: 'Circle',
  squircle: 'Squircle',
  hexagon: 'Hexagon',
  diamond: 'Diamond',
  shield: 'Shield',
};

function getBorderRadius(shape) {
  if (shape === 'circle') return '50%';
  if (shape === 'squircle') return '30%';
  if (shape === 'hexagon') return '15% 30% 15% 30% / 30% 15% 30% 15%';
  if (shape === 'diamond') return '0';
  if (shape === 'shield') return '50% 50% 40% 40% / 60% 60% 40% 40%';
  return '50%';
}

function getDiamondTransform(shape) {
  return shape === 'diamond' ? 'rotate(45deg)' : 'none';
}

function buildAvatarData(seed) {
  const h = hash(seed);
  const rand = seededRand(h);

  const palette = pick(rand, PALETTES);
  const mouth = pick(rand, MOUTHS);
  const shape = pick(rand, SHAPES);
  const hasGlasses = rand() > 0.5;
  const hasHat = rand() > 0.55;
  const hasBlush = rand() > 0.45;
  const hasEarring = rand() > 0.65;
  const winkLeft = rand() > 0.8;
  const eyeScale = 0.8 + rand() * 0.5;

  return { palette, mouth, shape, hasGlasses, hasHat, hasBlush, hasEarring, winkLeft, eyeScale };
}

function buildAvatar(seed, large = false) {
  const data = buildAvatarData(seed);
  const { palette, mouth, shape, hasGlasses, hasHat, hasBlush, hasEarring, winkLeft, eyeScale } = data;

  const wrapper = document.createElement('div');
  wrapper.className = large ? 'avatar large' : 'avatar';

  const face = document.createElement('div');
  face.className = 'face';
  const br = getBorderRadius(shape);
  const rotate = getDiamondTransform(shape);
  face.style.cssText = `background:${palette.face};border-radius:${br};transform:${rotate};`;
  wrapper.appendChild(face);

  if (hasBlush) {
    ['left', 'right'].forEach(side => {
      const blush = document.createElement('div');
      blush.className = `blush ${side}`;
      blush.style.background = palette.accent;
      wrapper.appendChild(blush);
    });
  }

  if (hasEarring) {
    ['left', 'right'].forEach(side => {
      const earring = document.createElement('div');
      earring.className = `earring ${side}`;
      earring.style.cssText = `color:${palette.accent};`;
      earring.style.background = palette.accent;
      wrapper.appendChild(earring);
    });
  }

  const eyes = document.createElement('div');
  eyes.className = 'eyes';
  for (let i = 0; i < 2; i++) {
    const eye = document.createElement('div');
    const wink = i === 0 ? winkLeft : !winkLeft;
    eye.className = wink ? 'eye wink' : 'eye';
    eye.style.transform = `scale(${eyeScale})`;
    eyes.appendChild(eye);
  }
  wrapper.appendChild(eyes);

  if (hasGlasses) {
    const glasses = document.createElement('div');
    glasses.className = 'accessory glasses';
    const l1 = document.createElement('div');
    l1.className = 'lens';
    const bridge = document.createElement('div');
    bridge.className = 'bridge';
    const l2 = document.createElement('div');
    l2.className = 'lens';
    glasses.appendChild(l1);
    glasses.appendChild(bridge);
    glasses.appendChild(l2);
    wrapper.appendChild(glasses);
  }

  const mouthEl = document.createElement('div');
  mouthEl.className = `mouth ${mouth}`;
  wrapper.appendChild(mouthEl);

  if (hasHat) {
    const uid = `hat-${CSS.escape(seed)}`;
    if (!document.getElementById(uid)) {
      const style = document.createElement('style');
      style.id = uid;
      style.textContent = `.${uid}::before,.${uid}::after{background:${palette.accent};}`;
      document.head.appendChild(style);
    }
    const hat = document.createElement('div');
    hat.className = `accessory hat ${uid}`;
    wrapper.appendChild(hat);
  }

  return { el: wrapper, data };
}

function avatarToSVG(seed) {
  const data = buildAvatarData(seed);
  const { palette, mouth, shape, hasGlasses, hasHat, hasBlush, hasEarring, winkLeft } = data;

  const size = 100;
  const cx = 50;
  const cy = 50;
  const r = 42;

  let faceShape;
  if (shape === 'circle') {
    faceShape = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${palette.face}"/>`;
  } else if (shape === 'squircle') {
    faceShape = `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="25" fill="${palette.face}"/>`;
  } else {
    faceShape = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${palette.face}"/>`;
  }

  let mouthSVG = '';
  if (mouth === 'smile') {
    mouthSVG = `<path d="M ${cx - 13} ${cy + 14} Q ${cx} ${cy + 26} ${cx + 13} ${cy + 14}" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  } else if (mouth === 'neutral') {
    mouthSVG = `<line x1="${cx - 10}" y1="${cy + 18}" x2="${cx + 10}" y2="${cy + 18}" stroke="#111" stroke-width="3" stroke-linecap="round"/>`;
  } else if (mouth === 'open') {
    mouthSVG = `<ellipse cx="${cx}" cy="${cy + 18}" rx="8" ry="7" fill="#111"/>`;
  } else {
    mouthSVG = `<path d="M ${cx} ${cy + 14} Q ${cx + 12} ${cy + 22} ${cx + 13} ${cy + 14}" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }

  const eyeL = winkLeft
    ? `<line x1="${cx - 14}" y1="${cy - 8}" x2="${cx - 6}" y2="${cy - 8}" stroke="#111" stroke-width="3" stroke-linecap="round"/>`
    : `<circle cx="${cx - 10}" cy="${cy - 8}" r="5" fill="#111"/><circle cx="${cx - 8}" cy="${cy - 10}" r="1.5" fill="rgba(255,255,255,0.7)"/>`;
  const eyeR = (!winkLeft)
    ? `<line x1="${cx + 6}" y1="${cy - 8}" x2="${cx + 14}" y2="${cy - 8}" stroke="#111" stroke-width="3" stroke-linecap="round"/>`
    : `<circle cx="${cx + 10}" cy="${cy - 8}" r="5" fill="#111"/><circle cx="${cx + 12}" cy="${cy - 10}" r="1.5" fill="rgba(255,255,255,0.7)"/>`;

  const blushSVG = hasBlush
    ? `<ellipse cx="${cx - 22}" cy="${cy + 5}" rx="7" ry="4" fill="${palette.accent}" opacity="0.4"/>
       <ellipse cx="${cx + 22}" cy="${cy + 5}" rx="7" ry="4" fill="${palette.accent}" opacity="0.4"/>`
    : '';

  const glassesSVG = hasGlasses
    ? `<rect x="${cx - 22}" y="${cy - 14}" width="16" height="12" rx="3" stroke="rgba(0,0,0,0.5)" stroke-width="2" fill="none"/>
       <rect x="${cx + 6}" y="${cy - 14}" width="16" height="12" rx="3" stroke="rgba(0,0,0,0.5)" stroke-width="2" fill="none"/>
       <line x1="${cx - 6}" y1="${cy - 8}" x2="${cx + 6}" y2="${cy - 8}" stroke="rgba(0,0,0,0.4)" stroke-width="2"/>`
    : '';

  const hatSVG = hasHat
    ? `<rect x="${cx - 22}" y="${cy - 46}" width="44" height="16" rx="4" fill="${palette.accent}"/>
       <rect x="${cx - 30}" y="${cy - 32}" width="60" height="8" rx="4" fill="${palette.accent}"/>`
    : '';

  const earringSVG = hasEarring
    ? `<circle cx="${cx - r + 2}" cy="${cy + 10}" r="4" fill="${palette.accent}"/>
       <circle cx="${cx + r - 2}" cy="${cy + 10}" r="4" fill="${palette.accent}"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="200" height="200">
${faceShape}
${blushSVG}
${earringSVG}
${eyeL}
${eyeR}
${glassesSVG}
${mouthSVG}
${hatSVG}
</svg>`;
}

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function generateGrid(seedBase) {
  const grid = document.getElementById('avatar-grid');
  grid.innerHTML = '';
  const seeds = Array.from({ length: 16 }, (_, i) =>
    seedBase ? `${seedBase}${i}` : `${Math.random().toString(36).slice(2)}${i}`
  );
  seeds.forEach(seed => {
    const card = document.createElement('div');
    card.className = 'avatar-card';
    const { el } = buildAvatar(seed);
    card.appendChild(el);
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = seed.length > 10 ? seed.slice(0, 10) + '…' : seed;
    card.appendChild(label);
    const hint = document.createElement('span');
    hint.className = 'copy-hint';
    hint.textContent = 'click to copy SVG';
    card.appendChild(hint);
    card.addEventListener('click', () => {
      navigator.clipboard.writeText(avatarToSVG(seed));
      showToast('SVG copied to clipboard!');
    });
    grid.appendChild(card);
  });
}

function updateSingleView(seed) {
  const wrap = document.getElementById('single-avatar-wrap');
  const info = document.getElementById('single-info');
  wrap.innerHTML = '';
  info.innerHTML = '';
  const { el, data } = buildAvatar(seed, true);
  wrap.appendChild(el);
  const fields = [
    { label: 'Palette', value: data.palette.name },
    { label: 'Shape', value: SHAPE_NAMES[data.shape] },
    { label: 'Mouth', value: data.mouth },
    { label: 'Glasses', value: data.hasGlasses ? 'Yes' : 'No' },
    { label: 'Hat', value: data.hasHat ? 'Yes' : 'No' },
    { label: 'Blush', value: data.hasBlush ? 'Yes' : 'No' },
    { label: 'Earring', value: data.hasEarring ? 'Yes' : 'No' },
    { label: 'Wink', value: data.winkLeft ? 'Left' : 'None' },
  ];
  fields.forEach(({ label, value }) => {
    const pill = document.createElement('div');
    pill.className = 'info-pill';
    pill.innerHTML = `<div class="pill-label">${label}</div><div class="pill-value">${value}</div>`;
    info.appendChild(pill);
  });
}

const SHOWCASE_SEEDS = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank',
  'Grace', 'Hank', 'Iris', 'Jack', 'Kara', 'Leo',
  'Mia', 'Nate', 'Olivia', 'Pete', 'Quinn', 'Rosa',
  'Sam', 'Tina', 'Uri', 'Vera', 'Will', 'Xena',
];

function buildShowcase() {
  const grid = document.getElementById('showcase-grid');
  grid.innerHTML = '';
  SHOWCASE_SEEDS.forEach(seed => {
    const card = document.createElement('div');
    card.className = 'showcase-card';
    const { el } = buildAvatar(seed);
    card.appendChild(el);
    const label = document.createElement('span');
    label.textContent = seed;
    card.appendChild(label);
    card.addEventListener('click', () => {
      document.getElementById('seed-input').value = seed;
      updateSingleView(seed);
      generateGrid(seed);
      switchTab('single');
    });
    grid.appendChild(card);
  });
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${name}`));
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

const input = document.getElementById('seed-input');
const clearBtn = document.getElementById('clear-btn');

input.addEventListener('input', () => {
  const val = input.value.trim();
  clearBtn.classList.toggle('visible', val.length > 0);
  if (val.length > 0) {
    generateGrid(val);
    updateSingleView(val);
  }
});

clearBtn.addEventListener('click', () => {
  input.value = '';
  clearBtn.classList.remove('visible');
  generateGrid('');
  updateSingleView('default');
});

document.getElementById('randomize-btn').addEventListener('click', () => {
  const r = Math.random().toString(36).slice(2, 8);
  input.value = r;
  clearBtn.classList.add('visible');
  generateGrid(r);
  updateSingleView(r);
});

document.getElementById('export-btn').addEventListener('click', () => {
  const val = input.value.trim() || 'default';
  const svg = avatarToSVG(val);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `avatar-${val}.svg`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('SVG downloaded!');
});

generateGrid('default');
updateSingleView('default');
buildShowcase();
