import { REALMS, NASA_ARTIFACTS, NASA_RESOURCES, SPACECRAFT_COMPONENTS } from './data.js';
import { Horizon3DEngine, ModelInspector3D } from './moon3d.js';

// =========================================================================
// 1. APPLICATION STATE
// =========================================================================
let currentRealm = 'moon';
let currentIndex = 0;
let activeTab = 'story';
let selectedGalleryIdx = 0;
let carouselDirection = 'none';
let isStoryExpanded = false;
let horizon3d = null;
let inspector3d = null;
let toastTimer = 0;

function getRealmArtifacts(realm = currentRealm) {
  return NASA_ARTIFACTS.filter((item) => item.realm === realm);
}

function getActiveArtifact() {
  const list = getRealmArtifacts();
  return list[currentIndex] || list[0];
}

// Curated official NASA domain links (only *.nasa.gov) for interactive hover tooltips in prose
const NASA_INLINE_LINK_RULES = [
  { re: /\bLaser Ranging Retroreflector\b|\bLRRR\b/, url: 'https://science.nasa.gov/mission/apollo/lunar-laser-ranging/', tip: 'NASA Science · Lunar Laser Ranging' },
  { re: /\bLunar Roving Vehicle\b|\bMoon rover\b|\bLRV-3\b|\bLRV\b/, url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C', tip: 'NASA NSSDCA · Apollo 15 & LRV' },
  { re: /\bALSEP\b/, url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C', tip: 'NASA NSSDCA · Apollo 15 ALSEP' },
  { re: /\bApollo 11\b|\bSea of Tranquility\b/, url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C', tip: 'NASA NSSDCA · Apollo 11 Eagle' },
  { re: /\bApollo 12\b|\bSurveyor 3\b/, url: 'https://www.nasa.gov/mission/apollo-12/', tip: 'NASA · Apollo 12 & Surveyor 3' },
  { re: /\bApollo 15\b|\bMare Imbrium\b/, url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C', tip: 'NASA NSSDCA · Apollo 15 Falcon' },
  { re: /\bApollo 16\b|\bFar-UV\b/, url: 'https://www.nasa.gov/mission/apollo-16/', tip: 'NASA · Apollo 16 Mission' },
  { re: /\bApollo 17\b|\bTaurus[–-]Littrow\b/, url: 'https://www.nasa.gov/mission/apollo-17/', tip: 'NASA · Apollo 17 Mission' },
  { re: /\bLCROSS\b|\bBlue Ghost\b/, url: 'https://science.nasa.gov/lunar-science/clps-deliveries/to19d-firefly/', tip: 'NASA · Lunar Poles & CLPS' },
  { re: /\bViking 1\b|\bChryse Planitia\b/, url: 'https://science.nasa.gov/mission/viking-1/', tip: 'NASA Science · Viking 1 Lander' },
  { re: /\bMars Pathfinder\b|\bSojourner\b|\bAres Vallis\b|\bAPXS\b/, url: 'https://science.nasa.gov/mission/mars-pathfinder/', tip: 'NASA Science · Mars Pathfinder' },
  { re: /\bOpportunity\b|\bSpirit\b|\bMeridiani Planum\b|\bGusev Crater\b/, url: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/', tip: 'NASA Science · Spirit & Opportunity' },
  { re: /\bInSight\b|\bSEIS\b|\bElysium Planitia\b/, url: 'https://science.nasa.gov/mission/insight/', tip: 'NASA Science · InSight Mars Lander' },
  { re: /\bIngenuity\b|\bJezero Crater\b|\bPerseverance\b/, url: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/', tip: 'NASA Science · Ingenuity Helicopter' },
  { re: /\bPioneer 10\b|\bPioneer Plaque\b/, url: 'https://science.nasa.gov/mission/pioneer-10/', tip: 'NASA Science · Pioneer 10' },
  { re: /\bGolden Record\b/, url: 'https://science.nasa.gov/mission/voyager/voyager-golden-record/', tip: 'NASA Science · Voyager Golden Record' },
  { re: /\bVoyager 1\b|\bheliopause\b|\bPale Blue Dot\b/, url: 'https://science.nasa.gov/mission/voyager/voyager-1/', tip: 'NASA Science · Voyager 1' },
  { re: /\bVoyager 2\b/, url: 'https://science.nasa.gov/mission/voyager/voyager-2/', tip: 'NASA Science · Voyager 2' },
  { re: /\bCassini\b|\bHuygens\b|\bTitan\b|\bEnceladus\b/, url: 'https://science.nasa.gov/mission/cassini/', tip: 'NASA Science · Cassini–Huygens' },
  { re: /\bNew Horizons\b|\bSputnik Planitia\b|\bArrokoth\b|\bKuiper Belt\b/, url: 'https://science.nasa.gov/mission/new-horizons/', tip: 'NASA Science · New Horizons' },
  { re: /\bDeep Space Network\b/, url: 'https://www.nasa.gov/directorates/somd/space-communications-navigation-program/deep-space-network/', tip: 'NASA · Deep Space Network' }
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function enrichWithNasaLinks(rawText, maxLinks = 3) {
  const str = String(rawText || '');
  if (!str) return '';
  const candidates = [];
  const usedUrls = new Set();
  for (const rule of NASA_INLINE_LINK_RULES) {
    if (usedUrls.has(rule.url)) continue;
    const m = rule.re.exec(str);
    if (m) {
      candidates.push({ start: m.index, end: m.index + m[0].length, text: m[0], url: rule.url, tip: rule.tip });
      usedUrls.add(rule.url);
    }
  }
  candidates.sort((a, b) => a.start - b.start);
  const picked = [];
  let cursor = 0;
  for (const c of candidates) {
    if (c.start < cursor) continue;
    picked.push(c);
    cursor = c.end;
    if (picked.length >= maxLinks) break;
  }
  if (!picked.length) return escapeHtml(str);
  let out = '';
  let pos = 0;
  for (const c of picked) {
    if (c.start > pos) out += escapeHtml(str.slice(pos, c.start));
    out += `<a href="${escapeHtml(c.url)}" target="_blank" rel="noopener noreferrer" class="nasa-inline-link" data-nasa-tip="${escapeHtml(c.tip)} ↗">${escapeHtml(c.text)}</a>`;
    pos = c.end;
  }
  if (pos < str.length) out += escapeHtml(str.slice(pos));
  return out;
}

// =========================================================================
// 2. TOAST NOTIFICATION HELPER
// =========================================================================
function showToast(msg) {
  const box = document.getElementById('toast-box');
  const text = document.getElementById('toast-message');
  if (!box || !text) return;

  text.textContent = msg;
  box.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    box.classList.remove('is-visible');
  }, 3600);
}

// =========================================================================
// 3. TWINKLING MULTI-LAYERED STARFIELD WITH 4-POINT CROSS FLARES
// =========================================================================
const starCanvas = document.getElementById('starfield-canvas');
const starCtx = starCanvas ? starCanvas.getContext('2d') : null;
let stars = [];
let starRafId = 0;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initStars() {
  if (!starCanvas || !starCtx) return;
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;

  const count = Math.min(480, Math.floor((starCanvas.width * starCanvas.height) / 3200));
  stars = [];

  const starColors = ['#FFFFFF', '#E0F2FE', '#BAE6FD', '#FEF3C7', '#C7D2FE'];
  for (let i = 0; i < count; i++) {
    const isBright = Math.random() > 0.88;
    stars.push({
      x: Math.random() * starCanvas.width,
      y: Math.random() * (starCanvas.height * 0.85), // concentrated in sky above horizon
      radius: isBright ? Math.random() * 1.6 + 1.1 : Math.random() * 0.95 + 0.35,
      baseAlpha: isBright ? Math.random() * 0.35 + 0.65 : Math.random() * 0.55 + 0.2,
      twinkleSpeed: Math.random() * 0.025 + 0.006,
      twinklePhase: Math.random() * Math.PI * 2,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      hasCrossFlare: isBright && Math.random() > 0.55
    });
  }
}

function drawStarsFrame(time = 0) {
  if (!starCanvas || !starCtx) return;
  starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);

  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const alpha = prefersReducedMotion.matches
      ? s.baseAlpha
      : s.baseAlpha + Math.sin(time * 0.002 + s.twinklePhase) * 0.25;
    const clampedAlpha = Math.max(0.1, Math.min(1, alpha));

    starCtx.save();
    starCtx.globalAlpha = clampedAlpha;
    starCtx.fillStyle = s.color;

    starCtx.beginPath();
    starCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    starCtx.fill();

    // 4-point diffraction spikes on bright stars
    if (s.hasCrossFlare) {
      starCtx.strokeStyle = s.color;
      starCtx.lineWidth = 0.7;
      const flareLen = s.radius * 4.2;
      starCtx.beginPath();
      starCtx.moveTo(s.x - flareLen, s.y);
      starCtx.lineTo(s.x + flareLen, s.y);
      starCtx.moveTo(s.x, s.y - flareLen);
      starCtx.lineTo(s.x, s.y + flareLen);
      starCtx.stroke();
    }
    starCtx.restore();
  }
}

function tickStars(time) {
  if (document.hidden) {
    starRafId = 0;
    return;
  }
  drawStarsFrame(time);
  if (!prefersReducedMotion.matches) {
    starRafId = requestAnimationFrame(tickStars);
  } else {
    starRafId = 0;
  }
}

function startStarfield() {
  initStars();
  drawStarsFrame(0);
  if (!prefersReducedMotion.matches && !document.hidden && !starRafId) {
    starRafId = requestAnimationFrame(tickStars);
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden && starRafId) {
    cancelAnimationFrame(starRafId);
    starRafId = 0;
  } else if (!document.hidden && !prefersReducedMotion.matches && !starRafId) {
    starRafId = requestAnimationFrame(tickStars);
  }
});

window.addEventListener('resize', () => {
  initStars();
  drawStarsFrame(performance.now());
});

// =========================================================================
// 4. DYNAMIC REALM RADAR MAP BACKDROPS (MOON / MARS / UNIVERSE)
// =========================================================================
function renderMapBackdrop(realm) {
  const backdrop = document.getElementById('map-backdrop-layer');
  if (!backdrop) return;

  if (realm === 'moon') {
    backdrop.innerHTML = `
      <!-- Radar Grid Lines -->
      <g stroke="rgba(56, 189, 248, 0.12)" stroke-width="0.7" stroke-dasharray="2 3">
        <line x1="160" y1="8" x2="160" y2="212" />
        <line x1="35" y1="110" x2="285" y2="110" />
        <circle cx="160" cy="110" r="96" fill="none" />
        <circle cx="160" cy="110" r="64" fill="none" />
        <circle cx="160" cy="110" r="32" fill="none" />
      </g>

      <!-- Moon Nearside Sphere -->
      <circle cx="160" cy="110" r="92" fill="url(#moonDiscGrad)" stroke="rgba(148, 163, 184, 0.35)" stroke-width="1.2" />

      <!-- Authentic Lunar Maria (Dark Basalt Plains) -->
      <g fill="rgba(15, 23, 42, 0.62)">
        <!-- Oceanus Procellarum -->
        <path d="M98,65 C84,82 86,118 106,132 C122,142 132,124 126,104 C121,88 115,55 98,65 Z" />
        <!-- Mare Imbrium -->
        <ellipse cx="136" cy="68" rx="22" ry="18" transform="rotate(-15 136 68)" />
        <!-- Mare Serenitatis -->
        <ellipse cx="176" cy="76" rx="16" ry="14" />
        <!-- Mare Tranquillitatis -->
        <path d="M182,92 C196,90 212,102 206,116 C198,126 180,122 178,108 Z" />
        <!-- Mare Crisium -->
        <ellipse cx="226" cy="84" rx="9" ry="11" />
        <!-- Mare Nubium -->
        <ellipse cx="134" cy="144" rx="18" ry="13" />
      </g>

      <!-- Subtle Crater Rings (Tycho, Copernicus, Aristarchus) -->
      <g fill="none" stroke="rgba(203, 213, 225, 0.28)" stroke-width="0.9">
        <circle cx="144" cy="168" r="5" />
        <circle cx="122" cy="102" r="4.5" />
        <circle cx="95" cy="78" r="3" />
      </g>
    `;
  } else if (realm === 'mars') {
    backdrop.innerHTML = `
      <!-- Mars Orbital Grid -->
      <g stroke="rgba(251, 146, 60, 0.14)" stroke-width="0.7" stroke-dasharray="2 3">
        <line x1="160" y1="8" x2="160" y2="212" />
        <line x1="35" y1="110" x2="285" y2="110" />
        <circle cx="160" cy="110" r="96" fill="none" />
        <circle cx="160" cy="110" r="64" fill="none" />
        <circle cx="160" cy="110" r="32" fill="none" />
      </g>

      <!-- Rusty Mars Globe -->
      <circle cx="160" cy="110" r="92" fill="url(#marsDiscGrad)" stroke="rgba(251, 146, 60, 0.42)" stroke-width="1.2" />

      <!-- Martian Albedo & Topographic Features -->
      <g fill="rgba(28, 10, 5, 0.55)">
        <!-- Acidalia Planitia / Chryse Trough -->
        <ellipse cx="126" cy="68" rx="20" ry="13" transform="rotate(-18 126 68)" />
        <!-- Syrtis Major Dark Shield -->
        <path d="M180,82 C192,86 196,108 184,118 C174,114 172,94 180,82 Z" />
        <!-- Hellas Impact Basin -->
        <ellipse cx="192" cy="154" rx="18" ry="12" />
      </g>

      <!-- Valles Marineris Canyon System -->
      <path d="M108,118 Q132,123 156,119" fill="none" stroke="rgba(254, 215, 170, 0.38)" stroke-width="2.2" stroke-linecap="round" />

      <!-- Olympus Mons & Tharsis Montes Volcano Rings + Jezero -->
      <g fill="none" stroke="rgba(253, 186, 116, 0.4)" stroke-width="1">
        <circle cx="88" cy="88" r="7.5" />
        <circle cx="88" cy="88" r="2.2" />
        <circle cx="102" cy="100" r="3.5" />
        <circle cx="108" cy="108" r="3.5" />
        <circle cx="188" cy="82" r="4" />
      </g>

      <g fill="rgba(253, 186, 116, 0.55)" font-family="JetBrains Mono, monospace" font-size="6">
        <text x="72" y="77">OLYMPUS MONS</text>
        <text x="104" y="132">VALLES MARINERIS</text>
        <text x="176" y="169">HELLAS BASIN</text>
      </g>
    `;
  } else {
    backdrop.innerHTML = `
      <!-- Deep Space Heliocentric & Interstellar Radar Backdrop -->
      <circle cx="160" cy="110" r="98" fill="url(#universeDiscGrad)" stroke="rgba(167, 139, 250, 0.35)" stroke-width="1.1" />

      <!-- Crosshairs -->
      <g stroke="rgba(148, 163, 184, 0.14)" stroke-width="0.7" stroke-dasharray="2 3">
        <line x1="160" y1="6" x2="160" y2="214" />
        <line x1="25" y1="110" x2="295" y2="110" />
      </g>

      <!-- Concentric Heliocentric Shells: Inner Planets, Jupiter/Saturn, Kuiper Belt, Heliopause -->
      <circle cx="160" cy="110" r="18" fill="none" stroke="rgba(56, 189, 248, 0.25)" stroke-width="0.8" />
      <circle cx="160" cy="110" r="40" fill="none" stroke="rgba(56, 189, 248, 0.3)" stroke-width="0.9" stroke-dasharray="3 2" />
      <circle cx="160" cy="110" r="64" fill="none" stroke="rgba(167, 139, 250, 0.38)" stroke-width="1.2" stroke-dasharray="4 3" />
      <circle cx="160" cy="110" r="88" fill="none" stroke="rgba(52, 211, 153, 0.42)" stroke-width="1.3" />

      <!-- Trajectory Escape Vectors from the Sun -->
      <g stroke="rgba(251, 191, 36, 0.24)" stroke-width="0.9" stroke-dasharray="2 2">
        <line x1="160" y1="110" x2="98" y2="66" />
        <line x1="160" y1="110" x2="222" y2="46" />
        <line x1="160" y1="110" x2="208" y2="174" />
        <line x1="160" y1="110" x2="148" y2="142" />
        <line x1="160" y1="110" x2="182" y2="122" />
      </g>

      <!-- Central Sun Star -->
      <circle cx="160" cy="110" r="4.2" fill="#FDE047" filter="url(#glowAmber)" />

      <!-- Shell Labels -->
      <g fill="rgba(199, 210, 254, 0.62)" font-family="JetBrains Mono, monospace" font-size="5.8">
        <text x="165" y="96">INNER PLANETS</text>
        <text x="122" y="73">JUPITER / SATURN</text>
        <text x="126" y="49">KUIPER BELT (30–60 AU)</text>
        <text x="112" y="26" fill="rgba(110, 231, 183, 0.78)">HELIOPAUSE (121 AU)</text>
      </g>
    `;
  }
}

// =========================================================================
// 5. SYNCHRONIZED MAP PINS, INDICATOR DOTS & STORY TABS
// =========================================================================
function updateRealmCounts() {
  const moonCount = document.getElementById('count-moon');
  const marsCount = document.getElementById('count-mars');
  const universeCount = document.getElementById('count-universe');

  if (moonCount) moonCount.textContent = String(getRealmArtifacts('moon').length);
  if (marsCount) marsCount.textContent = String(getRealmArtifacts('mars').length);
  if (universeCount) universeCount.textContent = String(getRealmArtifacts('universe').length);
}

function renderMapPins() {
  const layer = document.getElementById('map-pins-layer');
  if (!layer) return;
  layer.innerHTML = '';

  const artifacts = getRealmArtifacts();

  artifacts.forEach((item, idx) => {
    const isActive = idx === currentIndex;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'map-pin-group');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `${item.title} (${item.coords})`);
    g.addEventListener('click', () => {
      window.dismissCoachmark?.('tutorial-map-coachmark');
      selectMission(idx);
    });
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.dismissCoachmark?.('tutorial-map-coachmark');
        selectMission(idx);
      }
    });

    // Touch-friendly hit area
    const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hitArea.setAttribute('cx', String(item.mapX));
    hitArea.setAttribute('cy', String(item.mapY));
    hitArea.setAttribute('r', '14');
    hitArea.setAttribute('fill', 'transparent');
    g.appendChild(hitArea);

    if (isActive) {
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', String(item.mapX));
      ring.setAttribute('cy', String(item.mapY));
      ring.setAttribute('r', '7');
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', '#FBBF24');
      ring.setAttribute('stroke-width', '1.8');
      ring.setAttribute('class', 'beacon-ring');
      g.appendChild(ring);
    }

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', String(item.mapX));
    dot.setAttribute('cy', String(item.mapY));
    dot.setAttribute('r', isActive ? '5' : '3.4');
    dot.setAttribute('fill', isActive ? '#FBBF24' : '#38BDF8');
    dot.setAttribute('stroke', '#040711');
    dot.setAttribute('stroke-width', '1.2');
    if (isActive) dot.setAttribute('filter', 'url(#glowAmber)');
    g.appendChild(dot);

    // Label next to pin (clamp x so right-edge pins remain inside viewBox)
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const placeLeft = item.mapX > 225;
    label.setAttribute('x', String(placeLeft ? item.mapX - 7 : item.mapX + 7));
    label.setAttribute('y', String(item.mapY + 3));
    if (placeLeft) label.setAttribute('text-anchor', 'end');
    label.setAttribute('fill', isActive ? '#FEF08A' : '#94A3B8');
    label.setAttribute('font-size', isActive ? '8' : '6.8');
    label.setAttribute('font-family', 'JetBrains Mono, monospace');
    label.setAttribute('font-weight', isActive ? '700' : '500');
    label.textContent = (item.code || item.id).toUpperCase();
    g.appendChild(label);

    layer.appendChild(g);
  });

  // Update indicator dots between Previous / Next arrows
  const dotsContainer = document.getElementById('mission-dots');
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    artifacts.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', `Artifact ${idx + 1}: ${item.title}`);
      btn.className = `mission-dot-btn${idx === currentIndex ? ' is-active' : ''}`;
      btn.addEventListener('click', () => selectMission(idx));
      dotsContainer.appendChild(btn);
    });
  }
}

