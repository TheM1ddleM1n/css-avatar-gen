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
const SHAPES = ['circle', 'squircle', 'hexagon', 'shield', 'github'];
const SHAPE_NAMES = { circle: 'Circle', squircle: 'Squircle', hexagon: 'Hexagon', shield: 'Shield', github: 'GitHub' };

function getBorderRadius(shape) {
  if (shape === 'circle') return '50%';
  if (shape === 'squircle') return '30%';
  if (shape === 'hexagon') return '15% 30% 15% 30% / 30% 15% 30% 15%';
  if (shape === 'shield') return '50% 50% 40% 40% / 60% 60% 40% 40%';
  if (shape === 'github') return '17%';
  return '50%';
}

function buildAvatarData(seed) {
  const h = hash(seed);
  const rand = seededRand(h);
  return {
    palette: pick(rand, PALETTES),
    mouth: pick(rand, MOUTHS),
    shape: pick(rand, SHAPES),
    hasGlasses: rand() > 0.5,
    hasHat: rand() > 0.55,
    hasBlush: rand() > 0.45,
    hasEarring: rand() > 0.65,
    winkLeft: rand() > 0.8,
    eyeScale: 0.8 + rand() * 0.5,
  };
}

let animationsEnabled = false;

function buildAvatar(seed, large = false) {
  const data = buildAvatarData(seed);
  const { palette, mouth, shape, hasGlasses, hasHat, hasBlush, hasEarring, winkLeft, eyeScale } = data;

  const wrapper = document.createElement('div');
  wrapper.className = ['avatar', large ? 'large' : '', animationsEnabled ? 'animated' : ''].filter(Boolean).join(' ');

  const face = document.createElement('div');
  face.className = 'face';
  face.style.cssText = `background:${palette.face};border-radius:${getBorderRadius(shape)};`;
  if (shape === 'shield') face.style.setProperty('--face-rotate', 'none');
  wrapper.appendChild(face);

  if (hasBlush) {
    ['left', 'right'].forEach(side => {
      const b = document.createElement('div');
      b.className = `blush ${side}`;
      b.style.background = palette.accent;
      wrapper.appendChild(b);
    });
  }

  if (hasEarring) {
    ['left', 'right'].forEach(side => {
      const e = document.createElement('div');
      e.className = `earring ${side}`;
      e.style.background = palette.accent;
      wrapper.appendChild(e);
    });
  }

  const eyes = document.createElement('div');
  eyes.className = 'eyes';
  for (let i = 0; i < 2; i++) {
    const eye = document.createElement('div');
    const wink = i === 0 ? winkLeft : false;
    eye.className = wink ? 'eye wink' : 'eye';
    eye.style.transform = `scale(${eyeScale})`;
    eyes.appendChild(eye);
  }
  wrapper.appendChild(eyes);

  if (hasGlasses) {
    const glasses = document.createElement('div');
    glasses.className = 'accessory glasses';
    const l1 = document.createElement('div'); l1.className = 'lens';
    const br = document.createElement('div'); br.className = 'bridge';
    const l2 = document.createElement('div'); l2.className = 'lens';
    glasses.append(l1, br, l2);
    wrapper.appendChild(glasses);
  }

  const mouthEl = document.createElement('div');
  mouthEl.className = `mouth ${mouth}`;
  wrapper.appendChild(mouthEl);

  if (hasHat) {
    const uid = `hat-${seed.replace(/\W/g, '_')}`;
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
  const cx = 50, cy = 50, r = 42;

  let faceEl;
  if (shape === 'circle') faceEl = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${palette.face}"/>`;
  else if (shape === 'squircle') faceEl = `<rect x="${cx-r}" y="${cy-r}" width="${r*2}" height="${r*2}" rx="25" fill="${palette.face}"/>`;
  else if (shape === 'hexagon') faceEl = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${palette.face}"/>`;
  else if (shape === 'github') faceEl = `<rect x="${cx-r}" y="${cy-r}" width="${r*2}" height="${r*2}" rx="14" fill="${palette.face}"/>`;
  else faceEl = `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r*1.05}" fill="${palette.face}"/>`;

  const blushSVG = hasBlush
    ? `<ellipse cx="${cx-22}" cy="${cy+5}" rx="7" ry="4" fill="${palette.accent}" opacity="0.4"/>
       <ellipse cx="${cx+22}" cy="${cy+5}" rx="7" ry="4" fill="${palette.accent}" opacity="0.4"/>`
    : '';

  const earringSVG = hasEarring
    ? `<circle cx="${cx-r+2}" cy="${cy+10}" r="4" fill="${palette.accent}"/>
       <circle cx="${cx+r-2}" cy="${cy+10}" r="4" fill="${palette.accent}"/>`
    : '';

  const eyeL = winkLeft
    ? `<line x1="${cx-14}" y1="${cy-8}" x2="${cx-6}" y2="${cy-8}" stroke="#111" stroke-width="3" stroke-linecap="round"/>`
    : `<circle cx="${cx-10}" cy="${cy-8}" r="5" fill="#111"/><circle cx="${cx-8}" cy="${cy-10}" r="1.5" fill="rgba(255,255,255,0.7)"/>`;

  const eyeR = `<circle cx="${cx+10}" cy="${cy-8}" r="5" fill="#111"/><circle cx="${cx+12}" cy="${cy-10}" r="1.5" fill="rgba(255,255,255,0.7)"/>`;

  let mouthSVG;
  if (mouth === 'smile') mouthSVG = `<path d="M ${cx-13} ${cy+14} Q ${cx} ${cy+26} ${cx+13} ${cy+14}" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  else if (mouth === 'neutral') mouthSVG = `<line x1="${cx-10}" y1="${cy+18}" x2="${cx+10}" y2="${cy+18}" stroke="#111" stroke-width="3" stroke-linecap="round"/>`;
  else if (mouth === 'open') mouthSVG = `<ellipse cx="${cx}" cy="${cy+18}" rx="8" ry="7" fill="#111"/>`;
  else mouthSVG = `<path d="M ${cx} ${cy+14} Q ${cx+12} ${cy+22} ${cx+13} ${cy+14}" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>`;

  const glassesSVG = hasGlasses
    ? `<rect x="${cx-22}" y="${cy-14}" width="16" height="12" rx="3" stroke="rgba(0,0,0,0.5)" stroke-width="2" fill="none"/>
       <rect x="${cx+6}" y="${cy-14}" width="16" height="12" rx="3" stroke="rgba(0,0,0,0.5)" stroke-width="2" fill="none"/>
       <line x1="${cx-6}" y1="${cy-8}" x2="${cx+6}" y2="${cy-8}" stroke="rgba(0,0,0,0.4)" stroke-width="2"/>`
    : '';

  const hatSVG = hasHat
    ? `<rect x="${cx-22}" y="${cy-46}" width="44" height="16" rx="4" fill="${palette.accent}"/>
       <rect x="${cx-30}" y="${cy-32}" width="60" height="8" rx="4" fill="${palette.accent}"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
${faceEl}
${blushSVG}
${earringSVG}
${eyeL}
${eyeR}
${glassesSVG}
${mouthSVG}
${hatSVG}
</svg>`;
}

function avatarToGitHubSVG(seed) {
  const data = buildAvatarData(seed);
  const { palette, mouth, shape, hasGlasses, hasHat, hasBlush, hasEarring, winkLeft } = data;
  const cx = 200, cy = 200, r = 168;

  let faceEl;
  if (shape === 'circle') faceEl = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${palette.face}"/>`;
  else if (shape === 'squircle') faceEl = `<rect x="${cx-r}" y="${cy-r}" width="${r*2}" height="${r*2}" rx="100" fill="${palette.face}"/>`;
  else if (shape === 'hexagon') faceEl = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${palette.face}"/>`;
  else if (shape === 'github') faceEl = `<rect x="${cx-r}" y="${cy-r}" width="${r*2}" height="${r*2}" rx="68" fill="${palette.face}"/>`;
  else faceEl = `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r*1.05}" fill="${palette.face}"/>`;

  const blushSVG = hasBlush
    ? `<ellipse cx="${cx-88}" cy="${cy+20}" rx="28" ry="16" fill="${palette.accent}" opacity="0.4"/>
       <ellipse cx="${cx+88}" cy="${cy+20}" rx="28" ry="16" fill="${palette.accent}" opacity="0.4"/>`
    : '';

  const earringSVG = hasEarring
    ? `<circle cx="${cx-r+8}" cy="${cy+40}" r="16" fill="${palette.accent}"/>
       <circle cx="${cx+r-8}" cy="${cy+40}" r="16" fill="${palette.accent}"/>`
    : '';

  const eyeL = winkLeft
    ? `<line x1="${cx-56}" y1="${cy-32}" x2="${cx-24}" y2="${cy-32}" stroke="#111" stroke-width="12" stroke-linecap="round"/>`
    : `<circle cx="${cx-40}" cy="${cy-32}" r="20" fill="#111"/><circle cx="${cx-32}" cy="${cy-40}" r="6" fill="rgba(255,255,255,0.7)"/>`;

  const eyeR = `<circle cx="${cx+40}" cy="${cy-32}" r="20" fill="#111"/><circle cx="${cx+48}" cy="${cy-40}" r="6" fill="rgba(255,255,255,0.7)"/>`;

  let mouthSVG;
  if (mouth === 'smile') mouthSVG = `<path d="M ${cx-52} ${cy+56} Q ${cx} ${cy+104} ${cx+52} ${cy+56}" stroke="#111" stroke-width="12" fill="none" stroke-linecap="round"/>`;
  else if (mouth === 'neutral') mouthSVG = `<line x1="${cx-40}" y1="${cy+72}" x2="${cx+40}" y2="${cy+72}" stroke="#111" stroke-width="12" stroke-linecap="round"/>`;
  else if (mouth === 'open') mouthSVG = `<ellipse cx="${cx}" cy="${cy+72}" rx="32" ry="28" fill="#111"/>`;
  else mouthSVG = `<path d="M ${cx} ${cy+56} Q ${cx+48} ${cy+88} ${cx+52} ${cy+56}" stroke="#111" stroke-width="12" fill="none" stroke-linecap="round"/>`;

  const glassesSVG = hasGlasses
    ? `<rect x="${cx-88}" y="${cy-56}" width="64" height="48" rx="12" stroke="rgba(0,0,0,0.5)" stroke-width="8" fill="none"/>
       <rect x="${cx+24}" y="${cy-56}" width="64" height="48" rx="12" stroke="rgba(0,0,0,0.5)" stroke-width="8" fill="none"/>
       <line x1="${cx-24}" y1="${cy-32}" x2="${cx+24}" y2="${cy-32}" stroke="rgba(0,0,0,0.4)" stroke-width="8"/>`
    : '';

  const hatSVG = hasHat
    ? `<rect x="${cx-88}" y="${cy-184}" width="176" height="64" rx="16" fill="${palette.accent}"/>
       <rect x="${cx-120}" y="${cy-128}" width="240" height="32" rx="16" fill="${palette.accent}"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
${faceEl}
${blushSVG}
${earringSVG}
${eyeL}
${eyeR}
${glassesSVG}
${mouthSVG}
${hatSVG}
</svg>`;
}

function avatarToCSS(seed) {
  const data = buildAvatarData(seed);
  const { palette, shape, mouth, hasGlasses, hasHat, hasBlush } = data;
  const br = getBorderRadius(shape);

  return `<!-- Avatar: ${seed} -->
<div class="av-${seed.replace(/\W/g,'_')}">
  <div class="av-face"></div>
  ${hasBlush ? '<div class="av-blush av-blush--left"></div><div class="av-blush av-blush--right"></div>' : ''}
  <div class="av-eyes"><div class="av-eye"></div><div class="av-eye"></div></div>
  ${hasGlasses ? '<div class="av-glasses"><div class="av-lens"></div><div class="av-bridge"></div><div class="av-lens"></div></div>' : ''}
  <div class="av-mouth av-mouth--${mouth}"></div>
  ${hasHat ? '<div class="av-hat"></div>' : ''}
</div>

<style>
.av-${seed.replace(/\W/g,'_')} {
  position: relative;
  width: 80px;
  height: 80px;
}
.av-face {
  position: absolute;
  inset: 0;
  background: ${palette.face};
  border-radius: ${br};
}
.av-eyes {
  position: absolute;
  top: 32%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
}
.av-eye {
  width: 9px;
  height: 9px;
  background: #111;
  border-radius: 50%;
}
.av-mouth--smile {
  position: absolute;
  bottom: 24%;
  left: 50%;
  transform: translateX(-50%);
  width: 26px;
  height: 13px;
  border: 3px solid #111;
  border-top: none;
  border-radius: 0 0 26px 26px;
}
.av-mouth--neutral {
  position: absolute;
  bottom: 24%;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #111;
  border-radius: 2px;
}
.av-mouth--open {
  position: absolute;
  bottom: 24%;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 12px;
  background: #111;
  border-radius: 50%;
}
.av-mouth--smirk {
  position: absolute;
  bottom: 24%;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  height: 10px;
  border: 3px solid #111;
  border-top: none;
  border-left: none;
  border-radius: 0 0 18px 0;
}
.av-blush {
  position: absolute;
  top: 46%;
  width: 12px;
  height: 7px;
  border-radius: 50%;
  background: ${palette.accent};
  opacity: 0.4;
}
.av-blush--left { left: 10%; }
.av-blush--right { right: 10%; }
.av-glasses {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 3px;
  align-items: center;
}
.av-lens {
  width: 16px;
  height: 13px;
  border: 2.5px solid rgba(0,0,0,0.5);
  border-radius: 4px;
}
.av-bridge {
  width: 5px;
  height: 2px;
  background: rgba(0,0,0,0.4);
}
.av-hat {
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 20px;
}
.av-hat::before {
  content: '';
  display: block;
  position: absolute;
  bottom: 0;
  left: -5px;
  width: 60px;
  height: 7px;
  border-radius: 4px;
  background: ${palette.accent};
}
.av-hat::after {
  content: '';
  display: block;
  position: absolute;
  bottom: 7px;
  left: 7px;
  width: 36px;
  height: 16px;
  border-radius: 4px 4px 0 0;
  background: ${palette.accent};
}
</style>`;
}

function avatarToReact(seed) {
  const data = buildAvatarData(seed);
  const { palette, shape, mouth, hasGlasses, hasHat, hasBlush, hasEarring, winkLeft } = data;
  const br = getBorderRadius(shape);
  const compName = `Avatar${seed.replace(/[^a-zA-Z0-9]/g, '')}`;

  return `export function ${compName}() {
  return (
    <div style={{ position:'relative', width:80, height:80 }}>
      <div style={{ position:'absolute', inset:0, background:'${palette.face}', borderRadius:'${br}' }} />
      ${hasBlush ? `<div style={{ position:'absolute', top:'46%', left:'10%', width:12, height:7, borderRadius:'50%', background:'${palette.accent}', opacity:0.4 }} />
      <div style={{ position:'absolute', top:'46%', right:'10%', width:12, height:7, borderRadius:'50%', background:'${palette.accent}', opacity:0.4 }} />` : ''}
      ${hasEarring ? `<div style={{ position:'absolute', top:'52%', left:-4, width:7, height:7, borderRadius:'50%', background:'${palette.accent}' }} />
      <div style={{ position:'absolute', top:'52%', right:-4, width:7, height:7, borderRadius:'50%', background:'${palette.accent}' }} />` : ''}
      <div style={{ position:'absolute', top:'32%', left:'50%', transform:'translateX(-50%)', display:'flex', gap:12 }}>
        <div style={{ width:9, height:${winkLeft ? 3 : 9}, background:'#111', borderRadius:${winkLeft ? 2 : '\'50%\''} }} />
        <div style={{ width:9, height:9, background:'#111', borderRadius:'50%' }} />
      </div>
      ${hasGlasses ? `<div style={{ position:'absolute', top:'30%', left:'50%', transform:'translateX(-50%)', display:'flex', gap:3, alignItems:'center' }}>
        <div style={{ width:16, height:13, border:'2.5px solid rgba(0,0,0,0.5)', borderRadius:4 }} />
        <div style={{ width:5, height:2, background:'rgba(0,0,0,0.4)' }} />
        <div style={{ width:16, height:13, border:'2.5px solid rgba(0,0,0,0.5)', borderRadius:4 }} />
      </div>` : ''}
      ${mouth === 'smile' ? `<div style={{ position:'absolute', bottom:'24%', left:'50%', transform:'translateX(-50%)', width:26, height:13, border:'3px solid #111', borderTop:'none', borderRadius:'0 0 26px 26px' }} />` : ''}
      ${mouth === 'neutral' ? `<div style={{ position:'absolute', bottom:'24%', left:'50%', transform:'translateX(-50%)', width:20, height:3, background:'#111', borderRadius:2 }} />` : ''}
      ${mouth === 'open' ? `<div style={{ position:'absolute', bottom:'24%', left:'50%', transform:'translateX(-50%)', width:16, height:12, background:'#111', borderRadius:'50%' }} />` : ''}
      ${mouth === 'smirk' ? `<div style={{ position:'absolute', bottom:'24%', left:'50%', transform:'translateX(-50%)', width:18, height:10, border:'3px solid #111', borderTop:'none', borderLeft:'none', borderRadius:'0 0 18px 0' }} />` : ''}
      ${hasHat ? `<div style={{ position:'absolute', top:-5, left:'50%', transform:'translateX(-50%)', width:50, height:20 }}>
        <div style={{ position:'absolute', bottom:0, left:-5, width:60, height:7, borderRadius:4, background:'${palette.accent}' }} />
        <div style={{ position:'absolute', bottom:7, left:7, width:36, height:16, borderRadius:'4px 4px 0 0', background:'${palette.accent}' }} />
      </div>` : ''}
    </div>
  );
}`;
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
      showToast('SVG copied!');
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
    { label: 'Wink', value: data.winkLeft ? 'Left eye' : 'None' },
  ];
  fields.forEach(({ label, value }) => {
    const pill = document.createElement('div');
    pill.className = 'info-pill';
    pill.innerHTML = `<div class="pill-label">${label}</div><div class="pill-value">${value}</div>`;
    info.appendChild(pill);
  });
}

