const PLACEHOLDERS = {
  logo: "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="16" fill="#1a365d"/>
      <text x="48" y="58" text-anchor="middle" font-size="36" fill="#c9a227">✂</text>
    </svg>`
  ),
  owner: "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1a365d"/><stop offset="100%" stop-color="#2c5282"/>
      </linearGradient></defs>
      <rect width="400" height="500" fill="url(#g)"/>
      <circle cx="200" cy="180" r="70" fill="#ffffff33"/>
      <circle cx="200" cy="160" r="36" fill="#fff"/>
      <ellipse cx="200" cy="260" rx="55" ry="40" fill="#fff"/>
      <text x="200" y="380" text-anchor="middle" font-size="22" fill="#c9a227" font-family="sans-serif">Tailor</text>
    </svg>`
  ),
  about: "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2c5282"/><stop offset="100%" stop-color="#1a365d"/>
      </linearGradient></defs>
      <rect width="400" height="500" fill="url(#g)"/>
      <text x="200" y="240" text-anchor="middle" font-size="64">🏪</text>
      <text x="200" y="320" text-anchor="middle" font-size="20" fill="#c9a227" font-family="sans-serif">Our Shop</text>
    </svg>`
  ),
  service: "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#edf2f7"/>
      <text x="150" y="100" text-anchor="middle" font-size="40">✂️</text>
    </svg>`
  ),
  gallery: "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#e2e8f0"/>
      <text x="150" y="145" text-anchor="middle" font-size="48">📷</text>
      <text x="150" y="190" text-anchor="middle" font-size="14" fill="#718096" font-family="sans-serif">Our Work</text>
    </svg>`
  )
};

function safeImg(el, src, fallbackKey) {
  if (!el) return;
  const fallback = PLACEHOLDERS[fallbackKey] || PLACEHOLDERS.gallery;
  if (!src) {
    el.src = fallback;
    el.style.display = 'block';
    return;
  }
  el.onerror = () => {
    el.onerror = null;
    el.src = fallback;
  };
  el.src = src;
  el.style.display = 'block';
}

window.PLACEHOLDERS = PLACEHOLDERS;
window.safeImg = safeImg;