function getArtifactGallery(item) {
  if (Array.isArray(item.gallery) && item.gallery.length > 0) {
    return item.gallery;
  }
  return item.image
    ? [
        {
          src: item.image,
          title: item.title,
          badge: '📸 NASA Archive Photo',
          credit: `${item.imageCredit || 'NASA'} · ${item.imageId || ''}`
        }
      ]
    : [];
}

function openPhotoLightbox(photo) {
  if (!photo || !photo.src) return;
  const modal = document.getElementById('photo-lightbox-modal');
  const img = document.getElementById('lightbox-photo-img');
  const title = document.getElementById('lightbox-photo-title');
  const badge = document.getElementById('lightbox-photo-badge');
  const credit = document.getElementById('lightbox-photo-credit');

  if (img) {
    img.src = photo.src;
    img.alt = photo.title || 'NASA Mission Photograph';
  }
  if (title) title.textContent = photo.title || 'NASA Mission Photograph';
  if (badge) badge.textContent = photo.badge || '📸 Official NASA Photograph';
  if (credit) credit.textContent = `Credit: ${photo.credit || 'NASA Official Archive'}`;

  if (!modal) return;
  if (typeof modal.showModal === 'function') {
    if (!modal.open) modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }
}

function renderStoryContent() {
  const artifacts = getRealmArtifacts();
  const item = getActiveArtifact();
  if (!item) return;

  document.body.classList.toggle('is-story-expanded', isStoryExpanded);

  const yearBadge = document.getElementById('mission-year-badge');
  const titleEl = document.getElementById('mission-title');
  const mapCoords = document.getElementById('map-coords');
  const regionName = document.getElementById('map-region-name');
  const counterEl = document.getElementById('mission-counter');

  if (yearBadge) yearBadge.textContent = item.year;
  if (titleEl) titleEl.textContent = item.title;
  if (mapCoords) mapCoords.textContent = item.coords;
  if (regionName) regionName.textContent = item.region;
  if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${artifacts.length}`;

  const contentArea = document.getElementById('story-content-area');
  if (!contentArea) return;

  const gallery = getArtifactGallery(item);
  const activePhoto = gallery[selectedGalleryIdx] || gallery[0];
  const slideAnimClass =
    carouselDirection === 'next' ? ' anim-next' : carouselDirection === 'prev' ? ' anim-prev' : '';
  carouselDirection = 'none';

  const heroGalleryHtml = activePhoto
    ? `
      <div class="photo-carousel-wrap" aria-label="NASA Mission Photo Carousel">
        <div class="photo-carousel-viewport">
          <button type="button" class="photo-carousel-slide-btn${slideAnimClass}" id="hero-photo-open-btn" title="Click to view full-size NASA photograph">
            <img
              src="${activePhoto.src}"
              alt="${activePhoto.title}"
              class="photo-carousel-img"
            />
            <span class="hero-photo-badge">${activePhoto.badge || 'NASA Archive Photo'}</span>
            <span class="hero-photo-zoom-pill">Zoom</span>
            <div class="hero-photo-caption-bar">
              <span class="hero-photo-title">${activePhoto.title}</span>
              <span class="hero-photo-credit">${activePhoto.credit || 'NASA'}</span>
            </div>
          </button>
          ${
            gallery.length > 1
              ? `
                <button type="button" id="photo-carousel-prev-btn" class="photo-carousel-nav-btn photo-carousel-prev" aria-label="Previous NASA Photo" title="Previous Photo">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <button type="button" id="photo-carousel-next-btn" class="photo-carousel-nav-btn photo-carousel-next" aria-label="Next NASA Photo" title="Next Photo">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              `
              : ''
          }
        </div>
        ${
          gallery.length > 1
            ? `
              <div class="photo-carousel-footer">
                <div class="photo-carousel-dots" role="group" aria-label="Choose NASA Photo">
                  ${gallery
                    .map(
                      (p, idx) => `
                        <button
                          type="button"
                          class="photo-carousel-dot${idx === selectedGalleryIdx ? ' is-active' : ''}"
                          data-gallery-idx="${idx}"
                          aria-label="Photo ${idx + 1}: ${p.title}"
                          title="${p.title}"
                        ></button>
                      `
                    )
                    .join('')}
                </div>
                <span class="photo-carousel-counter">Photo ${selectedGalleryIdx + 1} / ${gallery.length}</span>
              </div>
            `
            : ''
        }
      </div>
    `
    : '';

  const funFactHtml = item.kidFunFact
    ? `<div class="kid-fun-fact-card">${enrichWithNasaLinks(item.kidFunFact, 2)}</div>`
    : '';

  const sourceFooterHtml = item.sourceUrl
    ? `
      <div class="official-source-bar">
        <span>Official Archive:</span>
        <a href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer" class="official-source-link">
          ${item.sourceTitle || 'NASA Mission Page'} ↗
        </a>
      </div>
    `
    : '';

  if (activeTab === 'story') {
    const shortSummaryText = item.shortSummary || item.story[0] || '';
    contentArea.innerHTML = `
      <div class="story-stack">
        ${heroGalleryHtml}
        ${funFactHtml}
        <div class="kid-short-summary-box">
          <div class="kid-short-summary-header">
            <span class="kid-summary-pill">Quick Summary</span>
            <span class="kid-summary-coords">${item.region}</span>
          </div>
          <p class="kid-short-summary-text">${enrichWithNasaLinks(shortSummaryText, 2)}</p>
          <button
            type="button"
            id="toggle-story-expand-btn"
            class="read-more-toggle-btn"
            aria-expanded="${isStoryExpanded ? 'true' : 'false'}"
          >
            <span>${isStoryExpanded ? 'Show Summary' : 'Read Full Story'}</span>
          </button>
        </div>
        ${
          isStoryExpanded
            ? `
              <div class="story-full-expanded-box">
                <div class="story-location-banner">
                  Coordinates: ${item.region} · ${item.coords}
                </div>
                ${item.story
                  .map(
                    (paragraph, i) => `
                      <p class="${i === 0 ? 'story-lead-paragraph' : 'story-body-paragraph'}">${enrichWithNasaLinks(paragraph, 3)}</p>
                    `
                  )
                  .join('')}
                ${sourceFooterHtml}
              </div>
            `
            : ''
        }
      </div>
    `;
  } else if (activeTab === 'tech') {
    contentArea.innerHTML = `
      <div class="story-stack">
        ${heroGalleryHtml}
        <div class="tech-card">
          <div class="tech-label tech-label-sky">Remaining NASA Hardware</div>
          <div class="tech-value-strong">${enrichWithNasaLinks(item.tech.hardware, 2)}</div>
        </div>
        <div class="tech-grid-2">
          <div class="tech-card">
            <div class="tech-label tech-label-amber">Mass</div>
            <div class="tech-value">${escapeHtml(item.tech.mass)}</div>
          </div>
          <div class="tech-card">
            <div class="tech-label tech-label-amber">Dimensions</div>
            <div class="tech-value">${escapeHtml(item.tech.dimensions)}</div>
          </div>
        </div>
        <button
          type="button"
          id="toggle-story-expand-btn"
          class="read-more-toggle-btn"
          aria-expanded="${isStoryExpanded ? 'true' : 'false'}"
        >
          <span>${isStoryExpanded ? '🔼 Hide Space Survival Details' : '🛠️ Read More Engineering Details (+ Expand)'}</span>
        </button>
        ${
          isStoryExpanded
            ? `
              <div class="story-full-expanded-box">
                <div class="tech-card">
                  <div class="tech-label tech-label-emerald">Condition in Space Vacuum</div>
                  <p class="tech-value">${enrichWithNasaLinks(item.tech.survival, 2)}</p>
                </div>
                ${sourceFooterHtml}
              </div>
            `
            : ''
        }
      </div>
    `;
  } else if (activeTab === 'science') {
    const firstFact = item.science[0] || '';
    const extraFacts = item.science.slice(1);
    contentArea.innerHTML = `
      <div class="story-stack">
        ${heroGalleryHtml}
        <div class="science-kicker">
          Top Discovery:
        </div>
        <div class="science-fact-card">
          <span class="science-star" aria-hidden="true">✦</span>
          <p>${enrichWithNasaLinks(firstFact, 2)}</p>
        </div>
        ${
          extraFacts.length > 0
            ? `
              <button
                type="button"
                id="toggle-story-expand-btn"
                class="read-more-toggle-btn"
                aria-expanded="${isStoryExpanded ? 'true' : 'false'}"
              >
                <span>${isStoryExpanded ? '🔼 Show Fewer Science Facts' : `🔬 Read ${extraFacts.length} More Discoveries (+ Expand)`}</span>
              </button>
            `
            : ''
        }
        ${
          isStoryExpanded
            ? `
              <div class="story-full-expanded-box">
                ${extraFacts
                  .map(
                    (fact) => `
                      <div class="science-fact-card">
                        <span class="science-star" aria-hidden="true">✦</span>
                        <p>${enrichWithNasaLinks(fact, 2)}</p>
                      </div>
                    `
                  )
                  .join('')}
                ${sourceFooterHtml}
              </div>
            `
            : ''
        }
      </div>
    `;
  }

  // Bind Read More / Expand Toggle Button (smoothly expands floating window + scrolls down to new content)
  document.getElementById('toggle-story-expand-btn')?.addEventListener('click', () => {
    isStoryExpanded = !isStoryExpanded;
    const storyPanel = document.getElementById('story-hud-panel');
    if (storyPanel && storyPanel.classList.contains('is-custom-positioned')) {
      const targetH = isStoryExpanded
        ? Math.min(window.innerHeight - 36, Math.max(storyPanel.getBoundingClientRect().height + 180, 680))
        : 520;
      storyPanel.style.height = `${Math.round(targetH)}px`;
    }

    renderStoryContent();

    if (isStoryExpanded) {
      window.setTimeout(() => {
        const expandedBox = contentArea.querySelector('.story-full-expanded-box');
        if (expandedBox) {
          expandedBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 170);
    } else {
      contentArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Bind Carousel Lightbox, Prev/Next Arrows & Indicator Dots
  document.getElementById('hero-photo-open-btn')?.addEventListener('click', () => {
    openPhotoLightbox(activePhoto);
  });

  document.getElementById('photo-carousel-prev-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    carouselDirection = 'prev';
    selectedGalleryIdx = (selectedGalleryIdx - 1 + gallery.length) % gallery.length;
    renderStoryContent();
  });

  document.getElementById('photo-carousel-next-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    carouselDirection = 'next';
    selectedGalleryIdx = (selectedGalleryIdx + 1) % gallery.length;
    renderStoryContent();
  });

  contentArea.querySelectorAll('[data-gallery-idx]').forEach((dotBtn) => {
    dotBtn.addEventListener('click', () => {
      const nextIdx = Number(dotBtn.getAttribute('data-gallery-idx')) || 0;
      if (nextIdx !== selectedGalleryIdx) {
        carouselDirection = nextIdx > selectedGalleryIdx ? 'next' : 'prev';
        selectedGalleryIdx = nextIdx;
        renderStoryContent();
      }
    });
  });
}

function selectMission(index) {
  const artifacts = getRealmArtifacts();
  if (!artifacts.length) return;

  currentIndex = ((index % artifacts.length) + artifacts.length) % artifacts.length;
  selectedGalleryIdx = 0;
  carouselDirection = 'none';
  isStoryExpanded = false;
  document.body.classList.remove('is-story-expanded');
  const item = artifacts[currentIndex];

  if (horizon3d) {
    horizon3d.setArtifact({
      id: item.id,
      artifactType: item.artifactType,
      horizonAngle: item.horizonAngle,
      lat: item.lat,
      lon: item.lon
    });
  }

  renderMapPins();
  renderStoryContent();
}

function selectRealm(realmId) {
  if (!REALMS[realmId]) return;
  currentRealm = realmId;
  currentIndex = 0;

  const realmMeta = REALMS[realmId];

  // Update realm switcher buttons
  document.querySelectorAll('[data-realm]').forEach((btn) => {
    const isSelected = btn.dataset.realm === realmId;
    btn.classList.toggle('is-active', isSelected);
    btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  });

  // Update HUD labels for active realm
  const archiveBadge = document.getElementById('realm-archive-badge');
  const horizonLabel = document.getElementById('horizon-realm-label');
  const mapCardTitle = document.getElementById('map-card-title');

  if (archiveBadge) archiveBadge.textContent = realmMeta.badge;
  if (horizonLabel) horizonLabel.textContent = realmMeta.subtitle;
  if (mapCardTitle) mapCardTitle.textContent = realmMeta.mapTitle;

  renderMapBackdrop(realmId);

  document.body.classList.toggle('is-universe-mode', realmId === 'universe');

  if (horizon3d) {
    horizon3d.setRealm(realmId);
    horizon3d.resize();
  }

  selectMission(0);
}

// =========================================================================
// 6. NASA SOURCES MODAL (<dialog>)
// =========================================================================
function initSourcesModal() {
  const listEl = document.getElementById('sources-modal-list');
  const countBadge = document.getElementById('sources-count-badge');
  const modal = document.getElementById('sources-modal');
  const openBtn = document.getElementById('open-sources-btn');
  const closeBtnTop = document.getElementById('close-sources-btn');
  const closeBtnBottom = document.getElementById('close-sources-btn-bottom');

  if (countBadge) {
    countBadge.textContent = String(NASA_RESOURCES.length + NASA_ARTIFACTS.length);
  }

  if (listEl) {
    const resourceCards = NASA_RESOURCES.map(
      (res, idx) => `
        <div class="source-item-card">
          <div class="source-item-title">${idx + 1}. ${res.id} — ${res.title}</div>
          <p class="source-item-desc">${res.credits}</p>
          <a href="${res.url}" target="_blank" rel="noopener noreferrer" class="source-item-link">
            ${res.url} ↗
          </a>
          ${res.directUrl && res.directUrl !== res.url ? `
          <a href="${res.directUrl}" target="_blank" rel="noopener noreferrer" class="source-item-link">
            ${res.directUrl} ↗
          </a>` : ''}
        </div>
      `
    ).join('');

    const artifactLinks = NASA_ARTIFACTS.map(
      (art) => `
        <div class="source-item-card">
          <div class="source-item-title">[${art.realm.toUpperCase()}] ${art.title} (${art.year})</div>
          <p class="source-item-desc">Region: ${art.region} (${art.coords}) · Image Credit: ${art.imageCredit} (${art.imageId})</p>
          <a href="${art.sourceUrl}" target="_blank" rel="noopener noreferrer" class="source-item-link">
            ${art.sourceTitle}: ${art.sourceUrl} ↗
          </a>
        </div>
      `
    ).join('');

    listEl.innerHTML = resourceCards + artifactLinks;
  }

  if (!modal) return;

  const openModal = () => {
    if (typeof modal.showModal === 'function') {
      if (!modal.open) modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }
  };

  const closeModal = () => {
    if (typeof modal.close === 'function') {
      if (modal.open) modal.close();
    } else {
      modal.removeAttribute('open');
    }
  };

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtnTop) closeBtnTop.addEventListener('click', closeModal);
  if (closeBtnBottom) closeBtnBottom.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

// =========================================================================
// 6B. LAYOUT CUSTOMIZER (MOVE / RESIZE / RESET) & VISUAL TUTORIALS
// =========================================================================
function initLayoutCustomizerAndTutorials() {
  const toggleLayoutBtn = document.getElementById('toggle-layout-edit-btn');
  const layoutBtnLabel = document.getElementById('layout-edit-btn-label');
  const resetLayoutBtn = document.getElementById('reset-layout-btn');
  const openTutorialBtn = document.getElementById('open-tutorial-btn');
  const tutorialModal = document.getElementById('tutorial-modal');
  const closeTutorialTop = document.getElementById('close-tutorial-btn');
  const closeTutorialBottom = document.getElementById('close-tutorial-btn-bottom');
  const tutorialEnableCustomizeBtn = document.getElementById('tutorial-enable-customize-btn');

  const setCustomizingMode = (enabled, silent = false) => {
    document.body.classList.toggle('is-customizing-layout', enabled);
    if (toggleLayoutBtn) {
      toggleLayoutBtn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    }
    if (layoutBtnLabel) {
      layoutBtnLabel.textContent = enabled ? 'Done Customizing ✓' : 'Customize Layout';
    }
    if (!silent) {
      if (enabled) {
        showToast('✥ Layout Edit Mode: Drag any top bar (✥) to move or bottom-right corner (⤡) to resize!');
      } else {
        showToast('✓ Custom layout locked. Click "↺ Reset Default" anytime to restore.');
      }
    }
  };

  if (toggleLayoutBtn) {
    toggleLayoutBtn.addEventListener('click', () => {
      const next = !document.body.classList.contains('is-customizing-layout');
      setCustomizingMode(next);
    });
  }

  const ensureWindowCustomPositioned = (winEl) => {
    if (!winEl) return null;
    const rect = winEl.getBoundingClientRect();
    if (!winEl.classList.contains('is-custom-positioned')) {
      winEl.style.left = `${Math.round(rect.left)}px`;
      winEl.style.top = `${Math.round(rect.top)}px`;
      winEl.style.width = `${Math.round(rect.width)}px`;
      winEl.style.height = `${Math.round(rect.height)}px`;
      winEl.style.right = 'auto';
      winEl.style.bottom = 'auto';
      winEl.classList.add('is-custom-positioned');
    }
    return winEl.getBoundingClientRect();
  };

  // Drag Handles (Move window anywhere)
  document.querySelectorAll('[data-drag-handle]').forEach((handleEl) => {
    handleEl.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();
      e.stopPropagation();

      const winId = handleEl.getAttribute('data-drag-handle');
      const winEl = document.querySelector(`[data-window-id="${winId}"]`);
      if (!winEl) return;

      const startRect = ensureWindowCustomPositioned(winEl);
      const startX = e.clientX;
      const startY = e.clientY;
      const origLeft = startRect.left;
      const origTop = startRect.top;

      try {
        if (e.pointerId) handleEl.setPointerCapture?.(e.pointerId);
      } catch (_) {}

      const onMove = (moveEv) => {
        const dx = moveEv.clientX - startX;
        const dy = moveEv.clientY - startY;
        const nextLeft = Math.max(-startRect.width + 80, Math.min(window.innerWidth - 80, origLeft + dx));
        const nextTop = Math.max(0, Math.min(window.innerHeight - 60, origTop + dy));
        winEl.style.left = `${Math.round(nextLeft)}px`;
        winEl.style.top = `${Math.round(nextTop)}px`;
        if (winId === 'stage3d' && horizon3d) {
          horizon3d.resize();
        }
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    });
  });

  // Resize Handles (Resize window as large or small as desired)
  document.querySelectorAll('[data-resize-handle]').forEach((resizeEl) => {
    resizeEl.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();
      e.stopPropagation();

      const winId = resizeEl.getAttribute('data-resize-handle');
      const winEl = document.querySelector(`[data-window-id="${winId}"]`);
      if (!winEl) return;

      const startRect = ensureWindowCustomPositioned(winEl);
      const startX = e.clientX;
      const startY = e.clientY;
      const origW = startRect.width;
      const origH = startRect.height;

      try {
        if (e.pointerId) resizeEl.setPointerCapture?.(e.pointerId);
      } catch (_) {}

      const onMove = (moveEv) => {
        const dx = moveEv.clientX - startX;
        const dy = moveEv.clientY - startY;
        const nextW = Math.max(240, Math.min(window.innerWidth - 12, origW + dx));
        const nextH = Math.max(170, Math.min(window.innerHeight - 12, origH + dy));
        winEl.style.width = `${Math.round(nextW)}px`;
        winEl.style.height = `${Math.round(nextH)}px`;
        if (winId === 'stage3d' && horizon3d) {
          horizon3d.resize();
        }
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    });
  });

  // Reset Layout to Default
  if (resetLayoutBtn) {
    resetLayoutBtn.addEventListener('click', () => {
      document.querySelectorAll('[data-window-id]').forEach((winEl) => {
        winEl.classList.remove('is-custom-positioned');
        winEl.style.left = '';
        winEl.style.top = '';
        winEl.style.right = '';
        winEl.style.bottom = '';
        winEl.style.width = '';
        winEl.style.height = '';
      });
      setCustomizingMode(false, true);
      if (horizon3d) {
        horizon3d.targetZoomZ = 7.2;
        horizon3d.targetRotX = 0;
        horizon3d.setFullGlobeMode(false, false);
        horizon3d.resize();
      }
      document.getElementById('tutorial-3d-coachmark')?.classList.remove('is-hidden');
      document.getElementById('tutorial-map-coachmark')?.classList.remove('is-hidden');
      showToast('↺ Layout, panels & 3D camera reset to default!');
    });
  }

  // Toggle Full Globe (Hover Bottom or Click)
  const toggleFullGlobeBtn = document.getElementById('toggle-full-globe-btn');
  if (toggleFullGlobeBtn) {
    toggleFullGlobeBtn.addEventListener('click', () => {
      if (!horizon3d) return;
      const isCentered = horizon3d.toggleFullGlobeMode();
      showToast(
        isCentered
          ? '🌕 Full Globe Centered! Move mouse up or click again to lower the Moon back down.'
          : '🌙 Moon lowered back to the bottom horizon.'
      );
    });
  }

  const dismissCoachmark = (targetId) => {
    if (!targetId) return;
    document.getElementById(targetId)?.classList.add('is-hidden');
    try {
      localStorage.setItem(`cr_coachmark_${targetId}`, '1');
    } catch (_) {}
  };
  window.dismissCoachmark = dismissCoachmark;

  // Restore previously completed/dismissed coachmarks
  ['tutorial-3d-coachmark', 'tutorial-map-coachmark'].forEach((id) => {
    try {
      if (localStorage.getItem(`cr_coachmark_${id}`) === '1') {
        document.getElementById(id)?.classList.add('is-hidden');
      }
    } catch (_) {}
  });

  // Visual Tutorial Coachmark Dismiss Buttons
  document.querySelectorAll('[data-dismiss-coachmark]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissCoachmark(btn.getAttribute('data-dismiss-coachmark'));
    });
  });

  // Auto-dismiss 3D coachmark when user orbits or zooms the 3D stage
  const stageContainer = document.getElementById('moon-3d-container');
  if (stageContainer) {
    let stagePointerStart = null;
    stageContainer.addEventListener('pointerdown', (e) => {
      stagePointerStart = { x: e.clientX, y: e.clientY };
    });
    stageContainer.addEventListener('pointermove', (e) => {
      if (!stagePointerStart) return;
      if (Math.hypot(e.clientX - stagePointerStart.x, e.clientY - stagePointerStart.y) > 8) {
        stagePointerStart = null;
        dismissCoachmark('tutorial-3d-coachmark');
      }
    });
    window.addEventListener('pointerup', () => {
      stagePointerStart = null;
    });
    stageContainer.addEventListener('wheel', () => dismissCoachmark('tutorial-3d-coachmark'), { passive: true });
  }

  // Visual Interactive Guide Modal
  const openTutorialModal = () => {
    ['tutorial-3d-coachmark', 'tutorial-map-coachmark'].forEach((id) => {
      document.getElementById(id)?.classList.remove('is-hidden');
      try {
        localStorage.removeItem(`cr_coachmark_${id}`);
      } catch (_) {}
    });
    if (!tutorialModal) return;
    if (typeof tutorialModal.showModal === 'function') {
      if (!tutorialModal.open) tutorialModal.showModal();
    } else {
      tutorialModal.setAttribute('open', '');
    }
  };

  const closeTutorialModal = () => {
    if (!tutorialModal) return;
    if (typeof tutorialModal.close === 'function') {
      if (tutorialModal.open) tutorialModal.close();
    } else {
      tutorialModal.removeAttribute('open');
    }
  };

  openTutorialBtn?.addEventListener('click', openTutorialModal);
  closeTutorialTop?.addEventListener('click', closeTutorialModal);
  closeTutorialBottom?.addEventListener('click', closeTutorialModal);
  tutorialEnableCustomizeBtn?.addEventListener('click', () => {
    closeTutorialModal();
    setCustomizingMode(true);
  });
  tutorialModal?.addEventListener('click', (e) => {
    if (e.target === tutorialModal) closeTutorialModal();
  });

  // Photo Lightbox Modal Close
  const lightboxModal = document.getElementById('photo-lightbox-modal');
  const closeLightboxBtn = document.getElementById('close-lightbox-btn');
  const closeLightbox = () => {
    if (!lightboxModal) return;
    if (typeof lightboxModal.close === 'function') {
      if (lightboxModal.open) lightboxModal.close();
    } else {
      lightboxModal.removeAttribute('open');
    }
  };
  closeLightboxBtn?.addEventListener('click', closeLightbox);
  lightboxModal?.addEventListener('click', (e) => {
    if (e.target === lightboxModal) closeLightbox();
  });
}

function openModelInspector() {
  const modal = document.getElementById('model-inspector-modal');
  const item = getActiveArtifact();
  if (!modal || !item || !horizon3d) return;

  const { geom, isOfficial } = horizon3d.getActiveMonumentGeom();
  const titleEl = document.getElementById('inspector-modal-title');
  const kickerEl = document.getElementById('inspector-model-kicker');
  const partsListEl = document.getElementById('inspector-parts-list');
  const spinBtn = document.getElementById('inspector-autospin-btn');
  const stageHintEl = modal.querySelector('.inspector-stage-hint');
  const defaultHintText = 'Drag to rotate 360° · Scroll to zoom · Click a part on the right to focus';

  if (titleEl) titleEl.textContent = item.title;
  if (kickerEl) {
    kickerEl.textContent = isOfficial
      ? 'Official NASA 3D Model (Comic Cel-Shaded) · Click Parts to Focus'
      : 'Detailed Comic 3D Spacecraft · Click Parts to Focus';
  }

  const parts = SPACECRAFT_COMPONENTS[item.id] || [];
  if (partsListEl) {
    partsListEl.replaceChildren();
    parts.forEach((p, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'inspector-part-card';
      btn.dataset.partIdx = String(idx);

      const titleRow = document.createElement('div');
      titleRow.className = 'inspector-part-title-row';

      const swatch = document.createElement('span');
      swatch.className = 'inspector-part-swatch';
      swatch.style.background = p.color;

      const nameEl = document.createElement('span');
      nameEl.className = 'inspector-part-name';
      nameEl.textContent = p.name;

      const descEl = document.createElement('p');
      descEl.className = 'inspector-part-desc';
      descEl.textContent = p.desc;

      titleRow.append(swatch, nameEl);
      btn.append(titleRow, descEl);

      btn.addEventListener('click', () => {
        if (!inspector3d) return;
        const wasSelected = btn.classList.contains('is-selected');
        partsListEl.querySelectorAll('.inspector-part-card').forEach((c) => c.classList.remove('is-selected'));
        if (wasSelected) {
          inspector3d.resetView();
          if (spinBtn) {
            spinBtn.disabled = false;
            spinBtn.setAttribute('aria-pressed', 'true');
          }
          if (stageHintEl) stageHintEl.textContent = defaultHintText;
          return;
        }
        btn.classList.add('is-selected');
        inspector3d.focusPart({
          yaw: p.yaw,
          pitch: p.pitch,
          zoom: p.zoom,
          pos: p.pos || null,
          anchor: p.anchor || null,
          glbPos: p.glbPos || null,
          glbAnchor: p.glbAnchor || null,
          glbMatch: p.glbMatch || null,
          color: p.color || null,
          name: p.name
        });
        if (spinBtn) {
          spinBtn.disabled = true;
          spinBtn.setAttribute('aria-pressed', 'false');
        }
        if (stageHintEl) {
          stageHintEl.textContent = '🔒 Rotation locked on component · Scroll to zoom · Click part again to exit focus';
        }
      });

      partsListEl.appendChild(btn);
    });
  }

  if (!modal.open) {
    modal.showModal();
  }

  if (!inspector3d) {
    const pinEl = document.getElementById('inspector-callout-pin');
    const pinLabelEl = document.getElementById('inspector-callout-label');
    inspector3d = new ModelInspector3D(document.getElementById('inspector-3d-canvas'), (proj) => {
      if (!pinEl) return;
      if (!proj || !proj.visible || !proj.label) {
        pinEl.hidden = true;
        return;
      }
      pinEl.hidden = false;
      pinEl.style.left = `${Math.round(proj.x)}px`;
      pinEl.style.top = `${Math.round(proj.y)}px`;
      if (pinLabelEl && pinLabelEl.textContent !== proj.label) {
        pinLabelEl.textContent = proj.label;
      }
    });
  }
  if (geom) {
    inspector3d.setGeometry(geom);
  }
  if (spinBtn) {
    spinBtn.disabled = false;
    spinBtn.setAttribute('aria-pressed', 'true');
  }
  if (stageHintEl) stageHintEl.textContent = defaultHintText;
  inspector3d.start();
}

function initModelInspector() {
  const modal = document.getElementById('model-inspector-modal');
  const closeBtn = document.getElementById('close-inspector-btn');
  const resetBtn = document.getElementById('inspector-reset-btn');
  const spinBtn = document.getElementById('inspector-autospin-btn');
  const stageHintEl = modal?.querySelector('.inspector-stage-hint');
  const defaultHintText = 'Drag to rotate 360° · Scroll to zoom · Click a part on the right to focus';
  const openBtn = document.getElementById('open-inspector-btn');

  openBtn?.addEventListener('click', openModelInspector);
  closeBtn?.addEventListener('click', () => modal?.close());
  modal?.addEventListener('close', () => {
    inspector3d?.stop();
  });

  resetBtn?.addEventListener('click', () => {
    inspector3d?.resetView();
    if (spinBtn) {
      spinBtn.disabled = false;
      spinBtn.setAttribute('aria-pressed', 'true');
    }
    if (stageHintEl) stageHintEl.textContent = defaultHintText;
    document.querySelectorAll('#inspector-parts-list .inspector-part-card').forEach((c) => {
      c.classList.remove('is-selected');
    });
  });

  spinBtn?.addEventListener('click', () => {
    if (!inspector3d || inspector3d.rotationLocked) return;
    inspector3d.autoSpin = !inspector3d.autoSpin;
    spinBtn.setAttribute('aria-pressed', inspector3d.autoSpin ? 'true' : 'false');
  });
}

// =========================================================================
// 7. EVENT WIRING & INITIALIZATION
// =========================================================================
function initApp() {
  startStarfield();
  updateRealmCounts();
  initSourcesModal();
  initModelInspector();
  initLayoutCustomizerAndTutorials();

  // Initialize 3D Horizon Engine
  horizon3d = new Horizon3DEngine({
    container: document.getElementById('moon-3d-container'),
    canvas: document.getElementById('horizon-3d-canvas'),
    onInspectArtifact: () => {
      openModelInspector();
    },
    onGlobeModeChange: (isFullGlobe) => {
      if (isFullGlobe && typeof window.dismissCoachmark === 'function') {
        window.dismissCoachmark('tutorial-3d-coachmark');
      }
      const btn = document.getElementById('toggle-full-globe-btn');
      const label = document.getElementById('full-globe-btn-label');
      if (btn) {
        btn.setAttribute('aria-pressed', isFullGlobe ? 'true' : 'false');
      }
      if (label) {
        label.textContent = isFullGlobe
          ? 'Lower Globe ↓'
          : 'Full Globe';
      }
    },
  });

  horizon3d.init();

  // Realm Switcher Buttons (Moon / Mars / Universe)
  document.querySelectorAll('[data-realm]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectRealm(btn.dataset.realm);
    });
  });

  // Tab Switching (The Story / Engineering / Science)
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab || 'story';
      document.querySelectorAll('.tab-btn').forEach((b) => {
        const isCurrent = b === btn;
        b.classList.toggle('is-active', isCurrent);
        b.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });
      renderStoryContent();
    });
  });

  // Arrow Navigation Controls (under Map + on Story Header + Keyboard)
  document.getElementById('map-prev-btn')?.addEventListener('click', () => {
    if (typeof window.dismissCoachmark === 'function') window.dismissCoachmark('tutorial-map-coachmark');
    selectMission(currentIndex - 1);
  });
  document.getElementById('map-next-btn')?.addEventListener('click', () => {
    if (typeof window.dismissCoachmark === 'function') window.dismissCoachmark('tutorial-map-coachmark');
    selectMission(currentIndex + 1);
  });
  document.getElementById('story-prev-btn')?.addEventListener('click', () => selectMission(currentIndex - 1));
  document.getElementById('story-next-btn')?.addEventListener('click', () => selectMission(currentIndex + 1));

  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    const modal = document.getElementById('sources-modal');
    if (modal && modal.open) return;

    if (e.key === 'ArrowLeft') {
      selectMission(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      selectMission(currentIndex + 1);
    }
  });

  // Initial Realm & First Artifact Selection
  selectRealm('moon');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