const SHOWCASE_SEEDS = [
  'Alice','Bob','Charlie','Diana','Eve','Frank',
  'Grace','Hank','Iris','Jack','Kara','Leo',
  'Mia','Nate','Olivia','Pete','Quinn','Rosa',
  'Sam','Tina','Uri','Vera','Will','Xena',
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
      document.getElementById('clear-btn').classList.add('visible');
      updateSingleView(seed);
      generateGrid(seed);
      switchTab('single');
    });
    grid.appendChild(card);
  });
}

function buildBattle() {
  const seedA = document.getElementById('battle-a').value.trim() || 'Alice';
  const seedB = document.getElementById('battle-b').value.trim() || 'Bob';
  const wrapA = document.getElementById('battle-avatar-a');
  const wrapB = document.getElementById('battle-avatar-b');
  wrapA.innerHTML = '';
  wrapB.innerHTML = '';
  document.getElementById('battle-score-a').textContent = '';
  document.getElementById('battle-score-b').textContent = '';
  document.getElementById('battle-result').textContent = '';
  wrapA.classList.remove('winner','loser');
  wrapB.classList.remove('winner','loser');
  wrapA.appendChild(buildAvatar(seedA, true).el);
  wrapB.appendChild(buildAvatar(seedB, true).el);
}

function runBattle() {
  const seedA = document.getElementById('battle-a').value.trim() || 'Alice';
  const seedB = document.getElementById('battle-b').value.trim() || 'Bob';
  const scoreA = hash(seedA);
  const scoreB = hash(seedB);
  const wrapA = document.getElementById('battle-avatar-a');
  const wrapB = document.getElementById('battle-avatar-b');
  document.getElementById('battle-score-a').textContent = `Power: ${(scoreA % 9999).toLocaleString()}`;
  document.getElementById('battle-score-b').textContent = `Power: ${(scoreB % 9999).toLocaleString()}`;
  if (scoreA > scoreB) {
    wrapA.classList.add('winner');
    wrapB.classList.add('loser');
    document.getElementById('battle-result').textContent = `🏆 ${seedA} wins!`;
  } else if (scoreB > scoreA) {
    wrapB.classList.add('winner');
    wrapA.classList.add('loser');
    document.getElementById('battle-result').textContent = `🏆 ${seedB} wins!`;
  } else {
    document.getElementById('battle-result').textContent = "It's a draw!";
  }
}

function buildCompare() {
  const seedA = document.getElementById('compare-a').value.trim() || 'Alice';
  const seedB = document.getElementById('compare-b').value.trim() || 'Bob';
  const wrapA = document.getElementById('compare-avatar-a');
  const wrapB = document.getElementById('compare-avatar-b');
  const traitsA = document.getElementById('compare-traits-a');
  const traitsB = document.getElementById('compare-traits-b');
  wrapA.innerHTML = '';
  wrapB.innerHTML = '';
  traitsA.innerHTML = '';
  traitsB.innerHTML = '';

  const { el: elA, data: dA } = buildAvatar(seedA, true);
  const { el: elB, data: dB } = buildAvatar(seedB, true);
  wrapA.appendChild(elA);
  wrapB.appendChild(elB);

  const fields = [
    ['Palette', dA.palette.name, dB.palette.name],
    ['Shape', SHAPE_NAMES[dA.shape], SHAPE_NAMES[dB.shape]],
    ['Mouth', dA.mouth, dB.mouth],
    ['Glasses', dA.hasGlasses ? 'Yes' : 'No', dB.hasGlasses ? 'Yes' : 'No'],
    ['Hat', dA.hasHat ? 'Yes' : 'No', dB.hasHat ? 'Yes' : 'No'],
    ['Blush', dA.hasBlush ? 'Yes' : 'No', dB.hasBlush ? 'Yes' : 'No'],
    ['Earring', dA.hasEarring ? 'Yes' : 'No', dB.hasEarring ? 'Yes' : 'No'],
  ];

  fields.forEach(([key, valA, valB]) => {
    const diff = valA !== valB;
    [traitsA, traitsB].forEach((container, idx) => {
      const row = document.createElement('div');
      row.className = diff ? 'trait-row diff' : 'trait-row';
      row.innerHTML = `<span class="trait-key">${key}</span><span class="trait-val">${idx === 0 ? valA : valB}</span>`;
      container.appendChild(row);
    });
  });
}

function buildPFPView(seed) {
  const wrap = document.getElementById('pfp-avatar-wrap');
  const preview = document.getElementById('pfp-preview-svg');
  wrap.innerHTML = '';
  preview.innerHTML = '';
  const { el, data } = buildAvatar(seed, true);
  wrap.appendChild(el);
  preview.innerHTML = avatarToGitHubSVG(seed);
  document.getElementById('pfp-info').textContent =
    `${data.palette.name} · ${SHAPE_NAMES[data.shape]} · ${data.mouth}`;
}

function downloadAvatarAsPNG(seed, size = 400) {
  const svg = avatarToGitHubSVG(seed);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, size, size);
    URL.revokeObjectURL(url);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `pfp-${seed}.png`;
    a.click();
    showToast('PNG downloaded!');
  };
  img.src = url;
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${name}`));
  if (name === 'battle') buildBattle();
  if (name === 'compare') buildCompare();
  if (name === 'pfp') buildPFPView(input.value.trim() || 'default');
}

function getSeedFromURL() {
  return new URLSearchParams(window.location.search).get('seed') || '';
}

function setSeedInURL(seed) {
  const url = new URL(window.location.href);
  if (seed) url.searchParams.set('seed', seed);
  else url.searchParams.delete('seed');
  window.history.replaceState(null, '', url.toString());
}

function buildAOTD() {
  const today = new Date();
  const daySeed = `aotd-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const wrap = document.getElementById('aotd-avatar');
  const label = document.getElementById('aotd-seed');
  wrap.innerHTML = '';
  const { el } = buildAvatar(daySeed);
  wrap.appendChild(el);
  label.textContent = daySeed;
}

const input = document.getElementById('seed-input');
const clearBtn = document.getElementById('clear-btn');

input.addEventListener('input', () => {
  const val = input.value.trim();
  clearBtn.classList.toggle('visible', val.length > 0);
  setSeedInURL(val);
  if (val.length > 0) {
    generateGrid(val);
    updateSingleView(val);
  } else {
    generateGrid('');
    updateSingleView('default');
  }
  if (document.querySelector('.tab[data-tab="pfp"]').classList.contains('active')) {
    buildPFPView(val || 'default');
  }
});

clearBtn.addEventListener('click', () => {
  input.value = '';
  clearBtn.classList.remove('visible');
  setSeedInURL('');
  generateGrid('');
  updateSingleView('default');
  if (document.querySelector('.tab[data-tab="pfp"]').classList.contains('active')) {
    buildPFPView('default');
  }
});

document.getElementById('randomize-btn').addEventListener('click', () => {
  const r = Math.random().toString(36).slice(2, 8);
  input.value = r;
  clearBtn.classList.add('visible');
  setSeedInURL(r);
  generateGrid(r);
  updateSingleView(r);
  if (document.querySelector('.tab[data-tab="pfp"]').classList.contains('active')) {
    buildPFPView(r);
  }
});

document.getElementById('export-svg-btn').addEventListener('click', () => {
  const val = input.value.trim() || 'default';
  const blob = new Blob([avatarToSVG(val)], { type: 'image/svg+xml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `avatar-${val}.svg`;
  a.click();
  showToast('SVG downloaded!');
});

document.getElementById('export-css-btn').addEventListener('click', () => {
  const val = input.value.trim() || 'default';
  navigator.clipboard.writeText(avatarToCSS(val));
  showToast('CSS + HTML copied to clipboard!');
});

document.getElementById('export-react-btn').addEventListener('click', () => {
  const val = input.value.trim() || 'default';
  navigator.clipboard.writeText(avatarToReact(val));
  showToast('React component copied!');
});

document.getElementById('share-btn').addEventListener('click', () => {
  const val = input.value.trim() || 'default';
  setSeedInURL(val);
  navigator.clipboard.writeText(window.location.href);
  showToast('Link copied to clipboard!');
});

document.getElementById('theme-toggle').addEventListener('click', () => {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  document.getElementById('theme-toggle').textContent = next === 'dark' ? '☀' : '☾';
  localStorage.setItem('av-theme', next);
});

document.getElementById('anim-toggle').addEventListener('click', () => {
  animationsEnabled = !animationsEnabled;
  document.getElementById('anim-toggle').style.color = animationsEnabled ? 'var(--accent)' : '';
  const val = input.value.trim() || 'default';
  generateGrid(val);
  updateSingleView(val);
  buildAOTD();
  showToast(animationsEnabled ? 'Animations on' : 'Animations off');
});

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

document.getElementById('battle-btn').addEventListener('click', runBattle);

['battle-a', 'battle-b'].forEach(id => {
  document.getElementById(id).addEventListener('input', buildBattle);
});

['compare-a', 'compare-b'].forEach(id => {
  document.getElementById(id).addEventListener('input', buildCompare);
});

document.getElementById('pfp-download-btn').addEventListener('click', () => {
  const val = input.value.trim() || 'default';
  downloadAvatarAsPNG(val, 400);
});

document.getElementById('pfp-copy-btn').addEventListener('click', () => {
  const val = input.value.trim() || 'default';
  navigator.clipboard.writeText(avatarToGitHubSVG(val));
  showToast('SVG copied to clipboard!');
});

const savedTheme = localStorage.getItem('av-theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.getElementById('theme-toggle').textContent = savedTheme === 'dark' ? '☀' : '☾';
}

const urlSeed = getSeedFromURL();
if (urlSeed) {
  input.value = urlSeed;
  clearBtn.classList.add('visible');
}

buildAOTD();
generateGrid(urlSeed || 'default');
updateSingleView(urlSeed || 'default');
buildShowcase();
